export type HkPublicHoliday = {
  dateKey: string; // YYYY-MM-DD
  summary: string;
};

type RawHolidayEvent = {
  dtstart?: unknown;
  summary?: string;
};

const yyyymmddToDateKey = (raw: string): string | null => {
  if (!/^\d{8}$/.test(raw)) return null;
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
};

const extractDtStart = (dtstart: unknown): string | null => {
  if (typeof dtstart === 'string') return yyyymmddToDateKey(dtstart);
  if (Array.isArray(dtstart) && typeof dtstart[0] === 'string') {
    return yyyymmddToDateKey(dtstart[0]);
  }
  return null;
};

export const parseHkPublicHolidays = (payload: unknown): HkPublicHoliday[] => {
  const root = payload as {
    vcalendar?: Array<{ vevent?: RawHolidayEvent[] }>;
  };
  const events = root?.vcalendar?.[0]?.vevent ?? [];
  const holidays: HkPublicHoliday[] = [];

  for (const event of events) {
    const dateKey = extractDtStart(event.dtstart);
    const summary = String(event.summary ?? '').trim();
    if (!dateKey || !summary) continue;
    holidays.push({ dateKey, summary });
  }

  return holidays;
};

export const fetchHkPublicHolidays = async (): Promise<HkPublicHoliday[]> => {
  const res = await fetch('/api/1823/common/ical/en.json');
  if (!res.ok) {
    throw new Error(`Failed to load HK public holidays (${res.status})`);
  }
  const payload = await res.json();
  return parseHkPublicHolidays(payload);
};

export const holidayMapFromList = (
  holidays: HkPublicHoliday[],
): Map<string, string> => {
  const map = new Map<string, string>();
  for (const item of holidays) {
    map.set(item.dateKey, item.summary);
  }
  return map;
};
