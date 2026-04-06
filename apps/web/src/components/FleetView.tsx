import { useGameStore } from '../stores/gameStore';

export function FleetView() {
  const { fleets, planets } = useGameStore();

  const getPlanetName = (planetId: string) => {
    const planet = planets.find((p) => p.id === planetId);
    return planet?.name || 'Unknown';
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('de-DE');
  };

  const getMissionLabel = (mission: string) => {
    const labels: Record<string, string> = {
      attack: 'Attack',
      transport: 'Transport',
      deployment: 'Deploy',
      colonize: 'Colonize',
      harvest: 'Harvest',
      espionage: 'Espionage',
    };
    return labels[mission] || mission;
  };

  return (
    <div className="space-y-6">
      <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🚀 Fleets</h2>

        {fleets.length === 0 ? (
          <p className="text-gray-400">No fleets in transit</p>
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
                      from {getPlanetName(fleet.originPlanetId)}
                      {fleet.targetPlanetId && (
                        <> to {getPlanetName(fleet.targetPlanetId)}</>
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm">
                      Arrival: {formatTime(fleet.arrivesAt)}
                    </div>
                    <div className="text-gray-500 text-sm">
                      Return: {formatTime(fleet.returnsAt)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {fleet.ships?.length ?? 0} ship types
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Launch New Fleet</h3>
        <p className="text-gray-400">
          Launching fleets is not implemented in this demo.
        </p>
      </div>
    </div>
  );
}