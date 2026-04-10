import { useNavigate } from 'react-router-dom';
import type { PlayerSummary } from '../stores/adminStore';

interface PlayerCardProps {
  player: PlayerSummary;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const navigate = useNavigate();
  const lastActive = new Date(player.lastActive);
  const isActive = Date.now() - lastActive.getTime() < 300000;

  return (
    <div
      className="p-4 bg-admin-surface rounded-lg border border-admin-border hover:border-admin-border-hover cursor-pointer transition-colors"
      onClick={() => navigate(`/players/${player.id}`)}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-admin-success' : 'bg-admin-text-dim'}`} />
        <span className="text-sm font-medium text-admin-text-bright">{player.name}</span>
        {player.isBot && <span className="text-[10px] px-1.5 py-0.5 bg-admin-accent/20 text-admin-accent rounded">BOT</span>}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-admin-text-dim">
        <div>{player.planetCount} planets</div>
        <div>{player.fleetCount} fleets</div>
      </div>
      <div className="mt-2 text-[11px] text-admin-text-dim">
        Last active: {lastActive.toLocaleString()}
      </div>
    </div>
  );
}