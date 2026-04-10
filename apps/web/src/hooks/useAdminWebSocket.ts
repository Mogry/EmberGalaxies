import { useEffect, useRef } from 'react';
import { useAdminStore } from '../stores/adminStore';

export function useAdminWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { setConnected, prependEvent } = useAdminStore();
  const apiKey = localStorage.getItem('admin_api_key');

  useEffect(() => {
    if (!apiKey) return;

    const ws = new WebSocket(`ws://localhost:3000/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', apiKey }));
      ws.send(JSON.stringify({ type: 'admin_subscribe' }));
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected' || data.type === 'auth_ok' || data.type === 'admin_subscribed') return;

        prependEvent({
          id: data.id ?? crypto.randomUUID(),
          type: data.type,
          playerId: data.data?.playerId ?? data.playerId ?? null,
          planetId: data.data?.planetId ?? data.planetId ?? null,
          fleetId: data.data?.fleetId ?? data.fleetId ?? null,
          data: data.data ?? {},
          createdAt: data.timestamp ?? new Date().toISOString(),
          player: data.data?.playerName ? { id: data.data.playerId, name: data.data.playerName } : null,
        });
      } catch (e) {
        console.error('Failed to parse admin WS message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('Admin WebSocket error:', error);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [apiKey, setConnected, prependEvent]);

  return wsRef.current;
}