import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminFetch } from '../api/client';
import { PlanetRow } from '../components/PlanetRow';
import { FleetRow } from '../components/FleetRow';
import { ResearchRow } from '../components/ResearchRow';

interface PlayerDetail {
  id: string;
  name: string;
  isBot: boolean;
  createdAt: string;
  updatedAt: string;
  planets: any[];
  fleets: any[];
  research: any[];
}

type Tab = 'planets' | 'fleets' | 'research';

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [tab, setTab] = useState<Tab>('planets');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    adminFetch<PlayerDetail>(`/players/${id}`)
      .then(setPlayer)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="text-admin-danger">{error}</div>;
  if (!player) return <div className="text-admin-text-dim">Loading...</div>;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'planets', label: 'Planets', count: player.planets.length },
    { key: 'fleets', label: 'Fleets', count: player.fleets.length },
    { key: 'research', label: 'Research', count: player.research.length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/players" className="text-xs text-admin-text-dim hover:text-admin-text">&larr; Players</Link>
      </div>

      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-admin-text-bright">{player.name}</h2>
        {player.isBot && <span className="text-[10px] px-1.5 py-0.5 bg-admin-accent/20 text-admin-accent rounded">BOT</span>}
      </div>
      <div className="flex gap-4 text-xs text-admin-text-dim">
        <span>Created: {new Date(player.createdAt).toLocaleDateString()}</span>
        <span>Last active: {new Date(player.updatedAt).toLocaleString()}</span>
      </div>

      <div className="flex gap-1 border-b border-admin-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm transition-colors ${
              tab === t.key
                ? 'text-admin-accent border-b-2 border-admin-accent'
                : 'text-admin-text-dim hover:text-admin-text'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === 'planets' && (
        <div className="bg-admin-surface rounded-lg border border-admin-border overflow-auto">
          <table className="w-full text-left">
            <thead className="border-b border-admin-border">
              <tr>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Name</th>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Coords</th>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Iron/Silver/Ember</th>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">H2/Energy</th>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Fields</th>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Buildings</th>
              </tr>
            </thead>
            <tbody>
              {player.planets.map((p) => (
                <PlanetRow key={p.id} planet={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'fleets' && (
        <div className="bg-admin-surface rounded-lg border border-admin-border overflow-auto">
          <table className="w-full text-left">
            <thead className="border-b border-admin-border">
              <tr>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Mission</th>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Route</th>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Ships</th>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Arrives</th>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Returns</th>
              </tr>
            </thead>
            <tbody>
              {player.fleets.map((f) => (
                <FleetRow key={f.id} fleet={f} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'research' && (
        <div className="bg-admin-surface rounded-lg border border-admin-border overflow-auto">
          <table className="w-full text-left">
            <thead className="border-b border-admin-border">
              <tr>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Type</th>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Level</th>
                <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {player.research.map((r) => (
                <ResearchRow key={r.id} research={r} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}