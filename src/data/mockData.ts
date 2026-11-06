import { StudentProfile, CourseSession, ILPProgress, CampusFacility } from '../types';

export const CURRENT_STUDENT: StudentProfile = {
  id: 'stu-2024-8902',
  studentNumber: '20241088',
  fullName: 'Yip Tak Hung Danny',
  email: 'dannyyip@ln.edu.hk',
  major: 'BBA (Hons) in Risk & Insurance Management',
  faculty: 'Faculty of Business',
  yearOfStudy: 3,
  expectedGraduation: 'July 2027',
  avatarUrl: '/student-avatar.jpg',
  hostel: 'Hall B (The Jockey Club Hall)',
  hostelRoom: 'Room B-618',
  gpa: 3.72,
};

export const COURSES: CourseSession[] = [
  {
    id: 'c1',
    courseCode: 'RIM2201',
    courseName: 'Principles of Risk Management',
    section: 'Section 1',
    instructor: 'Prof. Raymond Wong',
    venue: 'SEK101 (Simon & Eleanor Kwok Building)',
    building: 'SEK Building',
    dayOfWeek: 1, // Mon
    startTime: '09:30',
    endTime: '11:00',
    color: '#E11D48', // Vibrant Lighten Red
    attendanceRate: 95,
    credits: 3,
    assignmentsDue: 1,
    checkedInToday: true,
  },
  {
    id: 'c2',
    courseCode: 'CDS2001',
    courseName: 'Data Analytics with Python',
    section: 'Section 2',
    instructor: 'Dr. Amy Chan',
    venue: 'LBYG02 (B.Y. Lam Building)',
    building: 'B.Y. Lam Building',
    dayOfWeek: 1, // Mon
    startTime: '13:30',
    endTime: '15:00',
    color: '#2563EB', // Blue
    attendanceRate: 100,
    credits: 3,
    assignmentsDue: 0,
    checkedInToday: false,
  },
  {
    id: 'c3',
    courseCode: 'LCC1010',
    courseName: 'Practical Professional Communication',
    section: 'Section 4',
    instructor: 'Ms. Sophie Leung',
    venue: 'MBG06 (Main Building)',
    building: 'Main Building',
    dayOfWeek: 2, // Tue
    startTime: '10:30',
    endTime: '12:00',
    color: '#D97706', // Amber
    attendanceRate: 90,
    credits: 3,
    assignmentsDue: 1,
    checkedInToday: false,
  },
  {
    id: 'c4',
    courseCode: 'BUS2105',
    courseName: 'Microeconomics for Business',
    section: 'Section 1',
    instructor: 'Prof. David Lau',
    venue: 'WYL104 (Dorothy Y.L. Wong Building)',
    building: 'Dorothy Y.L. Wong Building',
    dayOfWeek: 3, // Wed
    startTime: '14:00',
    endTime: '16:00',
    color: '#059669', // Emerald
    attendanceRate: 92,
    credits: 3,
    assignmentsDue: 2,
    checkedInToday: false,
  },
  {
    id: 'c5',
    courseCode: 'CLA9001',
    courseName: 'Hong Kong Heritage & Global Culture',
    section: 'Section 3',
    instructor: 'Dr. Kevin Cheung',
    venue: 'LBY201 (B.Y. Lam Building)',
    building: 'B.Y. Lam Building',
    dayOfWeek: 4, // Thu
    startTime: '11:30',
    endTime: '13:00',
    color: '#7C3AED', // Purple
    attendanceRate: 100,
    credits: 3,
    assignmentsDue: 0,
    checkedInToday: false,
  },
];

export const ILP_DATA: ILPProgress[] = [
  {
    category: 'Civic Education',
    earnedUnits: 18,
    requiredUnits: 15,
    color: '#E11D48',
    description: 'Community outreach, campus governance, sustainability',
  },
  {
    category: 'Intellectual Development',
    earnedUnits: 26,
    requiredUnits: 24,
    color: '#3B82F6',
    description: 'Liberal arts symposia, research workshops, public lectures',
  },
  {
    category: 'Physical Education',
    earnedUnits: 14,
    requiredUnits: 12,
    color: '#10B981',
    description: 'Intramural sports, fitness certification, running club',
  },
  {
    category: 'Social & Emotional Development',
    earnedUnits: 16,
    requiredUnits: 12,
    color: '#F59E0B',
    description: 'Hostel hall activities, peer mentoring, mental wellness',
  },
  {
    category: 'Aesthetic Development',
    earnedUnits: 10,
    requiredUnits: 12,
    color: '#8B5CF6',
    description: 'Campus arts festival, musical performance, galleries',
  },
];

export const CAMPUS_FACILITIES: CampusFacility[] = [
  {
    id: 'fac-1',
    name: 'Fong Sum Wood Library',
    category: 'library',
    location: 'Central Campus Core',
    openHours: '08:30 - 22:30',
    currentStatus: 'Available',
    statusColor: 'emerald',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    availableSeats: 142,
    totalSeats: 350,
  },
  {
    id: 'fac-2',
    name: 'MTR Siu Hong Shuttle Bus',
    category: 'transport',
    location: 'Campus Bus Bay ↔ MTR Siu Hong Station (Exit F)',
    openHours: '07:30 - 23:15',
    currentStatus: 'Open',
    statusColor: 'emerald',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    nextBusMins: [4, 12, 20],
  },
  {
    id: 'fac-3',
    name: 'Skylight Pavilion Canteen',
    category: 'dining',
    location: 'Amenities Building, Ground Floor',
    openHours: '07:30 - 21:00',
    currentStatus: 'Moderate',
    statusColor: 'amber',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'fac-4',
    name: 'Jackie Chan Gymnasium & Sports Complex',
    category: 'sports',
    location: 'Indoor Sports Complex',
    openHours: '08:00 - 22:00',
    currentStatus: 'Open',
    statusColor: 'emerald',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    availableSeats: 38,
    totalSeats: 80,
  },
  {
    id: 'fac-5',
    name: 'SEK 24-Hour Study Commons',
    category: 'study',
    location: 'Simon & Eleanor Kwok Building 1/F',
    openHours: '24 Hours (e-Card Access)',
    currentStatus: 'Available',
    statusColor: 'emerald',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    availableSeats: 26,
    totalSeats: 60,
  },
];

/** Demo “today” used by Calendar + Home notices (aligned). */
export const CALENDAR_DEMO_TODAY = '2026-09-08';

export type StudyTaskSource = 'moodle' | 'personal';

export type StudyTaskItem = {
  id: string;
  text: string;
  reminderDateTime: string;
  done: boolean;
  dateKey: string;
  source: StudyTaskSource;
};

/** Shared Calendar Moodle / personal tasks — Home notices read from today’s items. */
export const STUDY_TASKS: StudyTaskItem[] = [
  {
    id: 't1',
    text: 'PMS4102 Data analytics case report draft',
    reminderDateTime: `${CALENDAR_DEMO_TODAY}T23:59`,
    done: false,
    dateKey: CALENDAR_DEMO_TODAY,
    source: 'moodle',
  },
  {
    id: 't2',
    text: 'PMS4001 Organizational Communication reading quiz',
    reminderDateTime: '2026-09-02T17:00',
    done: true,
    dateKey: '2026-09-02',
    source: 'moodle',
  },
  {
    id: 't3',
    text: 'Review lecture notes before tutorial',
    reminderDateTime: `${CALENDAR_DEMO_TODAY}T20:00`,
    done: false,
    dateKey: CALENDAR_DEMO_TODAY,
    source: 'personal',
  },
];

export const todaysMoodleTasks = (): StudyTaskItem[] =>
  STUDY_TASKS.filter((task) => task.source === 'moodle' && task.dateKey === CALENDAR_DEMO_TODAY);

export const todaysPersonalReminders = (): StudyTaskItem[] =>
  STUDY_TASKS.filter((task) => task.source === 'personal' && task.dateKey === CALENDAR_DEMO_TODAY);

export type HomeNoticeKind = 'efees' | 'moodle' | 'custom';

export type HomeImportantNotice = {
  id: string;
  kind: HomeNoticeKind;
  title: string;
  message: string;
  timeLabel: string;
  href?: string;
  /** In-app page action (takes priority over href when set). */
  action?: 'efees' | 'calendar';
};

const moodleCourseCode = (text: string): string => {
  const match = text.match(/^[A-Z]{2,4}\d{3,4}/);
  return match?.[0] ?? 'Moodle';
};

const formatTaskDueLabel = (reminderDateTime: string): string => {
  const time = reminderDateTime.split('T')[1] ?? '';
  return time ? `Due today ${time}` : 'Due today';
};

/** Home “Important Notices” strip under Upcoming Class. */
export const HOME_IMPORTANT_NOTICES: HomeImportantNotice[] = [
  {
    id: 'notice-efees-1',
    kind: 'efees',
    title: 'eFees Note',
    message: 'eTuition Fee Note TE3310717T202609R1 — Overdue. Please pay immediately.',
    timeLabel: 'Due 18 May 2026',
    action: 'efees',
  },
  ...todaysMoodleTasks().map((task) => ({
    id: `notice-moodle-${task.id}`,
    kind: 'moodle' as const,
    title: moodleCourseCode(task.text),
    message: task.text,
    timeLabel: formatTaskDueLabel(task.reminderDateTime),
    href: 'https://lms.ln.edu.hk/',
  })),
  ...todaysPersonalReminders().map((task) => ({
    id: `notice-personal-${task.id}`,
    kind: 'custom' as const,
    title: 'Reminder',
    message: task.text,
    timeLabel: formatTaskDueLabel(task.reminderDateTime),
    action: 'calendar' as const,
  })),
];
