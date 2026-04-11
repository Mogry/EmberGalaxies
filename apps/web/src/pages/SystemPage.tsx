import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminFetch } from '../api/client';

interface Star {
  temperature: number;
  energyOutput: number;
}

interface Owner {
  id: string;
  name: string;
}

interface Planet {
  id: string;
  name: string;
  slot: number;
  ownerId: string | null;
  owner: Owner | null;
  iron: number;
  silver: number;
  ember: number;
  h2: number;
  energy: number;
}

interface SystemData {
  id: string;
  index: number;
  galaxyId: string;
  galaxyIndex: number;
  star: Star | null;
  planets: Planet[];
}

export function SystemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminFetch<SystemData>(`/system/${id}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-admin-text-dim">Loading system...</div>;
  }

  if (!data) {
    return <div className="text-admin-text-dim">System not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/galaxy`)}
          className="text-admin-text-dim hover:text-admin-text transition-colors text-sm"
        >
          &larr; Galaxy Map
        </button>
        <h2 className="text-lg font-semibold text-admin-text-bright">
          System G{data.galaxyIndex}-S{String(data.index).padStart(3, '0')}
        </h2>
      </div>

      {/* System info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-admin-surface rounded-lg border border-admin-border p-3">
          <div className="text-xs text-admin-text-dim">Galaxy</div>
          <div className="text-sm text-admin-text font-medium">G{data.galaxyIndex}</div>
        </div>
        <div className="bg-admin-surface rounded-lg border border-admin-border p-3">
          <div className="text-xs text-admin-text-dim">System Index</div>
          <div className="text-sm text-admin-text font-medium">S{String(data.index).padStart(3, '0')}</div>
        </div>
        {data.star && (
          <>
            <div className="bg-admin-surface rounded-lg border border-admin-border p-3">
              <div className="text-xs text-admin-text-dim">Star Temp</div>
              <div className="text-sm text-admin-text font-medium">{data.star.temperature} K</div>
            </div>
            <div className="bg-admin-surface rounded-lg border border-admin-border p-3">
              <div className="text-xs text-admin-text-dim">Energy Output</div>
              <div className="text-sm text-admin-text font-medium">{data.star.energyOutput} kW</div>
            </div>
          </>
        )}
      </div>

      {/* Occupancy summary */}
      <div className="flex gap-4 text-sm">
        <span className="text-admin-text-dim">
          Planets: <span className="text-admin-text">{data.planets.length}</span>
        </span>
        <span className="text-admin-text-dim">
          Occupied: <span className="text-admin-accent">{data.planets.filter((p) => p.ownerId).length}</span>
        </span>
      </div>

      {/* Planet table */}
      <div className="bg-admin-surface rounded-lg border border-admin-border overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-admin-surface border-b border-admin-border">
            <tr>
              <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Slot</th>
              <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Name</th>
              <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Owner</th>
              <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Iron</th>
              <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Silver</th>
              <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Ember</th>
              <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">H2</th>
              <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Energy</th>
            </tr>
          </thead>
          <tbody>
            {data.planets.map((planet) => (
              <tr
                key={planet.id}
                className={`border-b border-admin-border ${
                  planet.ownerId ? 'bg-admin-accent/5' : 'hover:bg-admin-surface-hover'
                }`}
              >
                <td className="px-4 py-2 text-sm text-admin-text-dim">{planet.slot}</td>
                <td className="px-4 py-2 text-sm text-admin-text font-mono">{planet.name}</td>
                <td className="px-4 py-2 text-sm">
                  {planet.owner ? (
                    <button
                      onClick={() => navigate(`/players/${planet.owner.id}`)}
                      className="text-admin-accent hover:underline"
                    >
                      {planet.owner.name}
                    </button>
                  ) : (
                    <span className="text-admin-text-dim">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-xs text-admin-text-dim">{Math.floor(planet.iron)}</td>
                <td className="px-4 py-2 text-xs text-admin-text-dim">{Math.floor(planet.silver)}</td>
                <td className="px-4 py-2 text-xs text-admin-text-dim">{Math.floor(planet.ember)}</td>
                <td className="px-4 py-2 text-xs text-admin-text-dim">{Math.floor(planet.h2)}</td>
                <td className="px-4 py-2 text-xs text-admin-text-dim">{Math.floor(planet.energy)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}