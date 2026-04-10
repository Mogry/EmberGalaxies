import type { ServerWebSocket } from 'hono/bun';

// Track connected clients by playerId
const connectedClients = new Map<string, Set<ServerWebSocket>>();

export function addClient(playerId: string, ws: ServerWebSocket): void {
  if (!connectedClients.has(playerId)) {
    connectedClients.set(playerId, new Set());
  }
  connectedClients.get(playerId)!.add(ws);
}

export function removeClient(playerId: string, ws: ServerWebSocket): void {
  const clients = connectedClients.get(playerId);
  if (clients) {
    clients.delete(ws);
    if (clients.size === 0) {
      connectedClients.delete(playerId);
    }
  }
}

export function removeClientFromAll(ws: ServerWebSocket): void {
  for (const [playerId, clients] of connectedClients) {
    clients.delete(ws);
    if (clients.size === 0) {
      connectedClients.delete(playerId);
    }
  }
}

export interface BroadcastEvent {
  type: string;
  data?: unknown;
  timestamp: string;
}

/**
 * Broadcast an event to all WebSocket connections for a specific player
 */
export function broadcastToPlayer(playerId: string, event: BroadcastEvent): void {
  const clients = connectedClients.get(playerId);
  if (!clients) return;

  const message = JSON.stringify(event);
  for (const ws of clients) {
    ws.send(message);
  }
}

/**
 * Broadcast to all connected clients (across all players)
 */
export function broadcastToAll(event: BroadcastEvent): void {
  const message = JSON.stringify(event);
  for (const clients of connectedClients.values()) {
    for (const ws of clients) {
      ws.send(message);
    }
  }
}

/**
 * Get count of connected clients for a player
 */
export function getConnectedClientCount(playerId?: string): number {
  if (playerId) {
    return connectedClients.get(playerId)?.size ?? 0;
  }
  let total = 0;
  for (const clients of connectedClients.values()) {
    total += clients.size;
  }
  return total;
}

// Admin WebSocket clients
const adminClients = new Set<ServerWebSocket>();

export function addAdminClient(ws: ServerWebSocket): void {
  adminClients.add(ws);
}

export function removeAdminClient(ws: ServerWebSocket): void {
  adminClients.delete(ws);
}

/**
 * Broadcast an event to all admin dashboard clients
 */
export function broadcastToAdmins(event: BroadcastEvent): void {
  if (adminClients.size === 0) return;
  const message = JSON.stringify(event);
  for (const ws of adminClients) {
    ws.send(message);
  }
}

/**
 * Get count of connected admin clients
 */
export function getAdminClientCount(): number {
  return adminClients.size;
}
