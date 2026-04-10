import { useEffect, useState } from 'react';
import { useAdminStore } from '../stores/adminStore';
import { adminFetch } from '../api/client';
import { EventRow } from '../components/EventRow';
import type { GameEventEntry } from '../stores/adminStore';

const eventTypes = [
  { value: '', label: 'All Types' },
  { value: 'building_complete', label: 'Building' },
  { value: 'ship_complete', label: 'Ship' },
  { value: 'research_complete', label: 'Research' },
  { value: 'fleet_launch', label: 'Fleet Launch' },
  { value: 'fleet_arrival', label: 'Fleet Arrival' },
  { value: 'fleet_return', label: 'Fleet Return' },
  { value: 'combat_report', label: 'Combat' },
  { value: 'planet_colonized', label: 'Colonized' },
];

export function EventsPage() {
  const { events, eventFilters, setEvents, setEventFilter } = useAdminStore();
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (eventFilters.type) params.set('type', eventFilters.type);
      if (eventFilters.playerId) params.set('playerId', eventFilters.playerId);

      const data = await adminFetch<{ events: GameEventEntry[] }>(`/events?${params}`);
      setEvents(data.events);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [eventFilters.type, eventFilters.playerId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-admin-text-bright">Events</h2>
        <button
          onClick={fetchEvents}
          className="text-xs text-admin-accent hover:text-admin-accent-hover"
        >
          Refresh
        </button>
      </div>

      <div className="flex gap-3">
        <select
          value={eventFilters.type ?? ''}
          onChange={(e) => setEventFilter('type', e.target.value || null)}
          className="px-3 py-1.5 bg-admin-surface border border-admin-border rounded-md text-sm text-admin-text focus:outline-none focus:border-admin-accent"
        >
          {eventTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-admin-surface rounded-lg border border-admin-border overflow-hidden">
        {loading && (
          <div className="px-4 py-6 text-center text-sm text-admin-text-dim">Loading...</div>
        )}
        {!loading && events.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-admin-text-dim">No events found</div>
        )}
        {!loading && events.map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}