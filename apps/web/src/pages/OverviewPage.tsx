import { useEffect } from 'react';
import { useAdminStore } from '../stores/adminStore';
import { adminFetch } from '../api/client';
import { KpiCard } from '../components/KpiCard';
import { PlayerCard } from '../components/PlayerCard';
import { EventRow } from '../components/EventRow';
import type { DashboardStats, PlayerSummary, GameEventEntry } from '../stores/adminStore';

export function OverviewPage() {
  const { stats, players, events, setStats, setPlayers, setEvents } = useAdminStore();

  useEffect(() => {
    adminFetch<DashboardStats>('/stats').then(setStats).catch(console.error);
    adminFetch<PlayerSummary[]>('/players').then(setPlayers).catch(console.error);
    adminFetch<{ events: GameEventEntry[] }>('/events?limit=10').then((r) => setEvents(r.events)).catch(console.error);
  }, [setStats, setPlayers, setEvents]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-admin-text-bright">Overview</h2>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Players" value={stats?.totalPlayers ?? '—'} icon="◈" />
        <KpiCard label="Planets" value={stats?.occupiedPlanets ?? '—'} icon="◎" color="text-admin-success" />
        <KpiCard label="Total Planets" value={stats?.totalPlanets ?? '—'} icon="🌍" color="text-admin-text-dim" />
        <KpiCard label="Active Fleets" value={stats?.activeFleets ?? '—'} icon="🚀" color="text-admin-warning" />
        <KpiCard label="Combats Today" value={stats?.combatsToday ?? '—'} icon="⚔️" color="text-admin-danger" />
      </div>

      <div>
        <h3 className="text-sm font-medium text-admin-text-dim mb-3">Players</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {players.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-admin-text-dim mb-3">Recent Events</h3>
        <div className="bg-admin-surface rounded-lg border border-admin-border overflow-hidden">
          {events.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-admin-text-dim">No events yet</div>
          )}
          {events.slice(0, 10).map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </div>
      </div>
    </div>
  );
}