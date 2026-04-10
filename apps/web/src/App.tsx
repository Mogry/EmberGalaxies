import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './api/client';
import { Layout } from './components/Layout';
import { LoginPage } from './components/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { GalaxyPage } from './pages/GalaxyPage';
import { EventsPage } from './pages/EventsPage';
import { PlayersPage } from './pages/PlayersPage';
import { PlayerDetailPage } from './pages/PlayerDetailPage';
import { useAdminWebSocket } from './hooks/useAdminWebSocket';

function ProtectedRoutes() {
  useAdminWebSocket();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<OverviewPage />} />
        <Route path="galaxy" element={<GalaxyPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="players/:id" element={<PlayerDetailPage />} />
      </Route>
    </Routes>
  );
}

function AuthGate() {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <ProtectedRoutes />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<AuthGate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;