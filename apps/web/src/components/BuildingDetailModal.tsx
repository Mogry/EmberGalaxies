import { useMemo } from 'react';
import type { BuildingType, Planet } from '@ember-galaxies/shared';
import { BUILDING_PRODUCTION, BUILDING_COSTS, calculateProduction } from '@ember-galaxies/shared';
import { getBuildingUpgradeCost } from '@ember-galaxies/shared';

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

interface BuildingDetailModalProps {
  buildingType: BuildingType;
  currentLevel: number;
  planet: Planet;
  researchBonus: number;
  onClose: () => void;
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

const COST_RESOURCES = ['iron', 'silver', 'ember', 'h2', 'energy'] as const;

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.round(n).toString();
}

export function BuildingDetailModal({
  buildingType,
  currentLevel,
  planet,
  researchBonus,
  onClose,
}: BuildingDetailModalProps) {
  const info = BUILDING_INFO[buildingType];
  const costs = BUILDING_COSTS[buildingType];
  const productionConfig = BUILDING_PRODUCTION[buildingType as keyof typeof BUILDING_PRODUCTION];

  const maxLevel = 21;

  const levels = useMemo(() => {
    return Array.from({ length: maxLevel }, (_, i) => i + 1);
  }, []);

  const productionRows = useMemo(() => {
    if (!productionConfig) return null;
    return levels.map((level) => {
      const prod = calculateProduction(
        buildingType as keyof typeof BUILDING_PRODUCTION,
        level,
        1.0, // planetModifier
        researchBonus
      );
      return { level, prod };
    });
  }, [buildingType, levels, researchBonus]);

  const costRows = useMemo(() => {
    return levels.map((level) => {
      const cost = costs[level];
      return { level, cost };
    });
  }, [levels, costs]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-galaxy-dark border border-galaxy-purple rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-galaxy-darker border-b border-galaxy-purple p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{info.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-white">{info.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{info.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none px-2 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Production Table */}
          {productionRows ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span>Production per Hour</span>
                <span className={`text-sm font-normal ${RESOURCE_COLORS[productionConfig.resource]}`}>
                  {RESOURCE_ICONS[productionConfig.resource]} {productionConfig.resource}
                </span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-galaxy-purple/50">
                      <th className="text-left py-2 px-3 font-medium">Level</th>
                      <th className="text-right py-2 px-3 font-medium">Output/h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionRows.map(({ level, prod }) => {
                      const isCurrent = level === currentLevel;
                      return (
                        <tr
                          key={level}
                          className={
                            isCurrent
                              ? 'bg-ember-600/20 border border-ember-500/50'
                              : 'border border-transparent hover:border-galaxy-purple/30'
                          }
                        >
                          <td className={`py-2 px-3 ${isCurrent ? 'text-ember-400 font-bold' : 'text-gray-300'}`}>
                            {isCurrent && '▶ '}{level}
                          </td>
                          <td className={`text-right py-2 px-3 font-mono ${isCurrent ? 'text-ember-400 font-bold' : RESOURCE_COLORS[productionConfig.resource]}`}>
                            +{prod.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Production per Hour</h3>
              <p className="text-gray-400 italic">This building does not produce resources.</p>
            </div>
          )}

          {/* Costs Table */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Upgrade Costs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-galaxy-purple/50">
                    <th className="text-left py-2 px-3 font-medium">Level</th>
                    {COST_RESOURCES.map((res) => (
                      <th key={res} className={`text-right py-2 px-3 font-medium ${RESOURCE_COLORS[res]}`}>
                        {RESOURCE_ICONS[res]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {costRows.map(({ level, cost }) => {
                    const isCurrent = level === currentLevel;
                    if (!cost) return null;
                    return (
                      <tr
                        key={level}
                        className={
                          isCurrent
                            ? 'bg-ember-600/20 border border-ember-500/50'
                            : 'border border-transparent hover:border-galaxy-purple/30'
                        }
                      >
                        <td className={`py-2 px-3 ${isCurrent ? 'text-ember-400 font-bold' : 'text-gray-300'}`}>
                          {isCurrent && '▶ '}{level}
                        </td>
                        {COST_RESOURCES.map((res) => {
                          const val = cost[res];
                          return (
                            <td
                              key={res}
                              className={`text-right py-2 px-3 font-mono ${isCurrent ? 'text-ember-400 font-bold' : 'text-gray-400'}`}
                            >
                              {val ? formatNumber(val) : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
