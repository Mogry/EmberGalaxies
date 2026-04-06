import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useGameSync } from '../hooks/useGameSync';
import type { Planet, System, Galaxy } from '@ember-galaxies/shared';

interface SystemResponse {
  galaxy: Galaxy;
  system: System;
  planets: Planet[];
}

export function GalaxyView() {
  const { setSelectedPlanet, setView, setPlanets, planets: myPlanets } = useGameStore();
  const { selectPlanet } = useGameSync();
  const [galaxyIndex, setGalaxyIndex] = useState(1);
  const [systemIndex, setSystemIndex] = useState(1);
  const [systemData, setSystemData] = useState<SystemResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSystem = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/game/galaxy/${galaxyIndex}/system/${systemIndex}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load system');
      }
      const data = await res.json();
      setSystemData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSystemData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystem();
  }, []);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    loadSystem();
  };

  const goToPrevSystem = () => {
    if (systemIndex > 1) {
      setSystemIndex(systemIndex - 1);
    }
  };

  const goToNextSystem = () => {
    if (systemIndex < 300) {
      setSystemIndex(systemIndex + 1);
    }
  };

  useEffect(() => {
    loadSystem();
  }, [systemIndex, galaxyIndex]);

  const handlePlanetClick = (planet: Planet) => {
    if (planet.ownerId) {
      selectPlanet(planet.id);
      setView('planet');
    }
  };

  const handleColonize = async (planet: Planet, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Colonize planet "${planet.name}"?`)) return;

    const res = await fetch(`/api/game/planet/${planet.id}/colonize`, { method: 'POST' });
    if (res.ok) {
      const colonized = await res.json();
      // Add to store's planets list AND set as selectedPlanet explicitly
      setPlanets([...myPlanets, colonized]);
      setSelectedPlanet(colonized);
      setView('planet');
      loadSystem();
    }
  };

  const star = systemData?.system?.star;
  const planets = systemData?.planets || [];

  return (
    <div className="space-y-4">
      {/* Coordinate Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={goToPrevSystem}
          disabled={systemIndex <= 1 || loading}
          className="px-4 py-2 rounded font-semibold text-white bg-galaxy-purple hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ◀ System
        </button>

        <form onSubmit={handleJump} className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-gray-400">Galaxy:</label>
            <input
              type="number"
              min="1"
              max="3"
              value={galaxyIndex}
              onChange={(e) => setGalaxyIndex(Math.max(1, Math.min(3, parseInt(e.target.value) || 1)))}
              className="w-20 bg-galaxy-dark border border-galaxy-purple rounded px-3 py-2 text-white font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-400">System:</label>
            <input
              type="number"
              min="1"
              max="300"
              value={systemIndex}
              onChange={(e) => setSystemIndex(Math.max(1, Math.min(300, parseInt(e.target.value) || 1)))}
              className="w-24 bg-galaxy-dark border border-galaxy-purple rounded px-3 py-2 text-white font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded font-semibold text-white transition-colors"
            style={{ backgroundColor: '#ea580c' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
          >
            {loading ? 'Loading...' : 'Jump'}
          </button>
        </form>

        <button
          onClick={goToNextSystem}
          disabled={systemIndex >= 300 || loading}
          className="px-4 py-2 rounded font-semibold text-white bg-galaxy-purple hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          System ▶
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded bg-red-900/30 border border-red-700 text-red-300">
          {error}
        </div>
      )}

      {/* System View */}
      {systemData && (
        <div className="space-y-4">
          {/* System Header */}
          <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple overflow-hidden">
            <div className="bg-galaxy-purple/30 px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-white">
                  {systemData.galaxy.name} - System {systemData.system.index}
                </span>
                <span className="ml-3 text-gray-400 text-sm">
                  ({planets.length} Planet{planets.length !== 1 ? 's' : ''})
                </span>
              </div>
              {star && (
                <div className="flex items-center gap-3 text-amber-400">
                  <span className="text-2xl">☀️</span>
                  <div>
                    <div className="text-sm">Temperature: <span className="font-mono">{star.temperature}K</span></div>
                    <div className="text-sm">Energy: <span className="font-mono">{star.energyOutput} kW</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Planet List */}
          {planets.length > 0 ? (
            <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple overflow-hidden">
              <div className="px-4 py-2 bg-galaxy-purple/20 text-sm text-gray-400 border-b border-galaxy-purple/30">
                All Planets (click to view)
              </div>
              <div className="divide-y divide-galaxy-purple/20">
                {planets.map((planet) => (
                  <div
                    key={planet.id}
                    onClick={() => handlePlanetClick(planet)}
                    className="flex items-center px-4 py-3 hover:bg-ember-600/20 cursor-pointer transition-colors"
                  >
                    <span className="w-10 text-2xl mr-3">🌍</span>
                    <div className="flex-1">
                      <div className="text-white font-medium">{planet.name}</div>
                      <div className="text-gray-500 text-sm">Slot {planet.slot}</div>
                    </div>
                    <div className="text-right text-sm">
                      {planet.ownerId ? (
                        <span className="text-amber-400">Occupied</span>
                      ) : (
                        <button
                          onClick={(e) => handleColonize(planet, e)}
                          className="px-3 py-1 bg-ember-600 hover:bg-ember-500 text-white text-sm rounded transition-colors"
                        >
                          Colonize
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple p-8 text-center text-gray-500">
              No planets in this system
            </div>
          )}
        </div>
      )}
    </div>
  );
}