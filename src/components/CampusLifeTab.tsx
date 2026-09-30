import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  GraduationCap,
  House,
  Landmark,
  Lock,
  Route,
  School,
  Wallet,
} from 'lucide-react';
import { AcademicSystemKey, AcademicSystemPage } from './AcademicSystemPage';
import { EarlyGradeReleaseFlow } from './academic/EarlyGradeReleaseFlow';
import { ElgrExtensionFlow } from './academic/ElgrExtensionFlow';
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
      'ELGR Extension System': 'elgr-extension-system',
    }),
    [],
  );

  const groupedJourney = [
    {
      id: 'course',
      title: 'Course',
      hint: 'Outline, enrolment, and weekly timetable',
      accent: '#b91c1c',
      items: [
        {
          id: 'course-outline',
          label: 'Course outline & curriculum',
          icon: BookOpen,
          onClick: () => setActiveAcademicPage('my-class-schedule'),
        },
        {
          id: 'enrolled-courses',
          label: 'Enrolled courses & schedule',
          icon: Calendar,
          onClick: () => setActiveAcademicPage('my-class-schedule'),
        },
      ],
    },
    {
      id: 'assignment',
      title: 'Assignment',
      hint: 'Moodle tasks, deadlines, and submissions',
      accent: '#1d4ed8',
      items: [
        {
          id: 'moodle-assignments',
          label: 'Assignments dashboard',
          icon: ClipboardList,
          onClick: () => openInAppBrowser(EXTERNAL_URLS['Lingnan LMS (Moodle)'], 'Moodle Assignments'),
        },
        {
          id: 'moodle-submissions',
          label: 'Submission status & due tasks',
          icon: FileText,
          onClick: () => openInAppBrowser(EXTERNAL_URLS['Lingnan LMS (Moodle)'], 'Moodle Submission Status'),
        },
      ],
    },
    {
      id: 'exam',
      title: 'Examination',
      hint: 'Exam seats, venues, and early release',
      accent: '#b45309',
      items: [
        {
          id: 'exam-timetable',
          label: 'Exam timetable & venues',
          icon: GraduationCap,
          onClick: () => setActiveAcademicPage('my-exam-timetable'),
        },
        {
          id: 'early-grade-release',
          label: 'Early grade release',
          icon: ExternalLink,
          onClick: () => setActiveAcademicPage('early-grade-release'),
        },
      ],
    },
    {
      id: 'grade',
      title: 'Academic results',
      hint: 'GPA summary and graduation checklist',
      accent: '#047857',
      items: [
        {
          id: 'academic-results',
          label: 'Results & GPA summary',
          icon: Landmark,
          onClick: () => setActiveAcademicPage('my-academic-results'),
        },
        {
          id: 'elgr-extension',
          label: 'ELGR extension',
          icon: ExternalLink,
          onClick: () => setActiveAcademicPage('elgr-extension-system'),
        },
        {
          id: 'degree-works',
          label: 'Graduation progress',
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
    if (activeAcademicPage === 'elgr-extension-system') {
      return <ElgrExtensionFlow onBack={closePage} />;
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
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Campus</p>
        <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">Campus Life Journey</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Follow the academic path from courses to graduation.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-3.5 shadow-sm backdrop-blur-sm">
        <div className="mb-3.5 flex items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900">Academic journey</h3>
          </div>
        </div>

        <div className="journey-path">
          {groupedJourney.map((group, index) => (
            <div
              key={group.id}
              className="journey-stage"
              style={{ ['--journey-accent' as string]: group.accent }}
            >
              <div className="journey-stage__rail">
                <div className="journey-stage__marker">
                  <span className="text-[10px] font-bold">{index + 1}</span>
                </div>
              </div>
              <div className="journey-stage__body">
                <p className="journey-stage__title">{group.title}</p>
                <p className="journey-stage__hint">{group.hint}</p>
                <div className="mt-2.5 space-y-1.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.onClick}
                        className="journey-action"
                      >
                        <div className="journey-action__icon">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="journey-action__label">{item.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
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
