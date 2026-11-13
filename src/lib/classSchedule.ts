import { CourseSession } from '../types';
import {
  formatDateKey,
  formatMinutesAsTime,
  nowMinutes,
  parseTimeToMinutes,
  toAcademicDay,
} from './appDate';

const CLASS_SCHEDULE_URL = '/mock/academic/my-class-schedule.json';

const COURSE_COLORS = ['#E11D48', '#2563EB', '#D97706', '#059669', '#7C3AED', '#0891B2', '#DB2777'];

type ScheduleDetail = {
  crn: string;
  subjectCode: string;
  courseNumber: string;
  courseTitle: string;
  credits: string;
  scheduleType: string;
  registrationStatusCode: string;
  faculty?: string;
  days?: string;
  daysDisplay?: string;
  startTime?: string;
  endTime?: string;
  building?: string;
  room?: string;
  classStartDate?: string;
  classEndDate?: string;
  termCode?: string;
};

type SchedulePayload = {
  terms: Array<{ code: string; description: string; isDefault?: boolean }>;
  detailsById: Record<string, ScheduleDetail>;
};

export type ClassSession = CourseSession & {
  classStartDate: string;
  classEndDate: string;
  termCode: string;
  scheduleType: string;
  endMinutes: number;
  startMinutes: number;
};

const DAY_TOKEN_MAP: Record<string, number> = {
  m: 1,
  mon: 1,
  monday: 1,
  t: 2,
  tue: 2,
  tues: 2,
  tuesday: 2,
  w: 3,
  wed: 3,
  wednesday: 3,
  r: 4,
  th: 4,
  thu: 4,
  thur: 4,
  thursday: 4,
  f: 5,
  fri: 5,
  friday: 5,
  s: 6,
  sat: 6,
  saturday: 6,
  u: 7,
  su: 7,
  sun: 7,
  sunday: 7,
};

const parseMeetingDays = (detail: ScheduleDetail): number[] => {
  const fromDisplay = (detail.daysDisplay || '').trim();
  if (fromDisplay) {
    // Banner-style compact codes: MW, TR, MWF, etc.
    const days: number[] = [];
    const upper = fromDisplay.toUpperCase();
    for (let i = 0; i < upper.length; i += 1) {
      const two = upper.slice(i, i + 2);
      if (two === 'TH' || two === 'TU') {
        const mapped = DAY_TOKEN_MAP[two.toLowerCase()];
        if (mapped && !days.includes(mapped)) days.push(mapped);
        i += 1;
        continue;
      }
      const mapped = DAY_TOKEN_MAP[upper[i].toLowerCase()];
      if (mapped && !days.includes(mapped)) days.push(mapped);
    }
    if (days.length > 0) return days;
  }

  const fromDays = (detail.days || '')
    .split(/[/,&]+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .map((part) => DAY_TOKEN_MAP[part])
    .filter((day): day is number => Boolean(day));

  return Array.from(new Set(fromDays));
};

const normalizeClock = (value: string | undefined): string => {
  if (!value) return '—';
  const minutes = parseTimeToMinutes(value);
  return minutes === null ? value.trim() : formatMinutesAsTime(minutes);
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const expandDetail = (id: string, detail: ScheduleDetail): ClassSession[] => {
  const days = parseMeetingDays(detail);
  const startTime = normalizeClock(detail.startTime);
  const endTime = normalizeClock(detail.endTime);
  const startMinutes = parseTimeToMinutes(detail.startTime || '') ?? 0;
  const endMinutes = parseTimeToMinutes(detail.endTime || '') ?? startMinutes + 90;
  const color = COURSE_COLORS[hashString(detail.crn || id) % COURSE_COLORS.length];
  const venueParts = [detail.room, detail.building].filter(Boolean);
  const venue = venueParts.length > 0 ? venueParts.join(' · ') : 'TBA';

  return days.map((dayOfWeek) => ({
    id: `${id}-${dayOfWeek}`,
    courseCode: `${detail.subjectCode}${detail.courseNumber}`,
    courseName: detail.courseTitle,
    section: detail.scheduleType || 'Section',
    instructor: detail.faculty || '—',
    venue,
    building: detail.building || '—',
    dayOfWeek,
    startTime,
    endTime,
    color,
    attendanceRate: 0,
    credits: Number(detail.credits) || 0,
    assignmentsDue: 0,
    classStartDate: detail.classStartDate || '',
    classEndDate: detail.classEndDate || '',
    termCode: detail.termCode || '',
    scheduleType: detail.scheduleType || '—',
    startMinutes,
    endMinutes,
  }));
};

export const fetchClassSessions = async (): Promise<ClassSession[]> => {
  const res = await fetch(CLASS_SCHEDULE_URL);
  if (!res.ok) {
    throw new Error(`Failed to load class schedule (${res.status})`);
  }
  const payload = (await res.json()) as SchedulePayload;
  return Object.entries(payload.detailsById).flatMap(([id, detail]) => expandDetail(id, detail));
};

export const isSessionActiveOnDate = (session: ClassSession, dateKey: string): boolean => {
  if (!dateKey) return false;
  if (session.classStartDate && dateKey < session.classStartDate) return false;
  if (session.classEndDate && dateKey > session.classEndDate) return false;
  return true;
};

export const getSessionsForDate = (
  sessions: ClassSession[],
  date: Date,
): ClassSession[] => {
  const dateKey = formatDateKey(date);
  const academicDay = toAcademicDay(date);
  return sessions
    .filter(
      (session) =>
        session.dayOfWeek === academicDay && isSessionActiveOnDate(session, dateKey),
    )
    .sort((a, b) => a.startMinutes - b.startMinutes);
};

/** Next class still to start/finish today; otherwise null. */
export const getUpcomingClassToday = (
  sessions: ClassSession[],
  now: Date = new Date(),
): ClassSession | null => {
  const todaySessions = getSessionsForDate(sessions, now);
  if (todaySessions.length === 0) return null;

  const current = nowMinutes(now);
  const upcoming = todaySessions.find((session) => session.endMinutes > current);
  return upcoming ?? null;
};
