import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createBunWebSocket } from 'hono/bun';
import { gameRoutes } from './routes/game';
import { fleetRoutes } from './routes/fleet';
import { buildingRoutes } from './routes/building';
import { researchRoutes } from './routes/research';
import { shipyardRoutes } from './routes/shipyard';
import { addClient, removeClientFromAll, addAdminClient, removeAdminClient } from './websocket/broadcast';
import { prisma } from './db/client';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import { adminRoutes } from './routes/admin';
import { adminAuth } from './middleware/adminAuth';
import { globalRateLimit, heavyRateLimit } from './middleware/rateLimit';

const { websocket, upgradeWebSocket } = createBunWebSocket();

const app = new Hono();

// CORS for frontend
app.use('/*', cors({
  origin: ['http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Global rate limiting (60 req/min) — applies to /api routes only
// WebSocket (/ws) is excluded from rate limiting
app.use('/api/*', globalRateLimit());

// Heavy action rate limiting (5 req/min) — applied on specific endpoints
app.use('/api/*', heavyRateLimit());

// Health check (unauthenticated, no rate limit)
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Admin API routes — mounted BEFORE player auth so adminAuth handles /api/admin/*
app.use('/api/admin/*', adminAuth());
app.route('/api/admin', adminRoutes);

// API-Key authentication — all /api/* routes (admin already handled above)
app.use('/api/*', apiKeyAuth());

// API Routes
app.route('/api/game', gameRoutes);
app.route('/api/fleet', fleetRoutes);
app.route('/api/building', buildingRoutes);
app.route('/api/research', researchRoutes);
app.route('/api/shipyard', shipyardRoutes);

// WebSocket for realtime updates
app.get('/ws', upgradeWebSocket((c) => {
  let subscribedPlayerId: string | null = null;
  let authenticated = false;
  let playerId: string | null = null;

  return {
    onOpen(_event, ws) {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() }));
    },
    async onMessage(event, ws) {
      try {
        const data = JSON.parse(event.data.toString());
        console.log('Received:', data);

        // Require auth message first
        if (!authenticated) {
          if (data.type === 'auth' && data.apiKey) {
            const player = await prisma.player.findUnique({
              where: { apiKey: data.apiKey },
              select: { id: true },
            });
            if (player) {
              authenticated = true;
              playerId = player.id;
              ws.send(JSON.stringify({ type: 'auth_ok' }));
            } else {
              ws.send(JSON.stringify({ type: 'auth_failed' }));
              ws.close();
            }
          } else {
            ws.close();
          }
          return;
        }

        // Handle subscription to player updates
        if (data.type === 'subscribe' && data.playerId) {
          subscribedPlayerId = data.playerId;
          addClient(data.playerId, ws);
          ws.send(JSON.stringify({
            type: 'subscribed',
            playerId: data.playerId,
            timestamp: new Date().toISOString()
          }));
        }

        // Admin subscription — requires admin API key, receives all events across all players
        if (data.type === 'admin_subscribe') {
          const adminKey = process.env.ADMIN_API_KEY;
          if (!adminKey || data.apiKey !== adminKey) {
            ws.send(JSON.stringify({ type: 'admin_subscribe_denied', timestamp: new Date().toISOString() }));
            return;
          }
          addAdminClient(ws);
          ws.send(JSON.stringify({
            type: 'admin_subscribed',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    },
    onClose(_event, ws) {
      console.log('WebSocket disconnected');
      removeAdminClient(ws);
      removeClientFromAll(ws);
    },
  };
}));


// For Bun server
export default {
  port: 3000,
  hostname: '0.0.0.0',
  fetch: app.fetch,
  websocket,
};

console.log('🚀 Server running at http://0.0.0.0:3000');
