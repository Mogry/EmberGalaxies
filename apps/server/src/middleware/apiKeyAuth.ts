/**
 * API-Key Authentication Middleware for Ember Galaxies
 *
 * Authenticates requests via Bearer token in the Authorization header.
 * Validates against the Player.apiKey field in the database.
 * Injects playerId into the Hono context for use in route handlers.
 */

import type { Context, Next } from 'hono';
import type { Env, MiddlewareHandler } from 'hono';
import { prisma } from '../db/client';

export const apiKeyAuth = (): MiddlewareHandler<Env> => {
  return async (c: Context, next: Next) => {
    const auth = c.req.header('Authorization');

    if (!auth || !auth.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const key = auth.slice(7); // strip "Bearer "

    if (!key || key.length === 0) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const player = await prisma.player.findUnique({
      where: { apiKey: key },
      select: { id: true },
    });

    if (!player) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('playerId', player.id);
    await next();
  };
};
