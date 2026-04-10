import { useEffect, useState } from 'react';
import { useAdminStore } from '../stores/adminStore';
import { adminFetch } from '../api/client';
import { PlayerRow } from '../components/PlayerRow';
import type { PlayerSummary } from '../stores/adminStore';

export function PlayersPage() {
  const { players, setPlayers } = useAdminStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminFetch<PlayerSummary[]>('/players').then(setPlayers).catch(console.error);
  }, [setPlayers]);

  const filtered = search
    ? players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : players;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-admin-text-bright">Players</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players..."
          className="px-3 py-1.5 bg-admin-surface border border-admin-border rounded-md text-sm text-admin-text w-64 focus:outline-none focus:border-admin-accent"
        />
      </div>

      <div className="bg-admin-surface rounded-lg border border-admin-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-admin-border">
            <tr>
              <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Player</th>
              <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Planets</th>
              <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Fleets</th>
              <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <PlayerRow key={p.id} player={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}