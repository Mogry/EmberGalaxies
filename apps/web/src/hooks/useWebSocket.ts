import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { player, setPlanets, setFleets, setSelectedPlanet, updateResources, refreshPlanet } = useGameStore();

  const fetchFleets = useCallback(async () => {
    if (!player) return;
    try {
      const res = await fetch(`/api/fleet/player/${player.id}`);
      if (res.ok) {
        const fleets = await res.json();
        setFleets(fleets);
      }
    } catch (error) {
      console.error('Failed to fetch fleets:', error);
    }
  }, [player?.id, setFleets]);

  useEffect(() => {
    if (!player) return;

    const ws = new WebSocket(`ws://localhost:3000/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ type: 'subscribe', playerId: player.id }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);

        switch (data.type) {
          case 'resource_update':
            if (data.data?.planets) {
              for (const planetData of data.data.planets) {
                updateResources(planetData.id, {
                  iron: planetData.iron,
                  silver: planetData.silver,
                  ember: planetData.ember,
                  h2: planetData.h2,
                  energy: planetData.energy,
                });
              }
            }
            break;

          case 'fleet_arrival':
          case 'fleet_return':
            fetchFleets();
            break;

          // Only refresh the SINGLE planet that changed — no navigation disruption
          case 'building_complete': {
            const planetId = data.data?.planetId;
            if (planetId) refreshPlanet(planetId);
            break;
          }
          case 'ship_complete': {
            const planetId = data.data?.planetId;
            if (planetId) refreshPlanet(planetId);
            break;
          }
          case 'research_complete':
            // Research doesn't affect current view — just let it update in background
            break;
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [player?.id, fetchFleets, updateResources, refreshPlanet, setFleets]);

  return wsRef.current;
}
