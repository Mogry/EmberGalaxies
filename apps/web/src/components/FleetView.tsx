import { useGameStore } from '../stores/gameStore';

export function FleetView() {
  const { fleets, planets } = useGameStore();

  const getPlanetName = (planetId: string) => {
    const planet = planets.find((p) => p.id === planetId);
    return planet?.name || 'Unbekannt';
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('de-DE');
  };

  const getMissionLabel = (mission: string) => {
    const labels: Record<string, string> = {
      attack: 'Angriff',
      transport: 'Transport',
      deployment: 'Stationierung',
      colonize: 'Kolonisation',
      harvest: 'Ernte',
      espionage: 'Spionage',
    };
    return labels[mission] || mission;
  };

  return (
    <div className="space-y-6">
      <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🚀 Flotten</h2>

        {fleets.length === 0 ? (
          <p className="text-gray-400">Keine Flotten unterwegs</p>
        ) : (
          <div className="space-y-4">
            {fleets.map((fleet) => (
              <div
                key={fleet.id}
                className="bg-galaxy-darker rounded-lg p-4 border border-galaxy-purple/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-white font-medium">
                      {getMissionLabel(fleet.mission)}
                    </span>
                    <span className="text-gray-400 ml-2">
                      von {getPlanetName(fleet.originPlanetId)}
                      {fleet.targetPlanetId && (
                        <> nach {getPlanetName(fleet.targetPlanetId)}</>
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm">
                      Ankunft: {formatTime(fleet.arrivesAt)}
                    </div>
                    <div className="text-gray-500 text-sm">
                      Rückkehr: {formatTime(fleet.returnsAt)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {fleet.ships?.length ?? 0} Schiffstypen
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Neue Flotte starten</h3>
        <p className="text-gray-400">
          Flotte starten ist in dieser Demo noch nicht implementiert.
        </p>
      </div>
    </div>
  );
}