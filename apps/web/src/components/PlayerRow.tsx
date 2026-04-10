import { useNavigate } from 'react-router-dom';
import type { PlayerSummary } from '../stores/adminStore';

interface PlayerRowProps {
  player: PlayerSummary;
}

export function PlayerRow({ player }: PlayerRowProps) {
  const navigate = useNavigate();
  const lastActive = new Date(player.lastActive);
  const isActive = Date.now() - lastActive.getTime() < 300000;

  return (
    <tr
      className="border-b border-admin-border hover:bg-admin-surface-hover cursor-pointer transition-colors"
      onClick={() => navigate(`/players/${player.id}`)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-admin-success' : 'bg-admin-text-dim'}`} />
          <span className="text-sm text-admin-text-bright">{player.name}</span>
          {player.isBot && <span className="text-[10px] px-1.5 py-0.5 bg-admin-accent/20 text-admin-accent rounded">BOT</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-admin-text">{player.planetCount}</td>
      <td className="px-4 py-3 text-sm text-admin-text">{player.fleetCount}</td>
      <td className="px-4 py-3 text-xs text-admin-text-dim">{lastActive.toLocaleString()}</td>
    </tr>
  );
}