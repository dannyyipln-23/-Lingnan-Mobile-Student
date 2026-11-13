import { CourseSession } from '../types';
import { formatDateKey, nowMinutes, parseTimeToMinutes, toAcademicDay } from './appDate';
import { decodeXmlText, fetchDataRecordXml } from './parseDataRecordXml';

export { decodeXmlText };

export type RegisteredCourseRow = {
  STUDENTID: string;
  TERMCODE: string;
  COURSENUMBER: string;
  COURSETITLE: string;
  SUBJECT: string;
  CREDITS: string;
  LECTUREHOURS: string;
  SCHEDULETYPE: string;
  DEPARTMENT: string;
  COURSELOCATION: string;
  COURSEREGISTRATIONNUMBER: string;
  FACULTYNAME: string;
  TERMDESCRIPTION: string;
  STATUSMESSAGE: string;
  REGISTRATIONSTATUSCODE: string;
  FACULTYEMAIL: string;
  SECTIONNO: string;
  ROOMNUMBER: string;
  CLASSSTARTDATE: string;
  CLASSENDDATE: string;
};

export type RegisteredCourse = {
  id: string;
  termCode: string;
  termDescription: string;
  crn: string;
  subjectCode: string;
  courseNumber: string;
  courseTitle: string;
  credits: string;
  scheduleType: string;
  registrationStatusCode: string;
  statusMessage: string;
  faculty: string;
  facultyEmail: string;
  department: string;
  location: string;
  room: string;
  section: string;
  lectureHours: string;
  classStartDate: string;
  classEndDate: string;
  dayOfWeek: number;
  /** All meeting weekdays from SSRMEET when available; UI prefers this over dayOfWeek. */
  meetingDays?: number[];
  startTime: string;
  endTime: string;
  color: string;
};

const REGISTERED_COURSES_URL = '/mock/academic/registered_courses.xml';

const COURSE_COLORS = ['#E11D48', '#2563EB', '#D97706', '#059669', '#7C3AED', '#0891B2', '#DB2777'];

const START_SLOTS = [9 * 60 + 30, 10 * 60 + 30, 11 * 60 + 30, 13 * 60 + 30, 14 * 60 + 30, 16 * 60];

const REGISTERED_COURSE_FIELDS: Array<keyof RegisteredCourseRow> = [
  'STUDENTID',
  'TERMCODE',
  'COURSENUMBER',
  'COURSETITLE',
  'SUBJECT',
  'CREDITS',
  'LECTUREHOURS',
  'SCHEDULETYPE',
  'DEPARTMENT',
  'COURSELOCATION',
  'COURSEREGISTRATIONNUMBER',
  'FACULTYNAME',
  'TERMDESCRIPTION',
  'STATUSMESSAGE',
  'REGISTRATIONSTATUSCODE',
  'FACULTYEMAIL',
  'SECTIONNO',
  'ROOMNUMBER',
  'CLASSSTARTDATE',
  'CLASSENDDATE',
];

const cleanCourseTitle = (title: string): string =>
  decodeXmlText(title).replace(/\s*\(CRN:\s*\d+\)\s*$/i, '').trim();

export const toDateKey = (value: string): string => {
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? '';
};

const formatDateLabel = (dateKey: string): string => {
  if (!dateKey) return '—';
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return dateKey;
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(year, month - 1, day));
};

const pad2 = (n: number): string => String(n).padStart(2, '0');

const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad2(hours)}:${pad2(minutes)}`;
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

/** XML has no meeting pattern — derive a stable weekday/time from CRN for calendar display. */
const deriveMeeting = (crn: string, lectureHours: string) => {
  const hash = hashString(crn || '0');
  const dayOfWeek = (hash % 5) + 1;
  const startMinutes = START_SLOTS[hash % START_SLOTS.length];
  const durationHours = Number(lectureHours);
  const durationMinutes = Number.isFinite(durationHours) && durationHours > 0
    ? Math.round(durationHours * 60)
    : 90;
  return {
    dayOfWeek,
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(startMinutes + durationMinutes),
  };
};

const mapRow = (row: RegisteredCourseRow): RegisteredCourse => {
  const crn = row.COURSEREGISTRATIONNUMBER.trim();
  const meeting = deriveMeeting(crn, row.LECTUREHOURS);
  const color = COURSE_COLORS[hashString(crn) % COURSE_COLORS.length];

  return {
    id: crn || `${row.TERMCODE}-${row.SUBJECT}-${row.COURSENUMBER}-${row.SECTIONNO}`,
    termCode: row.TERMCODE.trim(),
    termDescription: decodeXmlText(row.TERMDESCRIPTION),
    crn: crn || '—',
    subjectCode: row.SUBJECT.trim(),
    courseNumber: row.COURSENUMBER.trim(),
    courseTitle: cleanCourseTitle(row.COURSETITLE),
    credits: row.CREDITS.trim() || '0',
    scheduleType: row.SCHEDULETYPE.trim() || '—',
    registrationStatusCode: row.REGISTRATIONSTATUSCODE.trim() || '—',
    statusMessage: row.STATUSMESSAGE.trim() || '—',
    faculty: decodeXmlText(row.FACULTYNAME) || '—',
    facultyEmail: decodeXmlText(row.FACULTYEMAIL) || '—',
    department: decodeXmlText(row.DEPARTMENT) || '—',
    location: decodeXmlText(row.COURSELOCATION) || '—',
    room: row.ROOMNUMBER.trim() || '—',
    section: row.SECTIONNO.trim() || '—',
    lectureHours: row.LECTUREHOURS.trim() || '—',
    classStartDate: toDateKey(row.CLASSSTARTDATE),
    classEndDate: toDateKey(row.CLASSENDDATE),
    dayOfWeek: meeting.dayOfWeek,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    color,
  };
};

export const fetchRegisteredCourses = async (): Promise<RegisteredCourse[]> => {
  const rows = await fetchDataRecordXml<RegisteredCourseRow>(
    REGISTERED_COURSES_URL,
    REGISTERED_COURSE_FIELDS,
  );
  return rows.map(mapRow);
};

export const extractTerms = (
  courses: RegisteredCourse[],
): Array<{ code: string; description: string; isDefault?: boolean }> => {
  const byCode = new Map<string, string>();
  for (const course of courses) {
    if (!byCode.has(course.termCode)) {
      byCode.set(course.termCode, course.termDescription);
    }
  }

  const terms = Array.from(byCode.entries())
    .map(([code, description]) => ({ code, description }))
    .sort((a, b) => b.code.localeCompare(a.code));

  if (terms[0]) {
    terms[0] = { ...terms[0], isDefault: true };
  }
  return terms;
};

export const isCourseActiveOnDate = (course: RegisteredCourse, dateKey: string): boolean => {
  if (!dateKey || !course.classStartDate || !course.classEndDate) return false;
  return dateKey >= course.classStartDate && dateKey <= course.classEndDate;
};

export const getCoursesForDate = (
  courses: RegisteredCourse[],
  date: Date,
): RegisteredCourse[] => {
  const dateKey = formatDateKey(date);
  const academicDay = toAcademicDay(date);
  return courses
    .filter(
      (course) =>
        course.dayOfWeek === academicDay && isCourseActiveOnDate(course, dateKey),
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
};

/** Next registered class still running/upcoming today. */
export const getUpcomingRegisteredClassToday = (
  courses: RegisteredCourse[],
  now: Date = new Date(),
): RegisteredCourse | null => {
  const todayCourses = getCoursesForDate(courses, now);
  if (todayCourses.length === 0) return null;

  const current = nowMinutes(now);
  const upcoming = todayCourses.find((course) => {
    const end = parseTimeToMinutes(course.endTime);
    return end === null || end > current;
  });
  return upcoming ?? null;
};

export const formatClassDateRange = (course: RegisteredCourse): string => {
  if (!course.classStartDate && !course.classEndDate) return '—';
  return `${formatDateLabel(course.classStartDate)} → ${formatDateLabel(course.classEndDate)}`;
};

const DAY_LABELS: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
};

export const formatMeetingDays = (dayOfWeek: number | number[]): string => {
  const days = (Array.isArray(dayOfWeek) ? dayOfWeek : [dayOfWeek])
    .filter((day) => DAY_LABELS[day])
    .sort((a, b) => a - b);
  if (!days.length) return '—';
  return [...new Set(days)].map((day) => DAY_LABELS[day]).join(', ');
};

export const formatVenue = (course: Pick<RegisteredCourse, 'location' | 'room'>): string => {
  if (course.room !== '—' && course.location !== '—') {
    return `${course.room} (${course.location})`;
  }
  if (course.room !== '—') return course.room;
  if (course.location !== '—') return course.location;
  return 'TBA';
};

export const toCourseSession = (course: RegisteredCourse): CourseSession => {
  const venue =
    course.room !== '—'
      ? `${course.room} (${course.location})`
      : course.location !== '—'
        ? course.location
        : 'TBA';

  return {
    id: course.id,
    courseCode: `${course.subjectCode}${course.courseNumber}`,
    courseName: course.courseTitle,
    section: `Section ${course.section}${course.scheduleType !== '—' ? ` · ${course.scheduleType}` : ''}`,
    instructor: course.faculty,
    venue,
    building: course.location,
    dayOfWeek: course.dayOfWeek,
    startTime: course.startTime,
    endTime: course.endTime,
    color: course.color,
    attendanceRate: 0,
    credits: Number(course.credits) || 0,
    assignmentsDue: 0,
  };
};
