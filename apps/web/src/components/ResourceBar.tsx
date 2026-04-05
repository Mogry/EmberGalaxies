import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { calculatePlanetProduction } from '@ember-galaxies/shared';

export function ResourceBar() {
  const { selectedPlanet, updatePlanet } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [displayResources, setDisplayResources] = useState({
    iron: 0, silver: 0, ember: 0, h2: 0, energy: 0,
  });
  const lastUpdateRef = useRef<number>(Date.now());

  // Sync display resources when planet or resources change
  useEffect(() => {
    if (!selectedPlanet) return;
    setDisplayResources({
      iron: selectedPlanet.iron,
      silver: selectedPlanet.silver,
      ember: selectedPlanet.ember,
      h2: selectedPlanet.h2,
      energy: selectedPlanet.energy,
    });
    lastUpdateRef.current = Date.now();
  }, [selectedPlanet?.id, selectedPlanet?.iron, selectedPlanet?.silver, selectedPlanet?.ember, selectedPlanet?.h2, selectedPlanet?.energy]);

  // Live-update resources every second
  useEffect(() => {
    if (!selectedPlanet) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      const production = calculatePlanetProduction(selectedPlanet.buildings ?? []);

      setDisplayResources((prev) => ({
        iron: prev.iron + production.iron * elapsedSeconds / 3600,
        silver: prev.silver + production.silver * elapsedSeconds / 3600,
        ember: prev.ember + production.ember * elapsedSeconds / 3600,
        h2: prev.h2 + production.h2 * elapsedSeconds / 3600,
        energy: prev.energy + production.energy * elapsedSeconds / 3600,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedPlanet?.id]);

  if (!selectedPlanet) return null;

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(0);
  };

  const resources = [
    { name: 'Iron', value: displayResources.iron, icon: '🔩', color: 'text-gray-300' },
    { name: 'Silver', value: displayResources.silver, icon: '💎', color: 'text-cyan-300' },
    { name: 'Ember', value: displayResources.ember, icon: '🔥', color: 'text-orange-300' },
    { name: 'H2', value: displayResources.h2, icon: '⛽', color: 'text-purple-300' },
    { name: 'Energy', value: displayResources.energy, icon: '⚡', color: 'text-yellow-300' },
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
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌍</span>
          <div>
            <div className="text-white font-semibold">{selectedPlanet.name}</div>
            <div className="text-gray-500 text-sm font-mono">
              G{selectedPlanet.system?.galaxyIndex ?? '?'}.{selectedPlanet.system?.index ?? '?'}.{selectedPlanet.slot}
            </div>
          </div>
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
