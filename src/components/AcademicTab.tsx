import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  ExternalLink,
  FileText,
  GraduationCap,
  Landmark,
  Route,
  School,
} from 'lucide-react';
import { AcademicSystemKey } from './AcademicSystemPage';
import { EarlyGradeReleaseFlow } from './academic/EarlyGradeReleaseFlow';
import { ElgrExtensionFlow } from './academic/ElgrExtensionFlow';
import { MyAcademicResultsFlow } from './academic/MyAcademicResultsFlow';
import { MyClassScheduleFlow } from './academic/MyClassScheduleFlow';
import { MyExamTimetableFlow } from './academic/MyExamTimetableFlow';
import { MyGraduationRequirementsFlow } from './academic/MyGraduationRequirementsFlow';
import { useAppPreferences } from '../context/AppPreferencesContext';

type AcademicAction =
  | { type: 'flow'; key: AcademicSystemKey }
  | { type: 'url'; href: string };

type JourneyItem = {
  id: string;
  label: string;
  icon: typeof BookOpen;
  action: AcademicAction;
};

type JourneyGroup = {
  id: string;
  title: string;
  hint: string;
  accent: string;
  items: JourneyItem[];
};

export const AcademicTab: React.FC = () => {
  const { openInAppBrowser } = useAppPreferences();
  const [activeAcademicPage, setActiveAcademicPage] = useState<AcademicSystemKey | null>(null);

  const groupedJourney = useMemo<JourneyGroup[]>(
    () => [
      {
        id: 'course-information',
        title: 'Course Information',
        hint: 'Outline, registration, degree audit, and schedule',
        accent: '#b91c1c',
        items: [
          {
            id: 'course-outline',
            label: 'Course Outline',
            icon: BookOpen,
            action: { type: 'url', href: 'https://webapp.ln.edu.hk/sys/depository/' },
          },
          {
            id: 'course-registration',
            label: 'Course Registration',
            icon: School,
            action: {
              type: 'url',
              href: 'https://banner.ln.edu.hk:8443/ssomanager/c/SSB?pkg=usr_registration.redirect',
            },
          },
          {
            id: 'degree-works',
            label: 'Degree Works',
            icon: Route,
            action: { type: 'url', href: 'https://academicp6.ln.edu.hk:8445' },
          },
          {
            id: 'my-class-schedule',
            label: 'My Class Schedule',
            icon: Calendar,
            action: { type: 'flow', key: 'my-class-schedule' },
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
            action: { type: 'url', href: 'https://lms.ln.edu.hk/' },
          },
          {
            id: 'moodle-submissions',
            label: 'Submission status & due tasks',
            icon: FileText,
            action: { type: 'url', href: 'https://lms.ln.edu.hk/' },
          },
        ],
      },
      {
        id: 'examination',
        title: 'Examination',
        hint: 'Exam seats, venues, and early release',
        accent: '#b45309',
        items: [
          {
            id: 'early-grade-release',
            label: 'Early Grade Release',
            icon: ExternalLink,
            action: { type: 'flow', key: 'early-grade-release' },
          },
          {
            id: 'my-exam-timetable',
            label: 'My Exam Timetable',
            icon: GraduationCap,
            action: { type: 'flow', key: 'my-exam-timetable' },
          },
        ],
      },
      {
        id: 'online-application',
        title: 'Online Application',
        hint: 'Transcripts, approvals, CTLE, and ELGR',
        accent: '#7c3aed',
        items: [
          {
            id: 'testimonial-transcript',
            label: 'Testimonial / Transcript',
            icon: FileText,
            action: { type: 'url', href: 'https://uniapp.ln.edu.hk/arms' },
          },
          {
            id: 'special-approval',
            label: 'Special Approval on Course Enrolment',
            icon: ClipboardCheck,
            action: { type: 'url', href: 'https://bannerapp.ln.edu.hk/aadc/' },
          },
          {
            id: 'exemption-prerequisite',
            label: 'Exemption of Prerequisite for Courses',
            icon: FileText,
            action: { type: 'url', href: 'https://bannerapp.ln.edu.hk/aepc/stud' },
          },
          {
            id: 'ctle-scores',
            label: 'Accessing CTLE Scores',
            icon: Landmark,
            action: {
              type: 'url',
              href: 'https://banner.ln.edu.hk:8443/ssomanager/c/SSB?pkg=usr_stu_ctle.apply',
            },
          },
          {
            id: 'elgr-extension',
            label: 'ELGR Extension System',
            icon: BookOpen,
            action: { type: 'flow', key: 'elgr-extension-system' },
          },
        ],
      },
      {
        id: 'academic-results',
        title: 'Academic results',
        hint: 'GPA summary and graduation checklist',
        accent: '#047857',
        items: [
          {
            id: 'my-academic-results',
            label: 'My Academic Results',
            icon: Landmark,
            action: { type: 'flow', key: 'my-academic-results' },
          },
          {
            id: 'my-graduation-requirements',
            label: 'My Graduation Requirements',
            icon: Route,
            action: { type: 'flow', key: 'my-graduation-requirements' },
          },
        ],
      },
    ],
    [],
  );

  const runAction = (action: AcademicAction) => {
    if (action.type === 'flow') {
      setActiveAcademicPage(action.key);
      return;
    }
    openInAppBrowser(action.href);
  };

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

    return null;
  }

  return (
    <div className="page-shell page-shell--academic space-y-3">

      <section className="acad-panel">
        <div className="acad-panel__head">
          <div>
            <h3 className="acad-panel__title">Academic Journey</h3>
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
                  <span className="journey-stage__index">{index + 1}</span>
                </div>
              </div>
              <div className="journey-stage__body">
                <p className="journey-stage__title">{group.title}</p>
                <p className="journey-stage__hint">{group.hint}</p>
                <div className="acad-items">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isExternal = item.action.type === 'url';

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => runAction(item.action)}
                        className="journey-action"
                      >
                        <div className="journey-action__icon">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="journey-action__label">{item.label}</span>
                        {isExternal ? (
                          <ExternalLink className="journey-action__chev journey-action__chev--ext" />
                        ) : (
                          <ChevronRight className="journey-action__chev" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
