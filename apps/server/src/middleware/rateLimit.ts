/**
 * Rate Limiting Middleware for Ember Galaxies
 *
 * In this game, Rate-Limits ARE the "Physics". Agents cannot spam actions —
 * every command has a cooldown cost enforced by these limits.
 *
 * - Global: 60 req/min per user (identified by playerId or IP)
 * - Heavy Actions: 5 req/min (fleet/launch, building/upgrade, research/start, shipyard/build)
 */

import type { Context, Next } from 'hono';
import type { Env, MiddlewareHandler } from 'hono';

// --- Constants ---

export const GLOBAL_LIMIT = 60;       // requests per window
export const GLOBAL_WINDOW_MS = 60_000; // 1 minute in ms

export const HEAVY_LIMIT = 5;         // requests per window
export const HEAVY_WINDOW_MS = 60_000; // 1 minute in ms

// Endpoints that count as "Heavy Actions"
export const HEAVY_PATTERNS: RegExp[] = [
  /^\/api\/fleet\/launch$/,
  /^\/api\/building\/.*\/upgrade$/,
  /^\/api\/research\/start$/,
  /^\/api\/shipyard\/build$/,
];

// --- In-Memory Store ---
// Structure: Map<key, { count: number, resetAt: number }>
// Key = playerId (authenticated) or IP (fallback)
// Prepared for Redis migration: extract to an adapter interface

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp when window resets
}

interface RateLimitStore {
  get(key: string): RateLimitEntry | undefined;
  set(key: string, entry: RateLimitEntry): void;
  cleanup(): void; // called periodically to prevent memory bloat
}

class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly maxAgeMs: number = 300_000) {
    // Run cleanup every 60s
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);
  }

  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now - this.maxAgeMs) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

// Singleton stores per limit type
const globalStore = new InMemoryRateLimitStore();
const heavyStore = new InMemoryRateLimitStore();

// --- Key Resolution ---

/**
 * Extracts the user key for rate limiting.
 * Priority: Authorization header (playerId) > X-Forwarded-For > IP
 */
function getRateLimitKey(c: Context): string {
  // Try Authorization header first (playerId for authenticated routes)
  const auth = c.req.header('Authorization');
  if (auth) {
    // Expect "Bearer <playerId>" or "Player <playerId>"
    const playerId = auth.replace(/^(Bearer|Player)\s+/i, '').trim();
    if (playerId && playerId.length > 0) {
      return `player:${playerId}`;
    }
  }

  // Fallback to IP
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`;
  }

  return `ip:${c.req.header('x-real-ip') ?? 'unknown'}`;
}

/**
 * Checks if the current request path matches a heavy action pattern.
 */
function isHeavyAction(path: string): boolean {
  return HEAVY_PATTERNS.some((pattern) => pattern.test(path));
}

/**
 * Global rate limiter: 60 requests per minute per user.
 * Applied early in the chain, before route handlers.
 */
export function globalRateLimit(): MiddlewareHandler<Env> {
  return async (c: Context, next: Next) => {
    const key = getRateLimitKey(c);
    const now = Date.now();
    const windowReset = now + GLOBAL_WINDOW_MS;

    let entry = globalStore.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: windowReset };
      globalStore.set(key, entry);
    } else {
      entry.count++;
    }

    const remaining = GLOBAL_LIMIT - entry.count;
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

    if (remaining < 0) {
      return c.body(
        JSON.stringify({
          error: 'Cooldown active',
          message: 'Temporal distortion field detected. Your neural link is throttled.',
          retryAfter,
          limit: GLOBAL_LIMIT,
          remaining: 0,
        }),
        429,
        {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(GLOBAL_LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        }
      );
    }

    await next();
  };
}

/**
 * Heavy action rate limiter: 5 requests per minute per user.
 * Applied only to mutation-heavy endpoints (fleet launch, building upgrades, etc.).
 */
export function heavyRateLimit(): MiddlewareHandler<Env> {
  return async (c: Context, next: Next) => {
    const path = c.req.path;

    if (!isHeavyAction(path)) {
      await next();
      return;
    }

    const key = `heavy:${getRateLimitKey(c)}`;
    const now = Date.now();
    const windowReset = now + HEAVY_WINDOW_MS;

    let entry = heavyStore.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: windowReset };
      heavyStore.set(key, entry);
    } else {
      entry.count++;
    }

    const remaining = HEAVY_LIMIT - entry.count;
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

    if (remaining < 0) {
      return c.body(
        JSON.stringify({
          error: 'Cooldown active',
          message: 'Your ship\'s engines are recharging. The hyperdrive cooldown is still active.',
          retryAfter,
          limit: HEAVY_LIMIT,
          remaining: 0,
        }),
        429,
        {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(HEAVY_LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        }
      );
    }

    await next();
  };
}

/**
 * WebSocket message rate limiter.
 * The WebSocket connection itself is not limited, but messages are.
 * Returns a middleware that only applies to /api routes, excluding /ws.
 */
export function apiRateLimit(): MiddlewareHandler<Env> {
  return async (c: Context, next: Next) => {
    const path = c.req.path;

    // WebSocket path is not rate-limited
    if (path.startsWith('/ws')) {
      await next();
      return;
    }

    // Apply global limit
    await globalRateLimit()(c, next);
  };
}