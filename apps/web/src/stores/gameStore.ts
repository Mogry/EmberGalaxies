import { create } from 'zustand';
import type { Player, Planet, Fleet, Research } from '@ember-galaxies/shared';

interface GameState {
  player: Player | null;
  planets: Planet[];
  fleets: Fleet[];
  research: Research[];
  selectedPlanet: Planet | null;
  view: 'galaxy' | 'planet' | 'planets' | 'fleet' | 'research' | 'shipyard';

  setPlayer: (player: Player | null) => void;
  setPlanets: (planets: Planet[]) => void;
  setFleets: (fleets: Fleet[]) => void;
  setResearch: (research: Research[]) => void;
  setSelectedPlanet: (planet: Planet | null) => void;
  setView: (view: 'galaxy' | 'planet' | 'planets' | 'fleet' | 'research' | 'shipyard') => void;
  updateResources: (planetId: string, resources: { iron?: number; silver?: number; ember?: number; h2?: number; energy?: number }) => void;
  updatePlanet: (planet: Planet) => void;
  // Fetch a single planet from the API and update both planets array and selectedPlanet
  refreshPlanet: (planetId: string) => Promise<void>;
  // Select a planet by fetching fresh data, then set as selectedPlanet
  selectPlanet: (planetId: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  planets: [],
  fleets: [],
  research: [],
  selectedPlanet: null,
  view: 'galaxy',

  setPlayer: (player) => set({ player }),

  // No longer resets selectedPlanet to planets[0] — that was causing navigation bugs
  setPlanets: (planets) => set({ planets }),

  setFleets: (fleets) => set({ fleets }),
  setResearch: (research) => set({ research }),

  setSelectedPlanet: (planet) =>
    set((state) => ({
      selectedPlanet: planet,
      planets: planet
        ? state.planets.map((p) => (p.id === planet.id ? planet : p))
        : state.planets,
    })),

  setView: (view) => set({ view }),

  updateResources: (planetId, resources) =>
    set((state) => ({
      planets: state.planets.map((p) =>
        p.id === planetId ? { ...p, ...resources } : p
      ),
      selectedPlanet:
        state.selectedPlanet?.id === planetId
          ? { ...state.selectedPlanet, ...resources }
          : state.selectedPlanet,
    })),

  updatePlanet: (planet) =>
    set((state) => ({
      planets: state.planets.map((p) => (p.id === planet.id ? planet : p)),
      selectedPlanet: state.selectedPlanet?.id === planet.id ? planet : state.selectedPlanet,
    })),

  // Fetch a single planet by ID and update the store with fresh data
  refreshPlanet: async (planetId: string) => {
    try {
      const res = await fetch(`/api/game/planet/${planetId}`);
      if (res.ok) {
        const updated = await res.json();
        set((state) => ({
          planets: state.planets.map((p) => (p.id === planetId ? updated : p)),
          selectedPlanet:
            state.selectedPlanet?.id === planetId ? updated : state.selectedPlanet,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh planet:', error);
    }
  },

  // Select a planet: fetch fresh data then set as selectedPlanet
  selectPlanet: async (planetId: string) => {
    try {
      const res = await fetch(`/api/game/planet/${planetId}`);
      if (res.ok) {
        const planet = await res.json();
        set((state) => ({
          selectedPlanet: planet,
          planets: state.planets.map((p) => (p.id === planetId ? planet : p)),
        }));
      }
    } catch (error) {
      console.error('Failed to select planet:', error);
    }
  },
}));
