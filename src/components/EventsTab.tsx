import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, MapPin, RefreshCw, Users } from 'lucide-react';

type EventItem = {
  event_id: number;
  event_title?: string;
  event_mb_image?: string;
  venue?: string;
  global_start_datetime?: string;
  global_end_datetime?: string;
  event_host?: string;
  organiserDisplay?: string;
  availability_status?: string;
  total_available_spots?: number | null;
};

const formatDateRange = (start?: string, end?: string): string => {
  if (!start && !end) {
    return 'TBA';
  }

  const fmt = new Intl.DateTimeFormat('en-HK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const startText = start ? fmt.format(new Date(start)) : 'TBA';
  const endText = end ? fmt.format(new Date(end)) : 'TBA';
  return `${startText} - ${endText}`;
};

const fallbackImage =
  'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80';

export const EventsTab: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/event_api.json');
      if (!res.ok) {
        throw new Error('Events request failed');
      }

      const payload = await res.json();
      const items = Array.isArray(payload?.items) ? payload.items : [];
      setEvents(items as EventItem[]);
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      setError('Unable to load local test events data.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Current Events</h2>
          <p className="text-xs text-slate-500">Template view using local testing JSON</p>
        </div>
        <button
          type="button"
          onClick={() => void loadEvents()}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{error}</div>
      )}

      {!loading && !events.length && !error && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">No events available right now.</div>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <article
            key={event.event_id}
            className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs"
          >
            <div className="relative h-36 w-full bg-slate-100">
              <img
                src={event.event_mb_image || fallbackImage}
                alt={event.event_title || 'Lingnan Event'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 border border-slate-200">
                {event.availability_status || 'available'}
              </span>
            </div>

            <div className="p-3.5 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                {event.event_title || 'Untitled Event'}
              </h3>

              <p className="text-xs text-slate-600 inline-flex items-start space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <span>{event.venue || 'Venue TBA'}</span>
              </p>

              <p className="text-xs text-slate-600 inline-flex items-start space-x-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{formatDateRange(event.global_start_datetime, event.global_end_datetime)}</span>
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="truncate mr-3">
                  Host: {event.organiserDisplay || event.event_host || 'Lingnan University'}
                </span>
                <span className="inline-flex items-center space-x-1 shrink-0">
                  <Users className="w-3.5 h-3.5" />
                  <span>{event.total_available_spots ?? '-'} spots</span>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="text-[11px] text-slate-500 px-1">
        Last updated: {lastUpdated || '--:--:--'}
      </div>
    </div>
  );
};
