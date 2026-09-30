import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  ExternalLink,
  FileText,
  GraduationCap,
  House,
  Landmark,
  Library,
  Lock,
  Route,
  School,
  Wallet,
} from 'lucide-react';
import { AcademicSystemKey, AcademicSystemPage } from './AcademicSystemPage';
import { EarlyGradeReleaseFlow } from './academic/EarlyGradeReleaseFlow';
import { MyAcademicResultsFlow } from './academic/MyAcademicResultsFlow';
import { MyClassScheduleFlow } from './academic/MyClassScheduleFlow';
import { MyExamTimetableFlow } from './academic/MyExamTimetableFlow';
import { MyGraduationRequirementsFlow } from './academic/MyGraduationRequirementsFlow';
import { useAppPreferences } from '../context/AppPreferencesContext';

interface CampusLifeTabProps {
  onOpenLibraryModal: () => void;
  onOpenEventsPage: () => void;
}

const EXTERNAL_URLS: Record<string, string> = {
  'Lingnan LMS (Moodle)': 'https://lms.ln.edu.hk',
  'LU GenAI Portal (formerly LU ChatGPT Portal)': 'https://genai.ln.edu.hk',
  'Anti-Fraud Online Training': 'https://www.ln.edu.hk/itsc',
  'Wayfinding System': 'https://map.ln.edu.hk/',
};

export const CampusLifeTab: React.FC<CampusLifeTabProps> = ({ onOpenLibraryModal, onOpenEventsPage }) => {
  const { openInAppBrowser } = useAppPreferences();
  const [activeAcademicPage, setActiveAcademicPage] = useState<AcademicSystemKey | null>(null);

  const sectionClass = 'rounded-2xl bg-white border border-slate-200 p-3 shadow-sm';
  const sectionTitleClass = 'text-xs font-bold text-slate-600 uppercase tracking-wider mb-2';
  const itemButtonClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-left hover:bg-slate-100 transition';
  const disabledButtonClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-left opacity-60 cursor-not-allowed';

  const appGroups = [
    {
      id: 'academic',
      title: 'Academic Systems',
      icon: School,
      items: [
        'Academic Record Application System',
        'My Academic Results',
        'My Graduation Requirements',
        'My Class Schedule',
        'My Exam Timetable',
        'Student Exam Timetable',
        'Student Graduation Information',
        'Early Grade Release',
        'ELGR Extension System',
        'Accessing CTLE Scores',
        'Degree Works',
        'Degree Works - Student Information Dashboard',
      ],
    },
    {
      id: 'admin',
      title: 'Administration and Fees',
      icon: Wallet,
      items: [
        'eDeferment System for Tuition/Hostel Fee',
        'eFees Note System',
        'eFees Note for TPg Student',
        'Application for Temporary Certificates of Graduation',
        'Academic Advising Booking System',
      ],
    },
    {
      id: 'campus',
      title: 'Campus Life and Services',
      icon: House,
      items: [
        'Counselling Services Booking System',
        'Hostel Room Allocation',
        'University\'s Depository (displaying Courses mats)',
        'Event Management System',
        'Anti-Fraud Online Training',
      ],
    },
    {
      id: 'external',
      title: 'External Websites',
      icon: ExternalLink,
      items: [
        'Lingnan LMS (Moodle)',
        'LU GenAI Portal (formerly LU ChatGPT Portal)',
        'Anti-Fraud Online Training',
        'Wayfinding System',
      ],
    },
  ];

  // Only map systems that have dedicated flow UIs; unmapped academic items stay disabled.
  const academicPageMap = useMemo<Record<string, AcademicSystemKey>>(
    () => ({
      'My Academic Results': 'my-academic-results',
      'My Graduation Requirements': 'my-graduation-requirements',
      'My Class Schedule': 'my-class-schedule',
      'My Exam Timetable': 'my-exam-timetable',
      'Student Exam Timetable': 'my-exam-timetable',
      'Early Grade Release': 'early-grade-release',
    }),
    [],
  );

  const groupedJourney = [
    {
      id: 'course',
      title: 'Course',
      accent: 'border-red-200 bg-red-50 text-red-700',
      items: [
        {
          id: 'course-outline',
          label: 'Course outline and curriculum overview',
          icon: BookOpen,
          onClick: () => setActiveAcademicPage('my-class-schedule'),
        },
        {
          id: 'enrolled-courses',
          label: 'Enrolled courses and class schedule',
          icon: Calendar,
          onClick: () => setActiveAcademicPage('my-class-schedule'),
        },
      ],
    },
    {
      id: 'assignment',
      title: 'Assignment',
      accent: 'border-blue-200 bg-blue-50 text-blue-700',
      items: [
        {
          id: 'moodle-assignments',
          label: 'Moodle assignments dashboard (API source)',
          icon: School,
          onClick: () => openInAppBrowser(EXTERNAL_URLS['Lingnan LMS (Moodle)'], 'Moodle Assignments'),
        },
        {
          id: 'moodle-submissions',
          label: 'Moodle submission status and due tasks',
          icon: FileText,
          onClick: () => openInAppBrowser(EXTERNAL_URLS['Lingnan LMS (Moodle)'], 'Moodle Submission Status'),
        },
      ],
    },
    {
      id: 'exam',
      title: 'Examation',
      accent: 'border-amber-200 bg-amber-50 text-amber-700',
      items: [
        {
          id: 'exam-timetable',
          label: 'My exam timetable and arrangements',
          icon: GraduationCap,
          onClick: () => setActiveAcademicPage('my-exam-timetable'),
        },
        {
          id: 'early-grade-release',
          label: 'Early grade release information',
          icon: ExternalLink,
          onClick: () => setActiveAcademicPage('early-grade-release'),
        },
      ],
    },
    {
      id: 'grade',
      title: 'Academic results',
      accent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      items: [
        {
          id: 'academic-results',
          label: 'My academic results and GPA summary',
          icon: Landmark,
          onClick: () => setActiveAcademicPage('my-academic-results'),
        },
        {
          id: 'degree-works',
          label: 'Graduation and degree works progress',
          icon: Route,
          onClick: () => setActiveAcademicPage('my-graduation-requirements'),
        },
      ],
    },
  ];

  if (activeAcademicPage) {
    const closePage = () => setActiveAcademicPage(null);

    if (activeAcademicPage === 'my-academic-results') {
      return <MyAcademicResultsFlow onBack={closePage} />;
    }
    if (activeAcademicPage === 'my-exam-timetable') {
      return <MyExamTimetableFlow onBack={closePage} />;
    }
    if (activeAcademicPage === 'my-class-schedule') {
      return <MyClassScheduleFlow onBack={closePage} />;
    }
    if (activeAcademicPage === 'early-grade-release') {
      return <EarlyGradeReleaseFlow onBack={closePage} />;
    }
    if (activeAcademicPage === 'my-graduation-requirements') {
      return <MyGraduationRequirementsFlow onBack={closePage} />;
    }

    return (
      <AcademicSystemPage
        systemKey={activeAcademicPage}
        onBack={closePage}
      />
    );
  }

  return (
    <div className="page-shell page-shell--campus space-y-3">
      <div className="px-0.5">
        <h2 className="text-lg font-bold text-slate-900">Campus Life Journey</h2>
        <p className="text-xs text-slate-600">
          Grouped path: course details, assignments, exams, and grades
        </p>
      </div>

      <section className={sectionClass}>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className={sectionTitleClass}>Academic journey</h3>
        </div>

        <div className="space-y-2">
          {groupedJourney.map((group) => (
            <div key={group.id} className="rounded-xl border border-slate-200 bg-white p-2.5">
              <div className={`mb-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${group.accent}`}>
                {group.title}
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onClick}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-left hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex min-w-0 items-center gap-2">
                          <div className="h-7 w-7 shrink-0 rounded-lg border border-slate-200 bg-white text-slate-700 flex items-center justify-center">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-slate-800 leading-snug">{item.label}</span>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {appGroups.map((group) => {
        const Icon = group.icon;

        return (
          <section key={group.id} className={sectionClass}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="inline-flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{group.title}</h3>
              </div>
              {group.id === 'external' && (
                <span className="inline-flex items-center space-x-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                  <ExternalLink className="h-3 w-3" />
                  <span>In-app</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {group.items.map((item) => {
                const pageKey = group.id === 'academic' ? academicPageMap[item] : undefined;
                const externalUrl = group.id === 'external' ? EXTERNAL_URLS[item] : undefined;
                const isEventManagementSystem = group.id === 'campus' && item === 'Event Management System';
                const isDisabled =
                  (group.id === 'academic' && !pageKey) ||
                  group.id === 'admin' ||
                  (group.id === 'campus' && !isEventManagementSystem) ||
                  (group.id === 'external' && !externalUrl);

                return (
                  <button
                    key={item}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (pageKey) {
                        setActiveAcademicPage(pageKey);
                        return;
                      }
                      if (isEventManagementSystem) {
                        onOpenEventsPage();
                        return;
                      }
                      if (externalUrl) {
                        openInAppBrowser(externalUrl, item);
                      }
                    }}
                    className={isDisabled ? disabledButtonClass : itemButtonClass}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex min-w-0 items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                          {group.id === 'academic' && <BookOpen className="h-3.5 w-3.5" />}
                          {group.id === 'admin' && <FileText className="h-3.5 w-3.5" />}
                          {group.id === 'campus' && <Landmark className="h-3.5 w-3.5" />}
                          {group.id === 'external' && <ExternalLink className="h-3.5 w-3.5" />}
                        </div>
                        <span className="text-left text-xs font-semibold leading-snug text-slate-800">
                          {item}
                        </span>
                      </div>
                      {isDisabled ? (
                        <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      ) : group.id === 'external' ? (
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-blue-700" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
