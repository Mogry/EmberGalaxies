import { useEffect, useState } from 'react';
import { adminFetch } from '../api/client';

interface GalaxySummary {
  index: number;
  name: string;
  systemCount: number;
  totalPlanets: number;
  occupiedPlanets: number;
  owners: { id: string; name: string }[];
}

interface SystemSummary {
  id: string;
  index: number;
  planetCount: number;
  occupiedCount: number;
  owners: { id: string; name: string }[];
}

export function GalaxyPage() {
  const [galaxies, setGalaxies] = useState<GalaxySummary[]>([]);
  const [selectedGalaxy, setSelectedGalaxy] = useState<number | null>(null);
  const [systems, setSystems] = useState<SystemSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminFetch<GalaxySummary[]>('/galaxies')
      .then(setGalaxies)
      .catch(console.error);
  }, []);

  const selectGalaxy = async (index: number) => {
    setSelectedGalaxy(index);
    setLoading(true);
    try {
      const data = await adminFetch<GalaxySummary & { systems: SystemSummary[] }>(`/galaxy/${index}`);
      setSystems(data.systems);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-admin-text-bright">Galaxy Map</h2>

      <div className="flex flex-wrap gap-1.5">
        {galaxies.map((g) => (
          <button
            key={g.index}
            onClick={() => selectGalaxy(g.index)}
            className={`w-10 h-10 text-xs rounded border transition-colors ${
              selectedGalaxy === g.index
                ? 'border-admin-accent bg-admin-accent/10 text-admin-accent'
                : 'border-admin-border text-admin-text-dim hover:border-admin-border-hover hover:text-admin-text'
            }`}
            title={`${g.name}: ${g.occupiedPlanets}/${g.totalPlanets} planets${g.owners.length > 0 ? ` — ${g.owners.map(o => o.name).join(', ')}` : ''}`}
          >
            {g.index}
          </button>
        ))}
      </div>

      {selectedGalaxy && (
        <div>
          <h3 className="text-sm font-medium text-admin-text-dim mb-3">
            Galaxy {selectedGalaxy} — {loading ? 'Loading...' : `${systems.length} systems`}
          </h3>
          {!loading && (
            <div className="bg-admin-surface rounded-lg border border-admin-border overflow-auto max-h-[600px]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-admin-surface border-b border-admin-border">
                  <tr>
                    <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">System</th>
                    <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Planets</th>
                    <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Occupied</th>
                    <th className="px-4 py-2 text-xs text-admin-text-dim font-medium">Owners</th>
                  </tr>
                </thead>
                <tbody>
                  {systems.map((s) => (
                    <tr key={s.id} className="border-b border-admin-border hover:bg-admin-surface-hover">
                      <td className="px-4 py-2 text-sm text-admin-text">S{s.index}</td>
                      <td className="px-4 py-2 text-xs text-admin-text-dim">{s.planetCount}</td>
                      <td className="px-4 py-2 text-xs text-admin-text">{s.occupiedCount}</td>
                      <td className="px-4 py-2 text-xs text-admin-text-dim">
                        {s.owners.map((o) => o.name).join(', ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}