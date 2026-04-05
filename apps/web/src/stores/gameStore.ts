import { create } from 'zustand';
import type { Player, Planet, Fleet, Research } from '@ember-galaxies/shared';

interface GameState {
  player: Player | null;
  planets: Planet[];
  fleets: Fleet[];
  research: Research[];
  selectedPlanet: Planet | null;
  view: 'galaxy' | 'planet' | 'planets' | 'fleet' | 'research';

  setPlayer: (player: Player | null) => void;
  setPlanets: (planets: Planet[]) => void;
  setFleets: (fleets: Fleet[]) => void;
  setResearch: (research: Research[]) => void;
  setSelectedPlanet: (planet: Planet | null) => void;
  setView: (view: 'galaxy' | 'planet' | 'planets' | 'fleet' | 'research') => void;
  updateResources: (planetId: string, resources: { iron?: number; silver?: number; ember?: number; h2?: number; energy?: number }) => void;
  updatePlanet: (planet: Planet) => void;
}

export const useGameStore = create<GameState>((set) => ({
  player: null,
  planets: [],
  fleets: [],
  research: [],
  selectedPlanet: null,
  view: 'galaxy',

  setPlayer: (player) => set({ player }),
  setPlanets: (planets) => set({ planets, selectedPlanet: planets[0] || null }),
  setFleets: (fleets) => set({ fleets }),
  setResearch: (research) => set({ research }),
  setSelectedPlanet: (planet) =>
    set((state) => ({
      selectedPlanet: planet,
      // Also update the planet in the planets array
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
    })),
  updatePlanet: (planet: Planet) =>
    set((state) => ({
      planets: state.planets.map((p) => (p.id === planet.id ? planet : p)),
      selectedPlanet: state.selectedPlanet?.id === planet.id ? planet : state.selectedPlanet,
    })),
}));