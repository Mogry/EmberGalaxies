import { useGameStore } from './stores/gameStore';
import { GalaxyView } from './components/GalaxyView';
import { PlanetView } from './components/PlanetView';
import { FleetView } from './components/FleetView';
import { ResearchView } from './components/ResearchView';
import { ResourceBar } from './components/ResourceBar';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const { player, selectedPlanet, view, setView } = useGameStore();
  useWebSocket();

  if (!player) {
    return <StartScreen />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <ResourceBar />

      <nav className="" style={{ backgroundColor: '#050510', borderBottom: '1px solid #1a1a3a' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {['galaxy', 'planet', 'fleet', 'research'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as 'galaxy' | 'planet' | 'fleet' | 'research')}
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
        {view === 'planet' && selectedPlanet && <PlanetView planet={selectedPlanet} />}
        {view === 'fleet' && <FleetView />}
        {view === 'research' && <ResearchView />}
      </main>
    </div>
  );
}

function StartScreen() {
  const { setPlayer, setPlanets } = useGameStore();

  const handleStart = async () => {
    try {
      // Create player with unique name
      const playerName = `Commander_${Date.now().toString(36)}`;
      const playerRes = await fetch('/api/game/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, isBot: false }),
      });

      if (!playerRes.ok) {
        throw new Error('Failed to create player');
      }

      const player = await playerRes.json();

      // Create starter planet
      const planetRes = await fetch(`/api/game/planet/starter/${player.id}`, {
        method: 'POST',
      });

      if (!planetRes.ok) {
        throw new Error('Failed to create planet');
      }

      const planet = await planetRes.json();

      setPlayer(player);
      setPlanets([planet]);
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Fehler beim Starten des Spiels. Siehe Console für Details.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(circle at center, #1a1a3a 0%, #050510 100%)' }}>
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ color: '#fb923c' }}>
          EmberGalaxies
        </h1>
        <p className="mb-8 text-lg" style={{ color: '#9ca3af' }}>
          Erobern Sie die Galaxie
        </p>
        <button
          onClick={handleStart}
          className="px-8 py-4 text-white font-semibold text-xl"
          style={{ backgroundColor: '#ea580c', borderRadius: '8px', cursor: 'pointer' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
        >
          Spiel starten
        </button>
      </div>
    </div>
  );
}

export default App;