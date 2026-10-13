import React from 'react';
import {
  ExternalLink,
  FileText,
  House,
  Landmark,
  Lock,
  Wallet,
} from 'lucide-react';
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

export const CampusLifeTab: React.FC<CampusLifeTabProps> = ({ onOpenEventsPage }) => {
  const { openInAppBrowser } = useAppPreferences();

  const sectionClass = 'rounded-2xl bg-white border border-slate-200 p-3 shadow-sm';
  const itemButtonClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-left hover:bg-slate-100 transition';
  const disabledButtonClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-left opacity-60 cursor-not-allowed';

  const appGroups = [
    {
      id: 'admin',
      title: 'Administrative & Financial Services',
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
      title: 'Student Life & Services',
      icon: House,
      items: [
        'Counselling Services Booking System',
        'Hostel Room Allocation',
        "University's Depository (displaying Courses mats)",
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

  return (
    <div className="page-shell page-shell--campus space-y-3">
      <div className="px-0.5">
        <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
          Student Life & Services
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          University services for fees, student life, and external tools.
        </p>
      </div>

      {appGroups.map((group) => {
        const Icon = group.icon;

        return (
          <section key={group.id} className={sectionClass}>
            <div className="mb-2.5 flex items-center justify-between">
              <div className="inline-flex items-center space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700">
                  <Icon className="h-4 w-4" />
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
                const externalUrl = group.id === 'external' ? EXTERNAL_URLS[item] : undefined;
                const isEventManagementSystem = group.id === 'campus' && item === 'Event Management System';
                const isDisabled =
                  group.id === 'admin' ||
                  (group.id === 'campus' && !isEventManagementSystem) ||
                  (group.id === 'external' && !externalUrl);

                return (
                  <button
                    key={item}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
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
