import { useEffect, useState } from 'react';
import { useGameStore } from './stores/gameStore';
import { GalaxyView } from './components/GalaxyView';
import { PlanetView } from './components/PlanetView';
import { FleetView } from './components/FleetView';
import { ResearchView } from './components/ResearchView';
import { ResourceBar } from './components/ResourceBar';
import { PlanetListView } from './components/PlanetListView';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const { player, selectedPlanet, view, setView, setPlayer, setPlanets } = useGameStore();
  const [initializing, setInitializing] = useState(false);
  useWebSocket();

  useEffect(() => {
    if (player || initializing) return;
    setInitializing(true);

    const init = async () => {
      try {
        // Get or create the single human player
        const playerRes = await fetch('/api/game/player', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Commander', isBot: false }),
        });
        if (!playerRes.ok) throw new Error('Failed to get/create player');
        const newPlayer = await playerRes.json();
        setPlayer(newPlayer);

        // Load planets
        const planetsRes = await fetch(`/api/game/planets/${newPlayer.id}`);
        if (planetsRes.ok) {
          const planets = await planetsRes.json();
          setPlanets(planets);
        }
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };

    init();
  }, [player, initializing, setPlayer, setPlanets]);

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(circle at center, #1a1a3a 0%, #050510 100%)' }}>
        <p style={{ color: '#9ca3af' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <ResourceBar />

      <nav className="" style={{ backgroundColor: '#050510', borderBottom: '1px solid #1a1a3a' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {['galaxy', 'planets', 'planet', 'fleet', 'research'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as 'galaxy' | 'planets' | 'planet' | 'fleet' | 'research')}
                className={`px-4 py-3 capitalize`}
                style={{
                  color: view === v ? '#fb923c' : '#9ca3af',
                  borderBottom: view === v ? '2px solid #fb923c' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (view !== v) e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  if (view !== v) e.currentTarget.style.color = '#9ca3af';
                }}
              >
                {v === 'galaxy' && '🌌 '}
                {v === 'planets' && '🪐 '}
                {v === 'planet' && '🌍 '}
                {v === 'fleet' && '🚀 '}
                {v === 'research' && '🔬 '}
                {v}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {view === 'galaxy' && <GalaxyView />}
        {view === 'planets' && <PlanetListView />}
        {view === 'planet' && selectedPlanet && <PlanetView planet={selectedPlanet} />}
        {view === 'fleet' && <FleetView />}
        {view === 'research' && <ResearchView />}
      </main>
    </div>
  );
}

export default App;