import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createBunWebSocket } from 'hono/bun';
import { gameRoutes } from './routes/game';
import { fleetRoutes } from './routes/fleet';
import { buildingRoutes } from './routes/building';
import { researchRoutes } from './routes/research';
import { shipyardRoutes } from './routes/shipyard';
import { addClient, removeClientFromAll, broadcastToPlayer } from './websocket/broadcast';
import { prisma } from './db/client';
import { calculatePlanetProduction } from '@ember-galaxies/shared';

const { websocket, upgradeWebSocket } = createBunWebSocket();

const app = new Hono();

// CORS for frontend
app.use('/*', cors({
  origin: ['http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
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

// 60-second interval for resource updates to connected players
setInterval(async () => {
  // Get all unique playerIds with active connections
  // This is imported from broadcast module but we need to iterate over connected clients
  // We'll fetch fresh state for each player and broadcast resource updates
  try {
    // Get all players with active WebSocket connections
    // Note: This is a simple approach - in production you'd want to track this more efficiently
    const players = await prisma.player.findMany({
      where: { id: { not: 'dummy' } }, // Get all players
      include: {
        planets: {
          include: { buildings: true }
        }
      },
    });

    for ( const player of players) {
      // Calculate current production for all planets
      let totalResources = { iron: 0, silver: 0, ember: 0, h2: 0, energy: 0 };

      for (const planet of player.planets) {
        const production = calculatePlanetProduction(planet.buildings as any);
        totalResources.iron += production.iron;
        totalResources.silver += production.silver;
        totalResources.ember += production.ember;
        totalResources.h2 += production.h2;
        totalResources.energy += production.energy;
      }

      // Only broadcast if player has planets
      if (player.planets.length > 0) {
        broadcastToPlayer(player.id, {
          type: 'resource_update',
          data: {
            resources: totalResources,
            planets: player.planets.map(p => ({
              id: p.id,
              iron: p.iron,
              silver: p.silver,
              ember: p.ember,
              h2: p.h2,
              energy: p.energy,
            })),
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (e) {
    console.error('Error in resource broadcast interval:', e);
  }
}, 60_000); // Every 60 seconds

// For Bun server
export default {
  port: 3000,
  hostname: 'localhost',
  fetch: app.fetch,
  websocket,
};

console.log('🚀 Server running at http://localhost:3000');
