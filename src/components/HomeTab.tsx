import React, { useEffect, useMemo, useState } from 'react';
import { 
  BookOpen, 
  Compass,
  CloudLightning,
  FileText,
  Flame,
  GraduationCap,
  LayoutGrid,
  MapPin, 
  Route,
  Snowflake,
  Clock, 
  CheckCircle2, 
  Calendar,
  SunMedium, 
  Check,
  Umbrella,
  Wind,
  AlertTriangle
} from 'lucide-react';
import { COURSES } from '../data/mockData';
import { TabType } from './NavigationBottomBar';
import {
  HOME_SHORTCUT_OPTIONS,
  HomeShortcutId,
  useAppPreferences,
} from '../context/AppPreferencesContext';
import emsBg from '../assets/images/ems-bg-1-768x360.jpg';

interface HomeTabProps {
  onNavigate: (tab: TabType) => void;
  onOpenLibraryModal: () => void;
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

export const HomeTab: React.FC<HomeTabProps> = ({ onNavigate, onOpenLibraryModal }) => {
  const { homeShortcuts, openInAppBrowser } = useAppPreferences();
  const [checkedInCourses, setCheckedInCourses] = useState<Record<string, boolean>>({
    c1: true,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTipExpanded, setIsTipExpanded] = useState<boolean>(false);
  const [weather, setWeather] = useState<HomeWeatherState>({
    temperatureC: null,
    humidityPct: null,
    rainfallMm: null,
    warningItems: [],
    specialTip: '',
    lastUpdated: '--:--',
    isLoading: true,
  });

  const shortcutConfig = useMemo<Record<HomeShortcutId, {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    action: () => void;
  }>>(
    () => ({
      calendar: {
        label: 'Calendar',
        icon: Calendar,
        colorClass: 'bg-red-50 text-red-600 border-red-100',
        action: () => onNavigate('calendar'),
      },
      'book-seat': {
        label: 'Book Seat',
        icon: BookOpen,
        colorClass: 'bg-blue-50 text-blue-600 border-blue-100',
        action: onOpenLibraryModal,
      },
      'campus-apps': {
        label: 'Campus Apps',
        icon: LayoutGrid,
        colorClass: 'bg-amber-50 text-amber-600 border-amber-100',
        action: () => onNavigate('campus'),
      },
      wayfinding: {
        label: 'Wayfinding',
        icon: Route,
        colorClass: 'bg-sky-50 text-sky-600 border-sky-100',
        action: () => openInAppBrowser('https://map.ln.edu.hk/', 'Wayfinding'),
      },
      'moodle-assignments': {
        label: 'Moodle Tasks',
        icon: FileText,
        colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        action: () => openInAppBrowser('https://lms.ln.edu.hk', 'Moodle Assignments'),
      },
      'exam-timetable': {
        label: 'Exam Items',
        icon: Compass,
        colorClass: 'bg-purple-50 text-purple-600 border-purple-100',
        action: () => onNavigate('campus'),
      },
      'graduation-progress': {
        label: 'Grad Progress',
        icon: GraduationCap,
        colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        action: () => onNavigate('campus'),
      },
    }),
    [onNavigate, onOpenLibraryModal, openInAppBrowser],
  );

  const selectedShortcutItems = useMemo(() => {
    const validIds = homeShortcuts.length > 0
      ? homeShortcuts
      : HOME_SHORTCUT_OPTIONS.slice(0, 3).map((item) => item.id);
    return validIds.slice(0, 6).map((id) => ({ id, ...shortcutConfig[id] }));
  }, [homeShortcuts, shortcutConfig]);

  const handleCheckIn = (courseId: string, courseCode: string) => {
    setCheckedInCourses((prev) => ({ ...prev, [courseId]: true }));
    setToastMessage(`Checked in successfully: ${courseCode} (Attendance recorded)`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const nextClass = COURSES[1]; // CDS2001 at 13:30

  useEffect(() => {
    let isMounted = true;

    const loadWeather = async () => {
      const requests = await Promise.allSettled([
        fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en'),
        fetch('https://data.weather.gov.hk/weatherAPI/opendata/hourlyRainfall.php?lang=en'),
        fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en'),
        fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warningInfo&lang=en'),
        fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=swt&lang=en'),
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => onNavigate('events')}
        className="relative w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm min-h-[8.5rem] text-left"
        style={{
          backgroundImage: `linear-gradient(105deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.45) 45%, rgba(15, 23, 42, 0.2) 100%), url(${emsBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-label="Open EMS page"
      >
        <div className="p-4 text-white space-y-1.5">
          <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 uppercase tracking-wide">
            Events
          </span>
          <h3 className="text-base font-bold leading-tight max-w-[14rem]">
            Event Management System Highlights
          </h3>
          <p className="text-[11px] text-slate-100/90 max-w-[15rem] leading-relaxed">
            Explore upcoming university events, registration notices, and student activities.
          </p>
        </div>
      </button>

{/*       <div className="rounded-2xl bg-gradient-to-r from-red-50/90 via-white to-slate-50 border border-red-200 p-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-200 shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase tracking-wide">
                  Campus Hub
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Applications and student services
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Open categorized applications and campus tools
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('campus')}
            className="text-red-600 font-bold text-xs inline-flex items-center"
          >
            Open
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div> */}

      {/* Next Upcoming Lecture Card */}
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
            <span>{nextClass.startTime} - {nextClass.endTime}</span>
          </span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">
                {nextClass.courseCode}
              </span>
              <span className="text-xs text-slate-700 font-semibold">
                {nextClass.courseName}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-2">
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="text-slate-800 font-medium">{nextClass.venue}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 pl-5">
              {nextClass.instructor}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end space-y-1">
            {checkedInCourses[nextClass.id] ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Checked In</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleCheckIn(nextClass.id, nextClass.courseCode)}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-200 transition transform active:scale-95"
              >
                Check In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Icons Bar */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
          Student Shortcuts
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {selectedShortcutItems.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <button
                key={shortcut.id}
                type="button"
                onClick={shortcut.action}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition group shadow-xs"
              >
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform ${shortcut.colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
                  {shortcut.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Graduation ILP Progress Indicator */}
{/*       <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-md bg-red-50 text-red-600">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              ILP Graduation Requirement
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            84 / 75 Units (112%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: '100%' }}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
          <span>Graduation criterion successfully fulfilled</span>
          <button 
            type="button"
            onClick={() => onNavigate('campus')}
            className="text-red-600 font-bold hover:underline"
          >
            Details →
          </button>
        </p>
      </div> */}

      {/* Campus Live Alerts & Weather */}
      <div className="rounded-xl bg-white border border-slate-200 p-3 text-xs shadow-xs space-y-1.5">
        <div className="flex items-center space-x-2 text-slate-700">
          <SunMedium className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Tuen Mun: {weather.temperatureC ?? '--'}°C • RH {weather.humidityPct ?? '--'}% • Rain {weather.rainfallMm ?? '--'}mm
          </span>
        </div>
        {weather.warningItems.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {weather.warningItems.map((item) => {
              const WarningIcon = getWarningIcon(item.code);
              return (
                <span
                  key={item.code}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                >
                  <WarningIcon className="h-3 w-3" />
                  <span>{item.label}</span>
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-slate-600 leading-relaxed">
            No active weather warning
          </p>
        )}
        {weather.specialTip ? (
          <button
            type="button"
            onClick={() => setIsTipExpanded((prev) => !prev)}
            className="w-full text-left"
            aria-expanded={isTipExpanded}
            aria-label="Toggle full weather tip"
          >
            <p className={`text-[11px] text-slate-500 leading-relaxed ${isTipExpanded ? '' : 'line-clamp-2'}`}>
              Tip: {weather.specialTip}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              {isTipExpanded ? 'Tap to collapse' : 'Tap to view full message'}
            </p>
          </button>
        ) : null}
        <p className="text-[10px] text-slate-400">
          Updated {weather.lastUpdated}{weather.isLoading ? ' • Loading...' : ''}
        </p>
      </div>
    </div>
  );
};
