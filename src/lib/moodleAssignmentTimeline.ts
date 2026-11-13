import { StudyTaskItem } from '../data/mockData';
import { formatDateKey, pad2 } from './appDate';
import { decodeXmlText } from './parseDataRecordXml';
import { RegisteredCourse } from './registeredCourses';

const ASSIGNMENT_TIMELINE_URL = '/mock/academic/testing-assignment-timeline.json';

type MoodleAssignmentCourse = {
  idnumber?: string;
  fullname?: string;
  shortname?: string;
  fullnamedisplay?: string;
  coursecategory?: string;
  term?: string;
};

type MoodleAssignmentEvent = {
  id?: number | string;
  name?: string;
  activityname?: string;
  activitystr?: string;
  modulename?: string;
  component?: string;
  eventtype?: string;
  timestart?: number;
  overdue?: boolean;
  url?: string;
  course?: MoodleAssignmentCourse;
};

type MoodleAssignmentPayload = {
  error?: boolean;
  data?: {
    events?: MoodleAssignmentEvent[];
  };
};

export type MoodleAssignmentTask = StudyTaskItem & {
  crn: string;
  title: string;
  courseCode: string;
  courseName: string;
  courseShortname: string;
  moduleName: string;
  activityLabel: string;
  termLabel: string;
  overdue: boolean;
  url?: string;
};

const moduleLabel = (modulename?: string, component?: string): string => {
  const raw = (modulename || component || '').replace(/^mod_/, '').trim().toLowerCase();
  if (!raw) return 'Moodle activity';
  if (raw.includes('turnitin')) return 'Turnitin assignment';
  if (raw === 'assign') return 'Assignment';
  if (raw === 'quiz') return 'Quiz';
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

/** `5780.202609` → `5780` (CRN). Term suffix ignored — same term is assumed. */
export const crnFromIdNumber = (idnumber?: string): string => {
  const raw = (idnumber ?? '').trim();
  if (!raw) return '';
  const [crn] = raw.split('.');
  return (crn ?? '').trim();
};

const formatLocalDateTime = (unixSeconds: number): { dateKey: string; reminderDateTime: string } => {
  const date = new Date(unixSeconds * 1000);
  const dateKey = formatDateKey(date);
  const reminderDateTime = `${dateKey}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  return { dateKey, reminderDateTime };
};

const courseLabelForCrn = (
  crn: string,
  courseByCrn: Map<string, RegisteredCourse>,
  moodleCourse?: MoodleAssignmentCourse,
): string => {
  const registered = courseByCrn.get(crn);
  if (registered) {
    return `${registered.subjectCode}${registered.courseNumber}`;
  }

  const shortname = decodeXmlText(moodleCourse?.shortname ?? '');
  const match = shortname.match(/^([A-Z]+-?\d+)/i);
  if (match?.[1]) return match[1].replace('-', '');

  return decodeXmlText(moodleCourse?.fullnamedisplay || moodleCourse?.fullname || '') || crn;
};

const extractEvents = (payload: MoodleAssignmentPayload[] | MoodleAssignmentPayload): MoodleAssignmentEvent[] => {
  const blocks = Array.isArray(payload) ? payload : [payload];
  return blocks.flatMap((block) => block?.data?.events ?? []);
};

export const fetchMoodleAssignmentEvents = async (): Promise<MoodleAssignmentEvent[]> => {
  const res = await fetch(ASSIGNMENT_TIMELINE_URL);
  if (!res.ok) {
    throw new Error(`Failed to load Moodle assignments (${res.status})`);
  }
  const payload = (await res.json()) as MoodleAssignmentPayload[] | MoodleAssignmentPayload;
  return extractEvents(payload);
};

/**
 * Map Moodle calendar due events onto registered courses by CRN
 * (`course.idnumber` = `{crn}.{termCode}`).
 */
export const mapMoodleAssignmentsToTasks = (
  events: MoodleAssignmentEvent[],
  registeredCourses: RegisteredCourse[],
): MoodleAssignmentTask[] => {
  const courseByCrn = new Map<string, RegisteredCourse>();
  for (const course of registeredCourses) {
    if (course.crn && course.crn !== '—') {
      courseByCrn.set(course.crn, course);
    }
  }

  const tasks: MoodleAssignmentTask[] = [];

  for (const event of events) {
    if (event.eventtype && event.eventtype !== 'due') continue;

    const crn = crnFromIdNumber(event.course?.idnumber);
    if (!crn || !courseByCrn.has(crn)) continue;

    const timestart = Number(event.timestart);
    if (!Number.isFinite(timestart) || timestart <= 0) continue;

    const { dateKey, reminderDateTime } = formatLocalDateTime(timestart);
    const title = decodeXmlText(event.activityname || event.name || 'Moodle assignment');
    const courseCode = courseLabelForCrn(crn, courseByCrn, event.course);
    const registered = courseByCrn.get(crn);
    const courseName =
      registered?.courseTitle ||
      decodeXmlText(event.course?.fullnamedisplay || event.course?.fullname || '') ||
      courseCode;
    const courseShortname = decodeXmlText(event.course?.shortname ?? '');
    const termLabel =
      decodeXmlText(event.course?.term || event.course?.coursecategory || '') ||
      registered?.termDescription ||
      '—';

    tasks.push({
      id: `moodle-${event.id ?? `${crn}-${timestart}`}`,
      text: `${courseCode}: ${title}`,
      reminderDateTime,
      done: false,
      dateKey,
      source: 'moodle',
      crn,
      title,
      courseCode,
      courseName,
      courseShortname,
      moduleName: moduleLabel(event.modulename, event.component),
      activityLabel: decodeXmlText(event.activitystr || '') || 'Due',
      termLabel,
      overdue: Boolean(event.overdue),
      url: event.url,
    });
  }

  return tasks.sort((a, b) => a.reminderDateTime.localeCompare(b.reminderDateTime));
};

export const fetchMoodleAssignmentTasks = async (
  registeredCourses: RegisteredCourse[],
): Promise<MoodleAssignmentTask[]> => {
  const events = await fetchMoodleAssignmentEvents();
  return mapMoodleAssignmentsToTasks(events, registeredCourses);
};
