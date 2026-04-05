import { useState } from 'react';
import type { Planet, BuildingType, Building } from '@ember-galaxies/shared';
import { calculateProduction, BUILDING_PRODUCTION, getBuildingUpgradeCost } from '@ember-galaxies/shared';
import { useGameStore } from '../stores/gameStore';
import { GameTimer } from './GameTimer';

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
  zentrale: { name: 'Zentrale', icon: '🏛️', description: 'Zentrales Kontrollgebäude' },
  iron_mine: { name: 'Eisenmine', icon: '🔩', description: 'Fördert Eisenvorkommen' },
  silver_mine: { name: 'Silbermine', icon: '💎', description: 'Fördert Silberevorkommen' },
  uderon_raffinery: { name: 'Uderon-Raffinerie', icon: '🔥', description: 'Veredelt Uderon' },
  h2_refinery: { name: 'Wasserstoff-Raffinerie', icon: '⛽', description: 'Gewinnt H2 aus Meerwasser' },
  fusion_plant: { name: 'Fusionskraftwerk', icon: '⚛️', description: 'Erzeugt Energie durch Fusion' },
  research_center: { name: 'Forschungszentrum', icon: '🔬', description: 'Koordiniert Forschung' },
  shipyard: { name: 'Werft', icon: '🚀', description: 'Baut Raumschiffe' },
  space_station: { name: 'Raumstation', icon: '🛸', description: 'Orbitale Plattform' },
  anti_spy: { name: 'Anti-Spionage-Schild', icon: '🛡️', description: 'Verhindert Ausspähung' },
  planetary_shield: { name: 'Planetarer Schild', icon: '🌍', description: 'Abwehr aus dem Orbit' },
  dummy_building: { name: 'Dummy-Bau', icon: '📦', description: 'Platzhalter für Fastbuild' },
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
              Felder: {planet.fieldsUsed} / {planet.fieldsMax}
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
          <h3 className="text-lg font-semibold text-white">Gebäude</h3>
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
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <div className="text-white font-medium">{info.name}</div>
                      <div className="text-gray-500 text-sm">{info.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-ember-400 font-bold">Stufe {state.level}</div>
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
                      <div className="text-gray-400 text-xs mb-1">Ausbau läuft...</div>
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
                      Abbrechen
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
                        <div className="font-semibold">{buildingAction === type ? 'Baue...' : 'Bauen'}</div>
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
                        <div className="font-semibold">{buildingAction === type ? 'Baue...' : (state.level === 0 ? 'Stufe 1 bauen' : 'Ausbauen')}</div>
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
    </div>
  );
}
