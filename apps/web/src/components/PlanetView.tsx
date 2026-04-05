import { useState } from 'react';
import type { Planet, BuildingType, Building } from '@ember-galaxies/shared';
import { useGameStore } from '../stores/gameStore';
import { GameTimer } from './GameTimer';

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

// Berechnet den Ist-Zustand aus der DB - JEDER RENDER neu
function getBuildingState(building: Building | undefined) {
  const now = new Date();

  // Kein Building existiert
  if (!building) {
    return { exists: false as const, level: 0, isUpgrading: false, upgradeFinishAt: null };
  }

  // Kein upgradeFinishAt = kein Ausbau
  if (!building.upgradeFinishAt) {
    return { exists: true as const, level: building.level, isUpgrading: false, upgradeFinishAt: null };
  }

  const finishTime = new Date(building.upgradeFinishAt);

  // Upgrade ist noch nicht fertig
  if (now < finishTime) {
    return { exists: true as const, level: building.level, isUpgrading: true, upgradeFinishAt: building.upgradeFinishAt };
  }

  // Upgrade ist fertig (Zeit ist vorbei)
  // level wird durch processExpiredTimers bereits erhöht, aber zur Sicherheit +1
  return { exists: true as const, level: building.level + 1, isUpgrading: false, upgradeFinishAt: null };
}

export function PlanetView({ planet }: PlanetViewProps) {
  const { updatePlanet } = useGameStore();
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
        const updated = await fetch(`/api/game/planet/${planet.id}`).then(r => r.json());
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
        const updated = await fetch(`/api/game/planet/${planet.id}`).then(r => r.json());
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
      const updated = await fetch(`/api/game/planet/${planet.id}`).then(r => r.json());
      updatePlanet(updated);
    }
  };

  const handleTimerComplete = async () => {
    // Refetch um den aktuellen Zustand zu laden
    const updated = await fetch(`/api/game/planet/${planet.id}`).then(r => r.json());
    updatePlanet(updated);
  };

  const getBuilding = (type: BuildingType): Building | undefined => {
    return planet.buildings?.find(b => b.type === type);
  };

  return (
    <div className="space-y-6">
      <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple p-6">
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

      <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple overflow-hidden">
        <div className="bg-galaxy-purple/30 px-4 py-2">
          <h3 className="text-lg font-semibold text-white">Gebäude</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {Object.entries(BUILDING_INFO).map(([type, info]) => {
            const building = getBuilding(type as BuildingType);
            // Berechne Zustand aus DB (Source of Truth)
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
                  </div>
                </div>

                {/* Upgrade läuft - Timer anzeigen */}
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
                  /* Building existiert nicht - Bauen Button */
                  <button
                    onClick={() => handleBuild(type as BuildingType)}
                    disabled={buildingAction !== null}
                    className="mt-2 px-3 py-1 bg-ember-600 hover:bg-ember-500 text-white text-sm rounded transition-colors w-full disabled:opacity-50"
                  >
                    {buildingAction === type ? 'Baue...' : 'Bauen'}
                  </button>
                ) : (
                  /* Building existiert, kein Upgrade läuft - Ausbauen Button */
                  <button
                    onClick={() => handleUpgrade(type as BuildingType)}
                    disabled={buildingAction !== null}
                    className="mt-2 px-3 py-1 bg-ember-600 hover:bg-ember-500 text-white text-sm rounded transition-colors w-full disabled:opacity-50"
                  >
                    {buildingAction === type ? 'Baue...' : (state.level === 0 ? 'Stufe 1 bauen' : 'Ausbauen')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
