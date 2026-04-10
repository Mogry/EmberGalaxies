import { NavLink } from 'react-router-dom';
import { useAdminStore } from '../stores/adminStore';

const navItems = [
  { to: '/', label: 'Overview', icon: '◉' },
  { to: '/galaxy', label: 'Galaxy', icon: ' ◎' },
  { to: '/events', label: 'Events', icon: '⚡' },
  { to: '/players', label: 'Players', icon: '◈' },
];

export function Sidebar() {
  const { stats, connected } = useAdminStore();

  return (
    <aside className="w-56 min-h-screen flex flex-col border-r border-admin-border bg-admin-surface">
      <div className="px-4 py-5 border-b border-admin-border">
        <h1 className="text-admin-text-bright font-semibold text-base tracking-tight">Ember Galaxies</h1>
        <p className="text-admin-text-dim text-xs mt-0.5">Admin Dashboard</p>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-admin-accent/10 text-admin-accent'
                  : 'text-admin-text-dim hover:text-admin-text hover:bg-admin-surface-hover'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-admin-border space-y-2">
        {stats && (
          <div className="text-xs text-admin-text-dim">
            {stats.totalPlayers} players &middot; {stats.activeFleets} fleets
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-admin-success' : 'bg-admin-danger'}`} />
          <span className="text-admin-text-dim">{connected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>
    </aside>
  );
}