import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';

export function ResourceBar() {
  const { selectedPlanet, updatePlanet } = useGameStore();
  const [loading, setLoading] = useState(false);

  if (!selectedPlanet) return null;

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(0);
  };

  const resources = [
    { name: 'Iron', value: selectedPlanet.iron, icon: '🔩', color: 'text-gray-300' },
    { name: 'Silver', value: selectedPlanet.silver, icon: '💎', color: 'text-cyan-300' },
    { name: 'Ember', value: selectedPlanet.ember, icon: '🔥', color: 'text-orange-300' },
    { name: 'H2', value: selectedPlanet.h2, icon: '⛽', color: 'text-purple-300' },
    { name: 'Energy', value: selectedPlanet.energy, icon: '⚡', color: 'text-yellow-300' },
  ];

  const addResources = async () => {
    if (!selectedPlanet || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/game/dev/resources/${selectedPlanet.id}`, { method: 'POST' });
      if (res.ok) {
        const { planet } = await res.json();
        updatePlanet(planet);
      }
    } catch (e) {
      console.error('Failed to add resources:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-galaxy-dark border-b border-galaxy-purple py-2">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {selectedPlanet.name}
        </div>
        <div className="flex space-x-6 items-center">
          <div className="flex space-x-6">
            {resources.map((r) => (
              <div key={r.name} className="flex items-center space-x-2">
                <span>{r.icon}</span>
                <span className={`font-mono ${r.color}`}>
                  {formatNumber(r.value)}
                </span>
              </div>
            ))}
          </div>
          {import.meta.env.DEV && (
            <button
              onClick={addResources}
              disabled={loading}
              title="+5k resources (DEV)"
              style={{
                backgroundColor: '#1a1a3a',
                border: '1px solid #fb923c',
                color: '#fb923c',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '11px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              +5k
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
