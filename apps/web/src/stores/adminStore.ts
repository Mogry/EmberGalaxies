import { create } from 'zustand';

export interface DashboardStats {
  totalPlayers: number;
  totalPlanets: number;
  occupiedPlanets: number;
  activeFleets: number;
  combatsToday: number;
}

export interface PlayerSummary {
  id: string;
  name: string;
  isBot: boolean;
  createdAt: string;
  lastActive: string;
  planetCount: number;
  fleetCount: number;
}

export interface GameEventEntry {
  id: string;
  type: string;
  playerId: string | null;
  planetId: string | null;
  fleetId: string | null;
  data: Record<string, unknown>;
  createdAt: string;
  player: { id: string; name: string } | null;
}

interface AdminState {
  stats: DashboardStats | null;
  players: PlayerSummary[];
  events: GameEventEntry[];
  eventFilters: {
    type: string | null;
    playerId: string | null;
  };
  connected: boolean;

  setStats: (stats: DashboardStats) => void;
  setPlayers: (players: PlayerSummary[]) => void;
  setEvents: (events: GameEventEntry[]) => void;
  prependEvent: (event: GameEventEntry) => void;
  setEventFilter: (key: 'type' | 'playerId', value: string | null) => void;
  setConnected: (connected: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  players: [],
  events: [],
  eventFilters: { type: null, playerId: null },
  connected: false,

  setStats: (stats) => set({ stats }),
  setPlayers: (players) => set({ players }),
  setEvents: (events) => set({ events }),
  prependEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 200) })),
  setEventFilter: (key, value) => set((state) => ({
    eventFilters: { ...state.eventFilters, [key]: value },
  })),
  setConnected: (connected) => set({ connected }),
}));