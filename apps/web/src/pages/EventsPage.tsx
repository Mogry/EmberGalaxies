import { useEffect, useRef, useState } from 'react';
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
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchEvents = async (cursor?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (eventFilters.type) params.set('type', eventFilters.type);
      if (eventFilters.playerId) params.set('playerId', eventFilters.playerId);
      if (cursor) params.set('cursor', cursor);

      const data = await adminFetch<{ events: GameEventEntry[]; nextCursor: string | null }>(`/events?${params}`);
      if (cursor) {
        setEvents((prev) => [...prev, ...data.events]);
      } else {
        setEvents(data.events);
      }
      setNextCursor(data.nextCursor);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadMore = () => {
    if (nextCursor) fetchEvents(nextCursor);
  };

  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events.length, autoScroll]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchEvents();
  }, [eventFilters.type, eventFilters.playerId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-admin-text-bright">Events</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchEvents()}
            className="text-xs text-admin-accent hover:text-admin-accent-hover"
          >
            Refresh
          </button>
          <label className="flex items-center gap-1.5 text-xs text-admin-text-dim cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="accent-admin-accent"
            />
            Auto-scroll
          </label>
        </div>
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

      <div ref={listRef} className="bg-admin-surface rounded-lg border border-admin-border overflow-hidden max-h-[600px] overflow-y-auto">
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

      {nextCursor && (
        <button
          onClick={loadMore}
          className="w-full py-2 text-sm text-admin-accent hover:text-admin-accent-hover"
        >
          Load more events
        </button>
      )}
    </div>
  );
}