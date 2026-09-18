import { StudentProfile, CourseSession, ILPProgress, CampusFacility, ImageHotlinkItem } from '../types';

export const CURRENT_STUDENT: StudentProfile = {
  id: 'stu-2024-8902',
  studentNumber: '20241088',
  fullName: 'Danny Ka-Long Yip',
  email: 'dannyyipln@gmail.com',
  major: 'BBA (Hons) in Risk & Insurance Management',
  faculty: 'Faculty of Business',
  yearOfStudy: 3,
  expectedGraduation: 'July 2027',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  hostel: 'Hall B (The Jockey Club Hall)',
  hostelRoom: 'Room B-618',
  gpa: 3.72,
  printQuotaPages: 240,
  octopusCardLinked: '9283-XXXX-1',
  octopusBalance: 88.50,
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

export const CURATED_HOTLINKS: ImageHotlinkItem[] = [
  {
    id: 'img-1',
    title: 'Official Lingnan University Emblem (Vector)',
    category: 'official',
    url: 'https://upload.wikimedia.org/wikipedia/en/a/a9/LingnanUniversity_logo.svg',
    altText: 'Lingnan University Official Red & Grey Emblem',
    width: 320,
    height: 320,
    description: 'Depicts White Cloud Mountain, Pearl River, Lychee branches, and path of diligence in classic Red & Grey.',
    tags: ['Logo', 'Emblem', 'Official', 'SVG', 'Red & Grey'],
  },
  {
    id: 'img-2',
    title: 'Local Hosted University Emblem',
    category: 'official',
    url: '/lingnan-logo.svg',
    altText: 'Lingnan University Official Emblem Local SVG',
    width: 256,
    height: 256,
    description: 'Static vector asset served with zero latency directly from the applet root.',
    tags: ['Local', 'Static', 'Fast', 'Hotlink'],
  },
  {
    id: 'img-3',
    title: 'Lingnan Campus Scenic Bridge & Skylight',
    category: 'campus',
    url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
    altText: 'Lingnan Campus Architecture and Historic Archway',
    width: 800,
    height: 533,
    description: 'Liberal arts university courtyard and historic covered canopy walkway.',
    tags: ['Campus', 'Architecture', 'Scenic', 'Banner'],
  },
  {
    id: 'img-4',
    title: 'Fong Sum Wood Library Main Study Hall',
    category: 'campus',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    altText: 'Lingnan Fong Sum Wood Library Study Spaces',
    width: 800,
    height: 533,
    description: 'Quiet study tables, book collections, and natural atrium light.',
    tags: ['Library', 'Study', 'Books'],
  },
  {
    id: 'img-5',
    title: 'Lingnan Arts & Culture Festival Banner',
    category: 'events',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    altText: 'Lingnan Arts Festival and Performance Concert',
    width: 800,
    height: 500,
    description: 'ILP accredited music concert, drama exhibition, and campus art workshops.',
    tags: ['ILP', 'Arts', 'Poster', 'Concert'],
  },
  {
    id: 'img-6',
    title: 'University Career & Internship Expo Banner',
    category: 'events',
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
    altText: 'Lingnan Career Fair & Employer Networking',
    width: 800,
    height: 450,
    description: 'Leading employers recruiting Lingnan graduates in banking, tech, and risk management.',
    tags: ['Career', 'Internship', 'Business', 'Poster'],
  },
];

export const SAMPLE_HTML_TEMPLATES = [
  {
    name: 'Club Event Notice HTML',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lingnan University Finance Society Workshop</title>
</head>
<body>
  <header>
    <!-- University Emblem Hotlink -->
    <img src="https://upload.wikimedia.org/wikipedia/en/a/a9/LingnanUniversity_logo.svg" 
         alt="Lingnan University Emblem" 
         width="110" 
         height="110" />
    <h1>Lingnan University Finance Society - Practical Investment Workshop</h1>
  </header>
  <main>
    <p>Welcome all students to register for our annual case study competition hosted by business alumni.</p>
    <!-- Event Banner Hotlink -->
    <img src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80" 
         alt="Workshop Event Poster" 
         loading="lazy" />
    <p>Date: October 18, 2025 | Venue: SEK101 Lecture Theatre</p>
  </main>
</body>
</html>`,
  },
  {
    name: 'Campus Newsletter HTML',
    html: `<div class="lu-newsletter">
  <img src="/lingnan-logo.svg" alt="Lingnan University Emblem" class="brand-emblem" />
  <h2>Lingnanian Monthly - Spring Edition</h2>
  <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80" alt="Campus Scenic View" />
  <p>Explore recent liberal arts achievements, research breakthroughs, and hostel cultural traditions.</p>
  <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80" alt="Fong Sum Wood Library" />
</div>`,
  },
];
