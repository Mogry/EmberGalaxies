import { useState, useEffect } from 'react';
import type { Planet } from '@ember-galaxies/shared';
import { GameTimer } from './GameTimer';

interface ShipyardViewProps {
  planet: Planet;
}

interface ShipyardEntry {
  id: string;
  shipType: string;
  count: number;
  isBuilding: boolean;
  buildFinishAt: Date | null;
}

const SHIP_INFO: Record<string, { name: string; icon: string; description: string }> = {
  fly: { name: 'Fly', icon: '🪰', description: 'The first and cheapest combat ship' },
  bumblebee: { name: 'Bumblebee', icon: '🐝', description: 'Small support/bomber fighter' },
  corvette: { name: 'Corvette', icon: '🚤', description: 'First real combat unit' },
  light_cruiser: { name: 'Light Cruiser', icon: '🚀', description: 'Long-range cruiser with jump drive' },
  heavy_cruiser: { name: 'Heavy Cruiser', icon: '🛳️', description: 'Reinforced cruiser variant' },
  battleship: { name: 'Battleship', icon: '⚓', description: 'Powerful warship with direct jump' },
  battleship_nexus: { name: 'Battleship of Nexus Class', icon: '🔱', description: 'Penultimate flagship' },
  battleship_phoenix: { name: 'Battleship of Phoenix Class', icon: '🔥', description: 'The ultimate ship' },
  carrier_titan: { name: 'Carrier Titan', icon: '🛸', description: 'Mega fleet transport' },
  colonizer: { name: 'Colonizer', icon: '🧬', description: 'Colonizes new planets' },
  invasion_unit: { name: 'Invasion-Unit', icon: '⚔️', description: 'Takes over enemy planets' },
  ember_bomb: { name: 'Ember Bomb', icon: '💣', description: 'Destroys enemy planets' },
};

export function ShipyardView({ planet }: ShipyardViewProps) {
  const [shipyards, setShipyards] = useState<ShipyardEntry[]>([]);
  const [selectedShip, setSelectedShip] = useState<string | null>(null);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const refreshShipyards = async () => {
    try {
      const res = await fetch(`/api/shipyard/planet/${planet.id}`);
      if (res.ok) {
        const data = await res.json();
        setShipyards(data);
      }
    } catch (error) {
      console.error('Failed to fetch shipyards:', error);
    }
  };

  // Load shipyards on mount
  useEffect(() => {
    refreshShipyards();
  }, [planet.id]);

  const handleBuild = async (shipType: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/shipyard/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planetId: planet.id, shipType, count }),
      });
      if (res.ok) {
        await refreshShipyards();
        setSelectedShip(null);
      }
    } catch (error) {
      console.error('Failed to build ship:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (shipType: string) => {
    try {
      const res = await fetch('/api/shipyard/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planetId: planet.id, shipType }),
      });
      if (res.ok) {
        await refreshShipyards();
      }
    } catch (error) {
      console.error('Failed to cancel ship build:', error);
    }
  };

  const handleTimerComplete = () => {
    refreshShipyards();
  };

  // Check if planet has shipyard
  const hasShipyard = planet.buildings?.some(b => b.type === 'shipyard' && b.level > 0);
  if (!hasShipyard) {
    return (
      <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🚢 Shipyard</h3>
        <p className="text-gray-400">You need a Shipyard to build ships.</p>
      </div>
    );
  }

  // Get shipyards that are currently building
  const buildingShips = shipyards.filter(s => s.isBuilding);

  return (
    <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple overflow-hidden">
      <div className="bg-galaxy-purple/30 px-4 py-2">
        <h3 className="text-lg font-semibold text-white">🚢 Shipyard</h3>
      </div>

      {/* Currently Building */}
      {buildingShips.length > 0 && (
        <div className="p-4 border-b border-galaxy-purple/30">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Building</h4>
          <div className="space-y-2">
            {buildingShips.map(ship => {
              const info = SHIP_INFO[ship.shipType] || { name: ship.shipType, icon: '🚀', description: '' };
              return (
                <div key={ship.id} className="flex items-center justify-between bg-galaxy-darker rounded p-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{info.icon}</span>
                    <div>
                      <div className="text-white font-medium">{info.name}</div>
                      <div className="text-gray-500 text-xs">x{ship.count}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {ship.buildFinishAt && (
                      <GameTimer
                        finishAt={ship.buildFinishAt}
                        onComplete={handleTimerComplete}
                        compact
                      />
                    )}
                    <button
                      onClick={() => handleCancel(ship.shipType)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ship Selection */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Build Ships</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(SHIP_INFO).map(([type, info]) => {
            const isBuilding = shipyards.some(s => s.shipType === type && s.isBuilding);
            return (
              <button
                key={type}
                onClick={() => setSelectedShip(isBuilding ? null : type)}
                disabled={isBuilding}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  isBuilding
                    ? 'bg-galaxy-darker/50 border-galaxy-purple/30 cursor-not-allowed opacity-50'
                    : selectedShip === type
                    ? 'bg-ember-600/20 border-ember-500'
                    : 'bg-galaxy-darker border-galaxy-purple/50 hover:border-galaxy-purple'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{info.icon}</span>
                  <span className="text-white text-sm font-medium">{info.name}</span>
                </div>
                <div className="text-gray-500 text-xs">{info.description}</div>
              </button>
            );
          })}
        </div>

        {/* Build Dialog */}
        {selectedShip && (
          <div className="mt-4 p-4 bg-galaxy-darker rounded-lg border border-galaxy-purple">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">{SHIP_INFO[selectedShip]?.icon}</span>
              <span className="text-white font-medium">{SHIP_INFO[selectedShip]?.name} Build</span>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-gray-400 text-sm">Amount:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-2 py-1 bg-galaxy-dark border border-galaxy-purple rounded text-white"
              />
            </div>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => handleBuild(selectedShip)}
                disabled={loading}
                className="px-4 py-2 bg-ember-600 hover:bg-ember-500 text-white rounded transition-colors disabled:opacity-50"
              >
                {loading ? 'Building...' : 'Build'}
              </button>
              <button
                onClick={() => setSelectedShip(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
