import React from 'react';
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

interface CampusLifeTabProps {
  onOpenLibraryModal: () => void;
}

export const CampusLifeTab: React.FC<CampusLifeTabProps> = ({ onOpenLibraryModal }) => {
  const sectionClass = 'rounded-2xl bg-white border border-slate-200 p-4 shadow-sm';
  const sectionTitleClass = 'text-xs font-bold text-slate-500 uppercase tracking-wider mb-2';
  const itemButtonClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left hover:bg-slate-100 transition';
  const disabledButtonClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left opacity-60 cursor-not-allowed';

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
      title: 'External Website (Disabled for now)',
      icon: ExternalLink,
      disabled: true,
      items: [
        'Lingnan LMS (Moodle)',
        'LU GenAI Portal (formerly LU ChatGPT Portal)',
        'Anti-Fraud Online Training',
        'Wayfinding System',
      ],
    },
  ];

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Campus Applications Hub
          </h2>
          <p className="text-xs text-slate-500">
            Grouped systems and services for academics, admin and campus life
          </p>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Pinned tools</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={itemButtonClass}
          >
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 border border-red-200 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">My Class Schedule</p>
                <p className="text-[11px] text-slate-500">Quick academic view</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            className={itemButtonClass}
          >
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                <Route className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Wayfinding ready</p>
                <p className="text-[11px] text-slate-500">External link disabled</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenLibraryModal}
            className={itemButtonClass}
          >
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <Library className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Library booking</p>
                <p className="text-[11px] text-slate-500">Open seat booking modal</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            className={itemButtonClass}
          >
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Graduation progress</p>
                <p className="text-[11px] text-slate-500">Requirements overview</p>
              </div>
            </div>
          </button>
        </div>
      </div>

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
              {group.disabled && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  <Lock className="w-3 h-3" />
                  <span>Disabled</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.items.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={group.disabled}
                  className={group.disabled ? disabledButtonClass : itemButtonClass}
                >
                  <div className="flex items-start justify-between space-x-2">
                    <div className="inline-flex items-start space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                        {group.id === 'academic' && <BookOpen className="w-3.5 h-3.5" />}
                        {group.id === 'admin' && <FileText className="w-3.5 h-3.5" />}
                        {group.id === 'campus' && <Landmark className="w-3.5 h-3.5" />}
                        {group.id === 'external' && <ExternalLink className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 text-left">{item}</span>
                    </div>
                    {group.disabled && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />}
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
