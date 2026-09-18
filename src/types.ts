export interface StudentProfile {
  id: string;
  studentNumber: string;
  fullName: string;
  email: string;
  major: string;
  faculty: string;
  yearOfStudy: number;
  expectedGraduation: string;
  avatarUrl: string;
  hostel: string;
  hostelRoom: string;
  gpa: number;
  printQuotaPages: number;
  octopusCardLinked: string;
  octopusBalance: number;
}

export interface CourseSession {
  id: string;
  courseCode: string;
  courseName: string;
  section: string;
  instructor: string;
  venue: string;
  building: string;
  dayOfWeek: number; // 1 = Monday, 5 = Friday
  startTime: string; // "09:30"
  endTime: string;   // "11:00"
  color: string;
  attendanceRate: number;
  credits: number;
  assignmentsDue: number;
  checkedInToday?: boolean;
}

export interface ILPProgress {
  category: string;
  earnedUnits: number;
  requiredUnits: number;
  color: string;
  description: string;
}

export interface CampusFacility {
  id: string;
  name: string;
  category: 'library' | 'sports' | 'dining' | 'study' | 'transport';
  location: string;
  openHours: string;
  currentStatus: 'Open' | 'Crowded' | 'Moderate' | 'Available' | 'Closed';
  statusColor: string;
  imageUrl: string;
  availableSeats?: number;
  totalSeats?: number;
  nextBusMins?: number[];
}

export interface ImageHotlinkItem {
  id: string;
  title: string;
  category: 'official' | 'campus' | 'events' | 'student';
  url: string;
  altText: string;
  width?: number;
  height?: number;
  description?: string;
  tags: string[];
}

export interface ParsedImageHotlink {
  src: string;
  alt: string;
  tag: string;
  width?: string;
  height?: string;
  isValid?: boolean;
}
