import { useEffect, useState } from 'react';
import { useAdminStore } from '../stores/adminStore';
import { adminFetch } from '../api/client';
import { PlayerRow } from '../components/PlayerRow';
import type { PlayerSummary } from '../stores/adminStore';

type SortKey = 'name' | 'planetCount' | 'fleetCount' | 'lastActive';
type SortDir = 'asc' | 'desc';

export function PlayersPage() {
  const { players, setPlayers } = useAdminStore();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('lastActive');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    adminFetch<PlayerSummary[]>('/players').then(setPlayers).catch(console.error);
  }, [setPlayers]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const filtered = search
    ? players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : players;

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'name':
        cmp = a.name.localeCompare(b.name);
        break;
      case 'planetCount':
        cmp = a.planetCount - b.planetCount;
        break;
      case 'fleetCount':
        cmp = a.fleetCount - b.fleetCount;
        break;
      case 'lastActive':
        cmp = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
        break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  };

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
              <th className="px-4 py-2 text-xs font-medium cursor-pointer select-none" onClick={() => handleSort('name')}>
                <span className="text-admin-text-dim hover:text-admin-text">Player {sortIcon('name')}</span>
              </th>
              <th className="px-4 py-2 text-xs font-medium cursor-pointer select-none" onClick={() => handleSort('planetCount')}>
                <span className="text-admin-text-dim hover:text-admin-text">Planets {sortIcon('planetCount')}</span>
              </th>
              <th className="px-4 py-2 text-xs font-medium cursor-pointer select-none" onClick={() => handleSort('fleetCount')}>
                <span className="text-admin-text-dim hover:text-admin-text">Fleets {sortIcon('fleetCount')}</span>
              </th>
              <th className="px-4 py-2 text-xs font-medium cursor-pointer select-none" onClick={() => handleSort('lastActive')}>
                <span className="text-admin-text-dim hover:text-admin-text">Last Active {sortIcon('lastActive')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <PlayerRow key={p.id} player={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}