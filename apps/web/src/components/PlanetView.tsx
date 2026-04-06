import { useState } from 'react';
import type { Planet, BuildingType, Building } from '@ember-galaxies/shared';
import { calculateProduction, BUILDING_PRODUCTION, getBuildingUpgradeCost } from '@ember-galaxies/shared';
import { useGameStore } from '../stores/gameStore';
import { GameTimer } from './GameTimer';
import { BuildingDetailModal } from './BuildingDetailModal';

const RESOURCE_COLORS: Record<string, string> = {
  iron: 'text-blue-400',
  silver: 'text-purple-400',
  ember: 'text-orange-400',
  h2: 'text-cyan-400',
  energy: 'text-yellow-400',
};

const RESOURCE_ICONS: Record<string, string> = {
  iron: '🔩',
  silver: '💎',
  ember: '🔥',
  h2: '⛽',
  energy: '⚡',
};

interface PlanetViewProps {
  planet: Planet;
}

const BUILDING_INFO: Record<BuildingType, { name: string; icon: string; description: string }> = {
  zentrale: { name: 'Command Center', icon: '🏛️', description: 'Central control building' },
  iron_mine: { name: 'Iron Mine', icon: '🔩', description: 'Mines iron ore' },
  silver_mine: { name: 'Silver Mine', icon: '💎', description: 'Mines silver ore' },
  uderon_raffinery: { name: 'Uderon Refinery', icon: '🔥', description: 'Refines uderon ore' },
  h2_refinery: { name: 'H2 Refinery', icon: '⛽', description: 'Extracts H2 from seawater' },
  fusion_plant: { name: 'Fusion Plant', icon: '⚛️', description: 'Generates energy through fusion' },
  research_center: { name: 'Research Center', icon: '🔬', description: 'Coordinates research' },
  shipyard: { name: 'Shipyard', icon: '🚀', description: 'Builds spacecraft' },
  space_station: { name: 'Space Station', icon: '🛸', description: 'Orbital platform' },
  anti_spy: { name: 'Anti-Spy Shield', icon: '🛡️', description: 'Prevents espionage' },
  planetary_shield: { name: 'Planetary Shield', icon: '🌍', description: 'Orbital defense system' },
  dummy_building: { name: 'Dummy Building', icon: '📦', description: 'Fastbuild placeholder' },
};

function getBuildingState(building: Building | undefined) {
  const now = new Date();

  if (!building) {
    return { exists: false as const, level: 0, isUpgrading: false, upgradeFinishAt: null };
  }

  if (!building.upgradeFinishAt) {
    return { exists: true as const, level: building.level, isUpgrading: false, upgradeFinishAt: null };
  }

  const finishTime = new Date(building.upgradeFinishAt);

  if (now < finishTime) {
    return { exists: true as const, level: building.level, isUpgrading: true, upgradeFinishAt: building.upgradeFinishAt };
  }

  return { exists: true as const, level: building.level + 1, isUpgrading: false, upgradeFinishAt: null };
}

export function PlanetView({ planet }: PlanetViewProps) {
  const { updatePlanet, planets, setSelectedPlanet } = useGameStore();

  const myPlanets = planets
    .filter((p) => p.ownerId === planet.ownerId)
    .sort((a, b) => {
      const aPos = (a.system?.galaxyIndex ?? 0) * 100000 + (a.system?.index ?? 0) * 100 + a.slot;
      const bPos = (b.system?.galaxyIndex ?? 0) * 100000 + (b.system?.index ?? 0) * 100 + b.slot;
      return aPos - bPos;
    });

  const currentIndex = myPlanets.findIndex((p) => p.id === planet.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < myPlanets.length - 1;

  const goToPrevPlanet = async () => {
    if (!hasPrev) return;
    const prevPlanet = myPlanets[currentIndex - 1];
    const res = await fetch(`/api/game/planet/${prevPlanet.id}`);
    if (res.ok) {
      const fullPlanet = await res.json();
      setSelectedPlanet(fullPlanet);
    }
  };

  const goToNextPlanet = async () => {
    if (!hasNext) return;
    const nextPlanet = myPlanets[currentIndex + 1];
    const res = await fetch(`/api/game/planet/${nextPlanet.id}`);
    if (res.ok) {
      const fullPlanet = await res.json();
      setSelectedPlanet(fullPlanet);
    }
  };

  const [buildingAction, setBuildingAction] = useState<string | null>(null);
  const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType | null>(null);

  const handleBuild = async (buildingType: BuildingType) => {
    if (buildingAction) return;
    setBuildingAction(buildingType);
    try {
      const res = await fetch('/api/building/construct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planetId: planet.id, buildingType }),
      });
      if (res.ok) {
        const updated = await res.json();
        updatePlanet(updated);
      }
    } finally {
      setBuildingAction(null);
    }
  };

  const handleUpgrade = async (buildingType: BuildingType) => {
    if (buildingAction) return;
    setBuildingAction(buildingType);
    try {
      const res = await fetch('/api/building/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planetId: planet.id, buildingType }),
      });
      if (res.ok) {
        const updated = await res.json();
        updatePlanet(updated);
      }
    } finally {
      setBuildingAction(null);
    }
  };

  const handleCancelUpgrade = async (buildingType: BuildingType) => {
    const res = await fetch('/api/building/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planetId: planet.id, buildingType }),
    });
    if (res.ok) {
      const updated = await res.json();
      updatePlanet(updated);
    }
  };

  const handleTimerComplete = async () => {
    const updated = await fetch(`/api/game/planet/${planet.id}`).then((r) => r.json());
    updatePlanet(updated);
  };

  const getBuilding = (type: BuildingType): Building | undefined => {
    return planet.buildings?.find((b) => b.type === type);
  };

  const formatCost = (cost: { iron?: number; silver?: number; ember?: number; h2?: number; energy?: number } | null) => {
    if (!cost) return null;
    const parts: string[] = [];
    if (cost.iron) parts.push(`🔩${Math.round(cost.iron)}`);
    if (cost.silver) parts.push(`💎${Math.round(cost.silver)}`);
    if (cost.ember) parts.push(`🔥${Math.round(cost.ember)}`);
    if (cost.h2) parts.push(`⛽${Math.round(cost.h2)}`);
    if (cost.energy) parts.push(`⚡${Math.round(cost.energy)}`);
    return parts.join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              🌍 {planet.name}
            </h2>
            <p className="text-gray-400">
              Position: System {planet.system?.index ?? '?'}
            </p>
            <p className="text-gray-500 text-sm">
              Fields: {planet.fieldsUsed} / {planet.fieldsMax}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPlanet}
              disabled={!hasPrev}
              className="px-4 py-2 rounded font-semibold text-white bg-galaxy-purple hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ◀ Planet
            </button>
            <span className="text-gray-500 text-sm px-2">
              {currentIndex + 1} / {myPlanets.length}
            </span>
            <button
              onClick={goToNextPlanet}
              disabled={!hasNext}
              className="px-4 py-2 rounded font-semibold text-white bg-galaxy-purple hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Planet ▶
            </button>
          </div>
        </div>
      </div>

      <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple overflow-hidden">
        <div className="bg-galaxy-purple/30 px-4 py-2">
          <h3 className="text-lg font-semibold text-white">Buildings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {Object.entries(BUILDING_INFO).map(([type, info]) => {
            const building = getBuilding(type as BuildingType);
            const state = getBuildingState(building);

            return (
              <div
                key={type}
                className="bg-galaxy-darker rounded-lg p-4 border border-galaxy-purple/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setSelectedBuildingType(type as BuildingType)}
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <div className="text-white font-medium">{info.name}</div>
                      <div className="text-gray-500 text-sm">{info.description}</div>
                    </div>
                  </button>
                  <div className="text-right">
                    <div className="text-ember-400 font-bold">Level {state.level}</div>
                    {state.level > 0 && (() => {
                      const config = BUILDING_PRODUCTION[type as keyof typeof BUILDING_PRODUCTION];
                      if (!config) return null;
                      const prod = calculateProduction(type as keyof typeof BUILDING_PRODUCTION, state.level);
                      return (
                        <div className={`text-xs ${RESOURCE_COLORS[config.resource]} mt-1`}>
                          +{prod.toFixed(1)}/h {RESOURCE_ICONS[config.resource]}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {state.isUpgrading && state.upgradeFinishAt ? (
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Upgrading...</div>
                      <GameTimer
                        finishAt={state.upgradeFinishAt}
                        onComplete={handleTimerComplete}
                        className="text-yellow-400"
                      />
                    </div>
                    <button
                      onClick={() => handleCancelUpgrade(type as BuildingType)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : !state.exists ? (
                  (() => {
                    const cost = getBuildingUpgradeCost(type as BuildingType, 0);
                    const costText = formatCost(cost);
                    return (
                      <button
                        onClick={() => handleBuild(type as BuildingType)}
                        disabled={buildingAction !== null}
                        className="mt-2 px-3 py-2 bg-ember-600 hover:bg-ember-500 text-white rounded transition-colors w-full disabled:opacity-50"
                      >
                        <div className="font-semibold">{buildingAction === type ? 'Building...' : 'Build'}</div>
                        {costText && <div className="text-sm text-gray-300 mt-0.5">{costText}</div>}
                      </button>
                    );
                  })()
                ) : (
                  (() => {
                    const cost = getBuildingUpgradeCost(type as BuildingType, state.level);
                    const costText = formatCost(cost);
                    return (
                      <button
                        onClick={() => handleUpgrade(type as BuildingType)}
                        disabled={buildingAction !== null}
                        className="mt-2 px-3 py-2 bg-ember-600 hover:bg-ember-500 text-white rounded transition-colors w-full disabled:opacity-50"
                      >
                        <div className="font-semibold">{buildingAction === type ? 'Building...' : (state.level === 0 ? 'Build Level 1' : 'Upgrade')}</div>
                        {costText && <div className="text-sm text-gray-300 mt-0.5">{costText}</div>}
                      </button>
                    );
                  })()
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedBuildingType && (
        <BuildingDetailModal
          buildingType={selectedBuildingType}
          currentLevel={getBuildingState(getBuilding(selectedBuildingType)).level}
          planet={planet}
          researchBonus={1.0}
          onClose={() => setSelectedBuildingType(null)}
        />
      )}
    </div>
  );
}
