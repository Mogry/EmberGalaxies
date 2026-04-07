import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createBunWebSocket } from 'hono/bun';
import { gameRoutes } from './routes/game';
import { fleetRoutes } from './routes/fleet';
import { buildingRoutes } from './routes/building';
import { researchRoutes } from './routes/research';
import { shipyardRoutes } from './routes/shipyard';
import { addClient, removeClientFromAll } from './websocket/broadcast';
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

// API Routes
app.route('/api/game', gameRoutes);
app.route('/api/fleet', fleetRoutes);
app.route('/api/building', buildingRoutes);
app.route('/api/research', researchRoutes);
app.route('/api/shipyard', shipyardRoutes);

// WebSocket for realtime updates
app.get('/ws', upgradeWebSocket((c) => {
  let subscribedPlayerId: string | null = null;

  return {
    onOpen(_event, ws) {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() }));
    },
    onMessage(event, ws) {
      try {
        const data = JSON.parse(event.data.toString());
        console.log('Received:', data);

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
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    },
    onClose(_event, ws) {
      console.log('WebSocket disconnected');
      removeClientFromAll(ws);
    },
  };
}));


// For Bun server
export default {
  port: 3000,
  hostname: 'localhost',
  fetch: app.fetch,
  websocket,
};

console.log('🚀 Server running at http://localhost:3000');
