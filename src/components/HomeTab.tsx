import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  BookOpen,
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
import { COURSES, HOME_IMPORTANT_NOTICES, HomeNoticeKind } from '../data/mockData';
import { useAppPreferences } from '../context/AppPreferencesContext';
import {
  fetchHomeTransportEtas,
  HomeTransportEtaRow,
} from '../lib/homeTransport';
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
    chipClass: 'border-rose-200 bg-rose-50 text-rose-700',
    cardClass: 'border-rose-100 bg-rose-50/40 hover:border-rose-200',
  },
  moodle: {
    label: 'Moodle',
    icon: BookOpen,
    chipClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    cardClass: 'border-indigo-100 bg-indigo-50/40 hover:border-indigo-200',
  },
  custom: {
    label: 'Reminder',
    icon: Bell,
    chipClass: 'border-amber-200 bg-amber-50 text-amber-800',
    cardClass: 'border-amber-100 bg-amber-50/40 hover:border-amber-200',
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

  const nextClass = COURSES[1]; // CDS2001 at 13:30

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
      <section
        className="relative w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm min-h-[10.5rem]"
        aria-label="Campus weather banner"
      >
        <img
          src={homeBanner}
          alt="Lingnan campus banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/35 to-slate-900/10" />

        <div className="relative z-10 flex min-h-[10.5rem] flex-col justify-between p-3.5 text-white">
          <div className="flex flex-wrap items-center gap-1.5">
            {weather.warningItems.length > 0 ? (
              weather.warningItems.slice(0, 4).map((item) => {
                const WarningIcon = getWarningIcon(item.code);
                return (
                  <span
                    key={item.code}
                    className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/35 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm"
                    title={item.label}
                  >
                    <WarningIcon className="h-3 w-3" />
                    <span className="max-w-[7.5rem] truncate">{item.label}</span>
                  </span>
                );
              })
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/30 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
                <SunMedium className="h-3 w-3 text-amber-300" />
                No active warning
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">Tuen Mun</p>
                <p className="text-3xl font-extrabold leading-none tracking-tight">
                  {weather.temperatureC ?? '--'}
                  <span className="ml-0.5 text-lg font-bold text-white/85">°C</span>
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-black/30 px-2.5 py-1.5 text-right backdrop-blur-sm">
                <p className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/80">
                  <Umbrella className="h-3 w-3" />
                  Rain
                </p>
                <p className="text-sm font-bold tabular-nums">
                  {weather.rainfallMm ?? '--'}
                  <span className="ml-0.5 text-[11px] font-semibold text-white/80">mm</span>
                </p>
              </div>
            </div>

            {weather.specialTip ? (
              <p className="line-clamp-2 text-[11px] leading-relaxed text-white/90">
                {weather.specialTip}
              </p>
            ) : null}

            <p className="text-[10px] text-white/65">
              Updated {weather.lastUpdated}
              {weather.isLoading ? ' · Loading…' : ''}
            </p>
          </div>
        </div>
      </section>

      {/* Next Upcoming Lecture Card */}
      <div>
        <h3 className="text-sm font-bold tracking-tight text-slate-900 px-0.5 mb-2">
          Upcoming Class
        </h3>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
                Next Up Today
              </span>
            </div>
            <span className="text-[11px] text-slate-500 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>
                {nextClass.startTime} - {nextClass.endTime}
              </span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">
                {nextClass.courseCode}
              </span>
              <span className="text-xs text-slate-700 font-semibold">{nextClass.courseName}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-2">
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="text-slate-800 font-medium">{nextClass.venue}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 pl-5">{nextClass.instructor}</p>
          </div>
        </div>
      </div>

      {/* Important Notices — eFees, Moodle, custom campus messages */}
      <div>
        <div className="mb-2 flex items-center justify-between px-0.5">
          <h3 className="text-sm font-bold tracking-tight text-slate-900">Important Notices</h3>
          <span className="text-[10px] font-semibold text-slate-500">
            {HOME_IMPORTANT_NOTICES.length} items
          </span>
        </div>
        <div className="space-y-2">
          {HOME_IMPORTANT_NOTICES.map((notice) => {
            const meta = noticeMeta[notice.kind];
            const Icon = meta.icon;
            const content = (
              <div className="flex items-start justify-between gap-2">
                <div className="inline-flex min-w-0 items-start gap-2.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${meta.chipClass}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">{notice.timeLabel}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{notice.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{notice.message}</p>
                  </div>
                </div>
                {notice.action || notice.href ? (
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                ) : null}
              </div>
            );

            if (notice.action === 'efees' && onOpenEfeesNotes) {
              return (
                <button
                  key={notice.id}
                  type="button"
                  onClick={onOpenEfeesNotes}
                  className={`w-full rounded-2xl border p-3 text-left shadow-xs transition ${meta.cardClass}`}
                >
                  {content}
                </button>
              );
            }

            if (notice.action === 'calendar') {
              return (
                <button
                  key={notice.id}
                  type="button"
                  onClick={() => onNavigate('calendar')}
                  className={`w-full rounded-2xl border p-3 text-left shadow-xs transition ${meta.cardClass}`}
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
                  className={`w-full rounded-2xl border p-3 text-left shadow-xs transition ${meta.cardClass}`}
                >
                  {content}
                </button>
              );
            }

            return (
              <div
                key={notice.id}
                className={`rounded-2xl border p-3 shadow-xs ${meta.cardClass}`}
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
        className="w-full rounded-2xl bg-white border border-slate-200 p-4 shadow-sm text-left hover:border-slate-300 hover:bg-slate-50/70 transition"
        aria-label="Open transport page"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
              <Bus className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                  Transport
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  {transportLoading ? 'Updating…' : 'Your routes'}
                </span>
              </div>
              <h3 className="mt-1 text-sm font-bold text-slate-900 leading-tight">
                Live ETA for selected routes
              </h3>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Configure routes in Settings · Home transport preferences
              </p>

              <div className="mt-2.5 space-y-1.5">
                {transportRows.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold text-slate-800">
                        {row.label}
                        <span className="ml-1 font-semibold text-slate-500">· {row.provider}</span>
                      </p>
                      <p className="truncate text-[10px] text-slate-500">
                        {row.note || row.stopHint}
                      </p>
                    </div>
                    <div className="inline-flex shrink-0 items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {row.minutes.length > 0 ? (
                        row.minutes.map((mins) => (
                          <span
                            key={`${row.id}-${mins}`}
                            className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-700"
                          >
                            {mins}m
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">—</span>
                      )}
                    </div>
                  </div>
                ))}
                {!transportLoading && transportRows.length === 0 && (
                  <p className="text-[11px] text-slate-500">No transport routes selected.</p>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
        </div>
      </button>

    </div>
  );
};
