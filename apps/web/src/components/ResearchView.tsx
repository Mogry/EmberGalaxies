import { useGameStore } from '../stores/gameStore';

const RESEARCH_INFO: Record<string, { name: string; icon: string; description: string }> = {
  energy_technology: { name: 'Energietechnik', icon: '⚡', description: 'Grundlage für viele Technologien' },
  laser_technology: { name: 'Lasertechnik', icon: '🔦', description: 'Verbessert Waffen' },
  ion_technology: { name: 'Iontechnik', icon: '⚛️', description: 'Verbessert Waffen' },
  hyperspace_technology: { name: 'Hyperraumtechnik', icon: '🌀', description: 'Ermöglicht fortschrittliche Schiffe' },
  plasma_technology: { name: 'Plasmatechnik', icon: '🔥', description: 'Verbessert Produktion' },
  combustion_drive: { name: 'Verbrennungstriebwerk', icon: '🚀', description: 'Erhöht Geschwindigkeit' },
  impulse_drive: { name: 'Impulstriebwerk', icon: '💨', description: 'Erhöht Geschwindigkeit' },
  hyperspace_drive: { name: 'Hyperraumtriebwerk', icon: '🌌', description: 'Erhöht Geschwindigkeit' },
  espionage_technology: { name: 'Spionagetechnik', icon: '🕵️', description: 'Verbessert Spionageberichte' },
  computer_technology: { name: 'Computertechnik', icon: '💻', description: 'Erhöht Kolonienlimit' },
  astrophysics: { name: 'Astrophysik', icon: '🔭', description: 'Ermöglicht Expeditionen' },
  shield_technology: { name: 'Schildtechnik', icon: '🛡️', description: 'Verbessert Verteidigung' },
  armour_technology: { name: 'Panzerungstechnik', icon: '🔩', description: 'Verbessert Hülle' },
  weapons_technology: { name: 'Waffentechnik', icon: '⚔️', description: 'Verbessert Angriff' },
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
        <h2 className="text-2xl font-bold text-white mb-4">🔬 Forschung</h2>

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
                    Stufe {getResearchLevel(type)}
                  </div>
                  {isResearching(type) ? (
                    <span className="text-yellow-400 text-sm">In Forschung</span>
                  ) : (
                    <button
                      onClick={() => handleResearch(type)}
                      className="mt-1 px-3 py-1 bg-ember-600 hover:bg-ember-500 text-white text-sm rounded transition-colors"
                    >
                      Erforschen
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