import { useGameStore } from '../stores/gameStore';

const RESEARCH_INFO: Record<string, { name: string; icon: string; description: string }> = {
  energy_technology: { name: 'Energy Technology', icon: '⚡', description: 'Foundation for many technologies' },
  laser_technology: { name: 'Laser Technology', icon: '🔦', description: 'Improves weapons' },
  ion_technology: { name: 'Ion Technology', icon: '⚛️', description: 'Improves weapons' },
  hyperspace_technology: { name: 'Hyperspace Technology', icon: '🌀', description: 'Enables advanced ships' },
  plasma_technology: { name: 'Plasma Technology', icon: '🔥', description: 'Improves production' },
  combustion_drive: { name: 'Combustion Drive', icon: '🚀', description: 'Increases speed' },
  impulse_drive: { name: 'Impulse Drive', icon: '💨', description: 'Increases speed' },
  hyperspace_drive: { name: 'Hyperspace Drive', icon: '🌌', description: 'Increases speed' },
  espionage_technology: { name: 'Espionage Technology', icon: '🕵️', description: 'Improves espionage reports' },
  computer_technology: { name: 'Computer Technology', icon: '💻', description: 'Increases colony limit' },
  astrophysics: { name: 'Astrophysics', icon: '🔭', description: 'Enables expeditions' },
  shield_technology: { name: 'Shield Technology', icon: '🛡️', description: 'Improves defense' },
  armour_technology: { name: 'Armour Technology', icon: '🔩', description: 'Improves hull' },
  weapons_technology: { name: 'Weapons Technology', icon: '⚔️', description: 'Improves attack' },
};

export function ResearchView() {
  const { research, player } = useGameStore();

  const handleResearch = async (researchType: string) => {
    if (!player) return;

    try {
      await fetch('/api/research/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, researchType }),
      });
    } catch (error) {
      console.error('Failed to start research:', error);
    }
  };

  const getResearchLevel = (type: string) => {
    const r = research.find((r) => r.type === type);
    return r?.level || 0;
  };

  const isResearching = (type: string) => {
    const r = research.find((r) => r.type === type);
    return r?.isResearching || false;
  };

  return (
    <div className="space-y-6">
      <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🔬 Research</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(RESEARCH_INFO).map(([type, info]) => (
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
                  <div className="text-ember-400 font-bold">
                    Level {getResearchLevel(type)}
                  </div>
                  {isResearching(type) ? (
                    <span className="text-yellow-400 text-sm">Researching</span>
                  ) : (
                    <button
                      onClick={() => handleResearch(type)}
                      className="mt-1 px-3 py-1 bg-ember-600 hover:bg-ember-500 text-white text-sm rounded transition-colors"
                    >
                      Research
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}