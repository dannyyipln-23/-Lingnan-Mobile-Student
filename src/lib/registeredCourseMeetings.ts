import { formatDateKey, nowMinutes, parseTimeToMinutes, toAcademicDay } from './appDate';
import { fetchDataRecordXml } from './parseDataRecordXml';
import {
  fetchRegisteredCourses,
  RegisteredCourse,
  toCourseSession,
} from './registeredCourses';
import { CourseSession } from '../types';

const MEETINGS_URL = '/mock/academic/registered_courses_details.xml';

type MeetingRow = {
  SSRMEET_TERM_CODE: string;
  SSRMEET_CRN: string;
  SSRMEET_BEGIN_TIME: string;
  SSRMEET_END_TIME: string;
  SSRMEET_BLDG_CODE: string;
  SSRMEET_ROOM_CODE: string;
  SSRMEET_START_DATE: string;
  SSRMEET_END_DATE: string;
  SSRMEET_SUN_DAY: string;
  SSRMEET_MON_DAY: string;
  SSRMEET_TUE_DAY: string;
  SSRMEET_WED_DAY: string;
  SSRMEET_THU_DAY: string;
  SSRMEET_FRI_DAY: string;
  SSRMEET_SAT_DAY: string;
  SSRMEET_SURROGATE_ID: string;
};

const MEETING_FIELDS: Array<keyof MeetingRow> = [
  'SSRMEET_TERM_CODE',
  'SSRMEET_CRN',
  'SSRMEET_BEGIN_TIME',
  'SSRMEET_END_TIME',
  'SSRMEET_BLDG_CODE',
  'SSRMEET_ROOM_CODE',
  'SSRMEET_START_DATE',
  'SSRMEET_END_DATE',
  'SSRMEET_SUN_DAY',
  'SSRMEET_MON_DAY',
  'SSRMEET_TUE_DAY',
  'SSRMEET_WED_DAY',
  'SSRMEET_THU_DAY',
  'SSRMEET_FRI_DAY',
  'SSRMEET_SAT_DAY',
  'SSRMEET_SURROGATE_ID',
];

const DAY_FLAGS: Array<{ field: keyof MeetingRow; dayOfWeek: number }> = [
  { field: 'SSRMEET_MON_DAY', dayOfWeek: 1 },
  { field: 'SSRMEET_TUE_DAY', dayOfWeek: 2 },
  { field: 'SSRMEET_WED_DAY', dayOfWeek: 3 },
  { field: 'SSRMEET_THU_DAY', dayOfWeek: 4 },
  { field: 'SSRMEET_FRI_DAY', dayOfWeek: 5 },
  { field: 'SSRMEET_SAT_DAY', dayOfWeek: 6 },
  { field: 'SSRMEET_SUN_DAY', dayOfWeek: 7 },
];

/** Banner date: "2026/09/01 00:00:00" → "2026-09-01" */
const parseBannerDateKey = (value: string): string => {
  const match = value.trim().match(/^(\d{4})[/-](\d{2})[/-](\d{2})/);
  if (!match) return '';
  return `${match[1]}-${match[2]}-${match[3]}`;
};

/** Banner time: "1330" / "0930" → "13:30" / "09:30" */
const parseBannerClock = (value: string): string => {
  const digits = value.trim().replace(/\D/g, '');
  if (digits.length < 3) return '';
  const padded = digits.padStart(4, '0').slice(0, 4);
  return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
};

const courseKey = (termCode: string, crn: string): string => `${termCode}::${crn}`;

/**
 * Keep one row per registered CRN, overlay SSRMEET building/room (and time when present).
 * Used by My Class Schedule list/detail.
 */
export const fetchRegisteredCoursesWithMeetings = async (): Promise<RegisteredCourse[]> => {
  const [courses, meetings] = await Promise.all([
    fetchRegisteredCourses(),
    fetchDataRecordXml<MeetingRow>(MEETINGS_URL, MEETING_FIELDS),
  ]);

  const meetingsByKey = new Map<string, MeetingRow[]>();
  for (const meeting of meetings) {
    const key = courseKey(meeting.SSRMEET_TERM_CODE.trim(), meeting.SSRMEET_CRN.trim());
    const list = meetingsByKey.get(key) ?? [];
    list.push(meeting);
    meetingsByKey.set(key, list);
  }

  return courses.map((course) => {
    const rows = meetingsByKey.get(courseKey(course.termCode, course.crn)) ?? [];
    if (!rows.length) return course;

    const withVenue =
      rows.find(
        (row) => row.SSRMEET_BLDG_CODE.trim() || row.SSRMEET_ROOM_CODE.trim(),
      ) ?? rows[0];
    const building = withVenue.SSRMEET_BLDG_CODE.trim();
    const room = withVenue.SSRMEET_ROOM_CODE.trim();

    const withTime =
      rows.find((row) => {
        const begin = parseBannerClock(row.SSRMEET_BEGIN_TIME);
        const end = parseBannerClock(row.SSRMEET_END_TIME);
        const days = DAY_FLAGS.some((flag) => row[flag.field].trim());
        return Boolean(begin && end && days);
      }) ?? null;

    let dayOfWeek = course.dayOfWeek;
    let meetingDays = course.meetingDays;
    let startTime = course.startTime;
    let endTime = course.endTime;
    let classStartDate = course.classStartDate;
    let classEndDate = course.classEndDate;

    if (withTime) {
      const begin = parseBannerClock(withTime.SSRMEET_BEGIN_TIME);
      const end = parseBannerClock(withTime.SSRMEET_END_TIME);
      const days = DAY_FLAGS.filter((flag) => withTime[flag.field].trim()).map(
        (flag) => flag.dayOfWeek,
      );
      if (begin && end && days.length) {
        dayOfWeek = days[0];
        meetingDays = days;
        startTime = begin;
        endTime = end;
      }
      classStartDate = parseBannerDateKey(withTime.SSRMEET_START_DATE) || classStartDate;
      classEndDate = parseBannerDateKey(withTime.SSRMEET_END_DATE) || classEndDate;
    }

    return {
      ...course,
      location: building || course.location,
      room: room || course.room,
      dayOfWeek,
      meetingDays,
      startTime,
      endTime,
      classStartDate,
      classEndDate,
    };
  });
};

/**
 * Join registered_courses.xml with SSRMEET details and expand one row per meeting day.
 * Rows without weekday/time (TBA) are skipped for calendar / upcoming.
 */
export const fetchScheduledRegisteredCourses = async (): Promise<RegisteredCourse[]> => {
  const [courses, meetings] = await Promise.all([
    fetchRegisteredCourses(),
    fetchDataRecordXml<MeetingRow>(MEETINGS_URL, MEETING_FIELDS),
  ]);

  const courseByKey = new Map<string, RegisteredCourse>();
  for (const course of courses) {
    courseByKey.set(courseKey(course.termCode, course.crn), course);
  }

  const sessions: RegisteredCourse[] = [];

  for (const meeting of meetings) {
    const termCode = meeting.SSRMEET_TERM_CODE.trim();
    const crn = meeting.SSRMEET_CRN.trim();
    const course = courseByKey.get(courseKey(termCode, crn));
    if (!course) continue;

    const beginTime = parseBannerClock(meeting.SSRMEET_BEGIN_TIME);
    const endTime = parseBannerClock(meeting.SSRMEET_END_TIME);
    if (!beginTime || !endTime) continue;

    const startDate = parseBannerDateKey(meeting.SSRMEET_START_DATE) || course.classStartDate;
    const endDate = parseBannerDateKey(meeting.SSRMEET_END_DATE) || course.classEndDate;
    const building = meeting.SSRMEET_BLDG_CODE.trim();
    const room = meeting.SSRMEET_ROOM_CODE.trim();
    const venueLocation = building || course.location;
    const venueRoom = room || course.room;
    const meetId = meeting.SSRMEET_SURROGATE_ID.trim() || `${termCode}-${crn}-${beginTime}`;

    const days = DAY_FLAGS.filter((flag) => meeting[flag.field].trim()).map(
      (flag) => flag.dayOfWeek,
    );
    if (days.length === 0) continue;

    for (const dayOfWeek of days) {
      sessions.push({
        ...course,
        id: `${meetId}-${dayOfWeek}`,
        classStartDate: startDate,
        classEndDate: endDate,
        dayOfWeek,
        startTime: beginTime,
        endTime,
        location: venueLocation || course.location,
        room: venueRoom || '—',
      });
    }
  }

  return sessions;
};

export const isScheduledCourseActiveOnDate = (
  course: RegisteredCourse,
  dateKey: string,
): boolean => {
  if (!dateKey || !course.classStartDate || !course.classEndDate) return false;
  return dateKey >= course.classStartDate && dateKey <= course.classEndDate;
};

export const getScheduledCoursesForDate = (
  courses: RegisteredCourse[],
  date: Date,
): RegisteredCourse[] => {
  const dateKey = formatDateKey(date);
  const academicDay = toAcademicDay(date);
  return courses
    .filter(
      (course) =>
        course.dayOfWeek === academicDay && isScheduledCourseActiveOnDate(course, dateKey),
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
};

export const getUpcomingScheduledClassToday = (
  courses: RegisteredCourse[],
  now: Date = new Date(),
): RegisteredCourse | null => {
  const todayCourses = getScheduledCoursesForDate(courses, now);
  if (todayCourses.length === 0) return null;

  const current = nowMinutes(now);
  return (
    todayCourses.find((course) => {
      const end = parseTimeToMinutes(course.endTime);
      return end === null || end > current;
    }) ?? null
  );
};

export const toScheduledCourseSession = (course: RegisteredCourse): CourseSession =>
  toCourseSession(course);
