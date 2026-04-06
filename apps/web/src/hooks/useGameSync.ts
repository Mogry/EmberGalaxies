import { useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';

/**
 * Centralized data synchronization hook.
 * All mutations (POST/PUT/DELETE) go through this hook to ensure
 * fresh data is always fetched after a mutation, preventing stale state bugs.
 */
export function useGameSync() {
  const refreshPlanet = useGameStore((s) => s.refreshPlanet);
  const selectPlanet = useGameStore((s) => s.selectPlanet);
  const updatePlanet = useGameStore((s) => s.updatePlanet);
  const planets = useGameStore((s) => s.planets);

  /**
   * Perform a mutation (POST/PUT/DELETE) on a planet, then refresh that planet
   * from the server to get the fresh state.
   */
  const mutateAndRefresh = useCallback(
    async (planetId: string, mutation: () => Promise<void>): Promise<void> => {
      await mutation();
      await refreshPlanet(planetId);
    },
    [refreshPlanet]
  );

  /**
   * Refresh all planets in the store from the /planets/:playerId endpoint.
   */
  const refreshAllPlanets = useCallback(async (playerId: string): Promise<void> => {
    try {
      const res = await fetch(`/api/game/planets/${playerId}`);
      if (res.ok) {
        const fetchedPlanets = await res.json();
        useGameStore.getState().setPlanets(fetchedPlanets);
      }
    } catch (error) {
      console.error('Failed to refresh all planets:', error);
    }
  }, []);

  return {
    mutateAndRefresh,
    selectPlanet,
    refreshPlanet,
    updatePlanet,
    planets,
    refreshAllPlanets,
  };
}
