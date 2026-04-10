import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameEventEntry } from '../stores/adminStore';

const typeIcons: Record<string, string> = {
  building_complete: '🏠',
  ship_complete: '🚢',
  research_complete: '🔬',
  fleet_launch: '🚀',
  fleet_arrival: '📍',
  fleet_return: '↩️',
  combat_report: '⚔️',
  planet_colonized: '🌍',
};

const typeColors: Record<string, string> = {
  building_complete: 'text-admin-info',
  ship_complete: 'text-admin-info',
  research_complete: 'text-admin-accent',
  fleet_launch: 'text-admin-warning',
  fleet_arrival: 'text-admin-warning',
  fleet_return: 'text-admin-text-dim',
  combat_report: 'text-admin-danger',
  planet_colonized: 'text-admin-success',
};

interface EventRowProps {
  event: GameEventEntry;
}

export function EventRow({ event }: EventRowProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const icon = typeIcons[event.type] ?? '•';
  const color = typeColors[event.type] ?? 'text-admin-text';

  const timeAgo = (() => {
    const diff = Date.now() - new Date(event.createdAt).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  })();

  return (
    <div
      className="border-b border-admin-border last:border-0 hover:bg-admin-surface-hover cursor-pointer transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-lg">{icon}</span>
        <span className={`text-sm font-medium ${color}`}>{event.type.replace(/_/g, ' ')}</span>
        {event.player && (
          <button
            className="text-xs text-admin-accent hover:underline"
            onClick={(e) => { e.stopPropagation(); navigate(`/players/${event.player!.id}`); }}
          >
            {event.player.name}
          </button>
        )}
        <span className="ml-auto text-xs text-admin-text-dim">{timeAgo}</span>
      </div>
      {expanded && (
        <div className="px-4 pb-3 pl-12 text-xs text-admin-text-dim space-y-1">
          {event.planetId && <div>Planet: {event.planetId}</div>}
          {event.fleetId && <div>Fleet: {event.fleetId}</div>}
          {Object.keys(event.data).length > 0 && (
            <pre className="mt-1 p-2 bg-admin-bg rounded text-xs overflow-x-auto">{JSON.stringify(event.data, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}