import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  Bus,
  ChevronRight,
  Clock,
  CloudLightning,
  Flame,
  MapPin,
  Snowflake,
  SunMedium,
  Umbrella,
  Wallet,
  Wind,
} from 'lucide-react';
import { HOME_IMPORTANT_NOTICES, HomeNoticeKind } from '../data/mockData';
import { useAppPreferences } from '../context/AppPreferencesContext';
import {
  fetchHomeTransportEtas,
  HomeTransportEtaRow,
} from '../lib/homeTransport';
import {
  fetchScheduledRegisteredCourses,
  getUpcomingScheduledClassToday,
  toScheduledCourseSession,
} from '../lib/registeredCourseMeetings';
import { RegisteredCourse } from '../lib/registeredCourses';
import { TabType } from './NavigationBottomBar';
import homeBanner from '../assets/images/home_banner_1.jpg';

interface HomeTabProps {
  onNavigate: (tab: TabType) => void;
  onOpenLibraryModal: () => void;
  onOpenEfeesNotes?: () => void;
}

type PlaceReading = {
  place?: string;
  value?: number | string;
  max?: number | string;
  min?: number | string;
};

type RhrReadResponse = {
  updateTime?: string;
  temperature?: { data?: PlaceReading[] };
  humidity?: { data?: PlaceReading[] };
  rainfall?: { data?: PlaceReading[] };
};

type WarnSumResponse = Record<string, { name?: string; actionCode?: string }>;

type HomeWeatherState = {
  temperatureC: number | null;
  humidityPct: number | null;
  rainfallMm: number | null;
  warningItems: Array<{ code: string; label: string }>;
  specialTip: string;
  lastUpdated: string;
  isLoading: boolean;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const isTuenMunPlace = (text: string): boolean => /屯門|tuen\s*mun/i.test(text);

const findPlaceReading = (list: PlaceReading[] | undefined, matcher: (place: string) => boolean): PlaceReading | undefined =>
  list?.find((item) => matcher(item.place || ''));

const extractHourlyRainfall = (payload: unknown): number | null => {
  if (!payload || typeof payload !== 'object') return null;

  const base = payload as Record<string, unknown>;
  const candidates = [
    base.hourlyRainfall,
    base.data,
    payload,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;

    const row = candidate.find((item) => {
      if (!item || typeof item !== 'object') return false;
      const obj = item as Record<string, unknown>;
      const placeHint = [
        obj.automaticWeatherStation,
        obj.automaticWeatherStationName,
        obj.place,
        obj.station,
        obj.station_name,
      ]
        .filter(Boolean)
        .join(' ');
      return isTuenMunPlace(placeHint);
    }) as Record<string, unknown> | undefined;

    if (!row) continue;

    const rainfallValue = toNumber(
      row.value ?? row.max ?? row.min ?? row.rainfall ?? row.oneHourRainfall ?? row.hourlyRainfall,
    );
    if (rainfallValue !== null) return rainfallValue;
  }

  return null;
};

const formatUpdateTime = (isoText: string | undefined): string => {
  if (!isoText) return '--:--';
  const date = new Date(isoText);
  if (Number.isNaN(date.getTime())) return '--:--';
  return new Intl.DateTimeFormat('en-HK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const parseWarningItems = (warnsum: WarnSumResponse | null): Array<{ code: string; label: string }> => {
  if (!warnsum) return [];

  return Object.entries(warnsum)
    .filter(([, entry]) => !!entry)
    .map(([code, entry]) => ({ code, label: entry?.name || code }));
};

const getWarningIcon = (code: string): React.ComponentType<{ className?: string }> => {
  if (/^WRAIN|^WRAINA|^WRAINR|^WRAINB/i.test(code)) return Umbrella;
  if (/^WTCSGNL|^TC\d+|^TC8/i.test(code)) return Wind;
  if (/^WTS/i.test(code)) return CloudLightning;
  if (/^WHOT/i.test(code)) return Flame;
  if (/^WCOLD/i.test(code)) return Snowflake;
  return AlertTriangle;
};

const noticeMeta: Record<
  HomeNoticeKind,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    chipClass: string;
    cardClass: string;
  }
> = {
  efees: {
    label: 'eFees',
    icon: Wallet,
    chipClass: 'home-notice-chip--efees',
    cardClass: 'home-notice-card--efees',
  },
  custom: {
    label: 'Notice',
    icon: AlertTriangle,
    chipClass: 'home-notice-chip--custom',
    cardClass: 'home-notice-card--custom',
  },
};

const extractSpecialTip = (payload: unknown): string => {
  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0] as Record<string, unknown>;
    return String(first.desc || first.details || first.message || '').trim();
  }

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const listLike = obj.swt || obj.data || obj.specialWeatherTips;
    if (Array.isArray(listLike) && listLike.length > 0) {
      const first = listLike[0] as Record<string, unknown>;
      return String(first.desc || first.details || first.message || '').trim();
    }
    const single = String(obj.desc || obj.details || obj.message || '').trim();
    if (single) return single;
  }

  return '';
};

export const HomeTab: React.FC<HomeTabProps> = ({ onNavigate, onOpenEfeesNotes }) => {
  const { homeTransportRoutes, openInAppBrowser } = useAppPreferences();
  const [transportRows, setTransportRows] = useState<HomeTransportEtaRow[]>([]);
  const [transportLoading, setTransportLoading] = useState<boolean>(true);
  const [weather, setWeather] = useState<HomeWeatherState>({
    temperatureC: null,
    humidityPct: null,
    rainfallMm: null,
    warningItems: [],
    specialTip: '',
    lastUpdated: '--:--',
    isLoading: true,
  });
  const [nextClass, setNextClass] = useState<ReturnType<typeof toScheduledCourseSession> | null>(
    null,
  );
  const [nextClassLoading, setNextClassLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadUpcomingClass = async () => {
      setNextClassLoading(true);
      try {
        const courses = await fetchScheduledRegisteredCourses();
        const upcoming: RegisteredCourse | null = getUpcomingScheduledClassToday(courses);
        if (!cancelled) {
          setNextClass(upcoming ? toScheduledCourseSession(upcoming) : null);
        }
      } catch {
        if (!cancelled) {
          setNextClass(null);
        }
      } finally {
        if (!cancelled) {
          setNextClassLoading(false);
        }
      }
    };

    void loadUpcomingClass();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTransport = async () => {
      setTransportLoading(true);
      try {
        const rows = await fetchHomeTransportEtas(homeTransportRoutes);
        if (!cancelled) {
          setTransportRows(rows);
        }
      } catch {
        if (!cancelled) {
          setTransportRows([]);
        }
      } finally {
        if (!cancelled) {
          setTransportLoading(false);
        }
      }
    };

    void loadTransport();
    const timer = window.setInterval(() => {
      void loadTransport();
    }, 120000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [homeTransportRoutes]);

  useEffect(() => {
    let isMounted = true;

    const loadWeather = async () => {
      const requests = await Promise.allSettled([
        fetch('/api/hko/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en'),
        fetch('/api/hko/weatherAPI/opendata/hourlyRainfall.php?lang=en'),
        fetch('/api/hko/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en'),
        fetch('/api/hko/weatherAPI/opendata/weather.php?dataType=warningInfo&lang=en'),
        fetch('/api/hko/weatherAPI/opendata/weather.php?dataType=swt&lang=en'),
      ]);

      const readJson = async (result: PromiseSettledResult<Response>): Promise<unknown> => {
        if (result.status !== 'fulfilled' || !result.value.ok) return null;
        try {
          return await result.value.json();
        } catch {
          return null;
        }
      };

      const [rhrPayload, hourlyPayload, warnsumPayload, warningInfoPayload, swtPayload] = await Promise.all([
        readJson(requests[0]),
        readJson(requests[1]),
        readJson(requests[2]),
        readJson(requests[3]),
        readJson(requests[4]),
      ]);

      const rhr = (rhrPayload || {}) as RhrReadResponse;
      const tmTemp = findPlaceReading(rhr.temperature?.data, isTuenMunPlace);
      const tmHumidity =
        findPlaceReading(rhr.humidity?.data, isTuenMunPlace) ||
        findPlaceReading(rhr.humidity?.data, (place) => /香港天文台|hong\s+kong\s+observatory/i.test(place));
      const tmRain = findPlaceReading(rhr.rainfall?.data, isTuenMunPlace);

      const rainfallFromRhr =
        toNumber(tmRain?.value) ??
        toNumber(tmRain?.max) ??
        toNumber(tmRain?.min);
      const rainfallFromHourly = extractHourlyRainfall(hourlyPayload);
      const warningItems = parseWarningItems((warnsumPayload || null) as WarnSumResponse | null);

      const warningInfoText = extractSpecialTip(warningInfoPayload);
      const specialTipText = extractSpecialTip(swtPayload) || warningInfoText;

      if (!isMounted) return;

      setWeather({
        temperatureC: toNumber(tmTemp?.value),
        humidityPct: toNumber(tmHumidity?.value),
        rainfallMm: rainfallFromHourly ?? rainfallFromRhr,
        warningItems,
        specialTip: specialTipText,
        lastUpdated: formatUpdateTime(rhr.updateTime),
        isLoading: false,
      });
    };

    void loadWeather();
    const timer = window.setInterval(() => {
      void loadWeather();
    }, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="page-shell page-shell--home space-y-4">
      <section className="home-banner" aria-label="Campus weather banner">
        <img
          src={homeBanner}
          alt="Lingnan campus banner"
          className="home-banner__img"
        />
        <div className="home-banner__overlay" />

        <div className="home-banner__content">
          <div className="home-banner__chips">
            {weather.warningItems.length > 0 ? (
              weather.warningItems.slice(0, 4).map((item) => {
                const WarningIcon = getWarningIcon(item.code);
                return (
                  <span
                    key={item.code}
                    className="home-banner__chip"
                    title={item.label}
                  >
                    <WarningIcon className="home-banner__chip-icon" />
                    <span className="home-banner__chip-label">{item.label}</span>
                  </span>
                );
              })
            ) : (
              <span className="home-banner__chip home-banner__chip--clear">
                <SunMedium className="home-banner__chip-icon home-banner__chip-icon--sun" />
                No active warning
              </span>
            )}
          </div>

          <div className="home-banner__body">
            <div className="home-banner__row">
              <div>
                <p className="home-banner__place">Tuen Mun</p>
                <p className="home-banner__temp">
                  {weather.temperatureC ?? '--'}
                  <span className="home-banner__temp-unit">°C</span>
                </p>
              </div>
              <div className="home-banner__rain">
                <p className="home-banner__rain-label">
                  <Umbrella className="home-banner__chip-icon" />
                  Rain
                </p>
                <p className="home-banner__rain-value">
                  {weather.rainfallMm ?? '--'}
                  <span className="home-banner__rain-unit">mm</span>
                </p>
              </div>
            </div>

            <p className="home-banner__updated">
              Updated {weather.lastUpdated}
              {weather.isLoading ? ' · Loading…' : ''}
            </p>
          </div>
        </div>
      </section>

      {/* Next Upcoming Lecture Card */}
      <div>
        <h3 className="home-section__title">Upcoming Class</h3>
        <div className="home-panel">
          {nextClassLoading ? (
            <p className="home-upcoming__empty">Loading today’s classes…</p>
          ) : nextClass ? (
            <>
              <div className="home-upcoming__head">
                <div className="home-upcoming__status">
                  <span className="home-upcoming__ping" />
                  <span className="home-upcoming__badge">Next Up Today</span>
                </div>
                <span className="home-upcoming__time">
                  <Clock className="home-upcoming__time-icon" />
                  <span>
                    {nextClass.startTime} - {nextClass.endTime}
                  </span>
                </span>
              </div>

              <div>
                <div className="home-upcoming__course">
                  <span className="home-upcoming__code">{nextClass.courseCode}</span>
                  <span className="home-upcoming__name">{nextClass.courseName}</span>
                </div>
                <div className="home-upcoming__venue-row">
                  <MapPin className="home-upcoming__venue-icon" />
                  <span className="home-upcoming__venue">{nextClass.venue}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="home-upcoming__empty">No more classes scheduled for today.</p>
          )}
        </div>
      </div>

      {/* Important Notices */}
      <div>
        <div className="home-section__head">
          <h3 className="home-section__title">Important Notices</h3>
          {/* <span className="home-section__count">
            {HOME_IMPORTANT_NOTICES.length} items
          </span> */}
        </div>
        <div className="home-notice-list">
          {HOME_IMPORTANT_NOTICES.map((notice) => {
            const meta = noticeMeta[notice.kind];
            const Icon = meta.icon;
            const content = (
              <div className="home-notice-card__content">
                <div className="home-notice-card__lead">
                  <div className="home-notice-card__icon">
                    <Icon className="home-notice-card__icon-svg" />
                  </div>
                  <div className="home-notice-card__body">
                    <div className="home-notice-card__meta">
                      <span className={`home-notice-chip ${meta.chipClass}`}>
                        {meta.label}
                      </span>
                      <span className="home-notice-card__time">{notice.timeLabel}</span>
                    </div>
                    <p className="home-notice-card__title">{notice.title}</p>
                    <p className="home-notice-card__message">{notice.message}</p>
                  </div>
                </div>
                {notice.action || notice.href ? (
                  <ChevronRight className="home-notice-card__chevron" />
                ) : null}
              </div>
            );

            if (notice.action === 'efees' && onOpenEfeesNotes) {
              return (
                <button
                  key={notice.id}
                  type="button"
                  onClick={onOpenEfeesNotes}
                  className={`home-notice-card ${meta.cardClass}`}
                >
                  {content}
                </button>
              );
            }

            if (notice.href) {
              return (
                <button
                  key={notice.id}
                  type="button"
                  onClick={() => openInAppBrowser(notice.href!, notice.title)}
                  className={`home-notice-card ${meta.cardClass}`}
                >
                  {content}
                </button>
              );
            }

            return (
              <div
                key={notice.id}
                className={`home-notice-card ${meta.cardClass}`}
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onNavigate('transport')}
        className="home-transport"
        aria-label="Open transport page"
      >
        <span className="home-transport__bookmark">
          <Bookmark className="home-transport__bookmark-icon" />
          Transport
        </span>
        <div className="home-transport__inner">
          <div className="home-transport__lead">
            <div className="home-transport__icon">
              <Bus className="home-transport__icon-svg" />
            </div>
            <div className="home-transport__body">
              <div className="home-transport__meta">
                <span className="home-transport__status">
                  {transportLoading ? 'Updating…' : 'Live'}
                </span>
              </div>

              <div className="home-transport__list">
                {transportRows.map((row) => (
                  <div key={row.id} className="home-transport-row">
                    <div className="home-transport-row__info">
                      <p className="home-transport-row__label">
                        {row.label}
                        <span className="home-transport-row__provider">· {row.provider}</span>
                      </p>
                      <p className="home-transport-row__note">
                        {row.note || row.stopHint}
                      </p>
                    </div>
                    <div className="home-transport-row__etas">
                      <Clock className="home-transport-row__clock" />
                      {row.minutes.length > 0 ? (
                        row.minutes.map((mins) => (
                          <span
                            key={`${row.id}-${mins}`}
                            className="home-transport-row__eta"
                          >
                            {mins}m
                          </span>
                        ))
                      ) : (
                        <span className="home-transport-row__eta--empty">—</span>
                      )}
                    </div>
                  </div>
                ))}
                {!transportLoading && transportRows.length === 0 && (
                  <p className="home-transport__empty">No transport routes selected.</p>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="home-transport__chevron" />
        </div>
      </button>

    </div>
  );
};
