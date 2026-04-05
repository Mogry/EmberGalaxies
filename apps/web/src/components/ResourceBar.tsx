import { useGameStore } from '../stores/gameStore';

export function ResourceBar() {
  const { selectedPlanet } = useGameStore();

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

  return (
    <div className="bg-galaxy-dark border-b border-galaxy-purple py-2">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {selectedPlanet.name}
        </div>
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
      </div>
    </div>
  );
}