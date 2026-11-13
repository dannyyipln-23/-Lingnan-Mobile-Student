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
    <div className="evt-page">
      <div className="evt-header">
        <div>
          <h2 className="evt-header__title">Current Events</h2>
          <p className="evt-header__subtitle">Template view using local testing JSON</p>
        </div>
        <button type="button" onClick={() => void loadEvents()} className="evt-refresh">
          <RefreshCw className={`evt-refresh__icon${loading ? ' is-spinning' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && <div className="evt-error">{error}</div>}

      {!loading && !events.length && !error && (
        <div className="evt-empty">No events available right now.</div>
      )}

      <div className="evt-list">
        {events.map((event) => (
          <article key={event.event_id} className="evt-card">
            <div className="evt-card__media">
              <img
                src={event.event_mb_image || fallbackImage}
                alt={event.event_title || 'Lingnan Event'}
                className="evt-card__img"
                referrerPolicy="no-referrer"
              />
              <span className="evt-card__status">
                {event.availability_status || 'available'}
              </span>
            </div>

            <div className="evt-card__body">
              <h3 className="evt-card__title">{event.event_title || 'Untitled Event'}</h3>

              <p className="evt-card__row">
                <MapPin className="evt-card__icon evt-card__icon--pin" />
                <span>{event.venue || 'Venue TBA'}</span>
              </p>

              <p className="evt-card__row">
                <CalendarDays className="evt-card__icon evt-card__icon--cal" />
                <span>{formatDateRange(event.global_start_datetime, event.global_end_datetime)}</span>
              </p>

              <div className="evt-card__footer">
                <span className="evt-card__host">
                  Host: {event.organiserDisplay || event.event_host || 'Lingnan University'}
                </span>
                <span className="evt-card__spots">
                  <Users className="h-3.5 w-3.5" />
                  <span>{event.total_available_spots ?? '-'} spots</span>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="evt-footer">Last updated: {lastUpdated || '--:--:--'}</div>
    </div>
  );
};
