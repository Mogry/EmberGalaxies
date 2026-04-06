import { useGameStore } from '../stores/gameStore';
import type { Planet } from '@ember-galaxies/shared';

export function PlanetListView() {
  const { planets, setSelectedPlanet, setView } = useGameStore();

  const sortedPlanets = [...planets].sort((a, b) => {
    const aPos = (a.system?.galaxyIndex ?? 0) * 100000 + (a.system?.index ?? 0) * 100 + a.slot;
    const bPos = (b.system?.galaxyIndex ?? 0) * 100000 + (b.system?.index ?? 0) * 100 + b.slot;
    return aPos - bPos;
  });

  const handlePlanetClick = async (planet: Planet) => {
    const res = await fetch(`/api/game/planet/${planet.id}`);
    if (res.ok) {
      const fullPlanet = await res.json();
      setSelectedPlanet(fullPlanet);
      setView('planet');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple p-6">
        <h2 className="text-2xl font-bold text-white mb-2">🪐 My Planets</h2>
        <p className="text-gray-400">{sortedPlanets.length} Planet{sortedPlanets.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="bg-galaxy-dark rounded-lg border border-galaxy-purple overflow-hidden">
        <div className="divide-y divide-galaxy-purple/20">
          {sortedPlanets.map((planet) => (
            <div
              key={planet.id}
              onClick={() => handlePlanetClick(planet)}
              className="flex items-center px-6 py-4 hover:bg-ember-600/20 cursor-pointer transition-colors"
            >
              <span className="w-12 text-3xl mr-4">🌍</span>
              <div className="flex-1">
                <div className="text-white font-semibold text-lg">{planet.name}</div>
                <div className="text-gray-500 text-sm">
                  Galaxy {planet.system?.galaxyIndex ?? '?'} · System {planet.system?.index ?? '?'} · Slot {planet.slot}
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="text-blue-400 font-medium">🔩 {Math.round(planet.iron)}</div>
                  <div className="text-gray-600 text-xs">Iron</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-medium">💎 {Math.round(planet.silver)}</div>
                  <div className="text-gray-600 text-xs">Silver</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-400 font-medium">🔥 {Math.round(planet.ember)}</div>
                  <div className="text-gray-600 text-xs">Ember</div>
                </div>
                <div className="text-center">
                  <div className="text-cyan-400 font-medium">⛽ {Math.round(planet.h2)}</div>
                  <div className="text-gray-600 text-xs">H2</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-medium">⚡ {Math.round(planet.energy)}</div>
                  <div className="text-gray-600 text-xs">Energie</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedPlanets.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No planets yet. Colonize a planet in the Galaxy view.
          </div>
        )}
      </div>
    </div>
  );
}
