import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  ExternalLink,
  FileText,
  House,
  Landmark,
  Users,
  Wallet,
} from 'lucide-react';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { EFeesNotesFlow } from './campus/EFeesNotesFlow';

interface CampusLifeTabProps {
  onOpenLibraryModal: () => void;
  onOpenEventsPage: () => void;
  openEfeesOnMount?: boolean;
  onEfeesOpened?: () => void;
}

type ServiceAction =
  | { type: 'events' }
  | { type: 'efees' }
  | { type: 'url'; href: string };

type ServiceItem = {
  id: string;
  seq: string;
  displayName: string;
  action: ServiceAction;
};

type ServiceGroup = {
  id: string;
  title: string;
  icon: typeof Wallet;
  items: ServiceItem[];
};

export const CampusLifeTab: React.FC<CampusLifeTabProps> = ({
  onOpenEventsPage,
  openEfeesOnMount = false,
  onEfeesOpened,
}) => {
  const { openInAppBrowser } = useAppPreferences();
  const [activePage, setActivePage] = useState<'efees' | null>(null);

  useEffect(() => {
    if (!openEfeesOnMount) return;
    setActivePage('efees');
    onEfeesOpened?.();
  }, [openEfeesOnMount, onEfeesOpened]);

  const sectionClass = 'rounded-2xl bg-white border border-slate-200 p-3 shadow-sm';
  const itemButtonClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-left hover:bg-slate-100 transition';

  const appGroups = useMemo<ServiceGroup[]>(
    () => [
      {
        id: 'admin',
        title: 'Administrative & Financial Services',
        icon: Wallet,
        items: [
          {
            id: 'efees-notes',
            seq: '2.1.1',
            displayName: 'eFees Notes',
            action: { type: 'efees' },
          },
          {
            id: 'temporary-certificates',
            seq: '2.1.2',
            displayName: 'Application for Temporary Certificates of Graduation',
            action: {
              type: 'url',
              href: 'https://lingnanhk.outsystems.app/AcademicRecordApplicationSystem',
            },
          },
        ],
      },
      {
        id: 'student-affairs',
        title: 'Student Affairs',
        icon: Users,
        items: [
          {
            id: 'hostel-allocation',
            seq: '2.2.1',
            displayName: 'Hostel Allocation Result',
            action: { type: 'url', href: 'https://bannerapp.ln.edu.hk/hostel/hostelR/index/' },
          },
          {
            id: 'counselling',
            seq: '2.2.2',
            displayName: 'Counselling Services Booking',
            action: {
              type: 'url',
              href: 'https://lingnanhk.outsystems.app/CounsellingServicesBookingSystem/',
            },
          },
        ],
      },
      {
        id: 'student-life',
        title: 'Smart Campus & Digital Services',
        icon: House,
        items: [
          {
            id: 'event-management',
            seq: '2.3.1',
            displayName: 'Event Management System',
            action: { type: 'events' },
          },
          {
            id: 'anti-fraud',
            seq: '2.3.2',
            displayName: 'Anti-Fraud Online Training',
            action: { type: 'url', href: 'https://uniapp.ln.edu.hk/anti-fraud/' },
          },
          {
            id: 'lu-chatgpt',
            seq: '2.3.3',
            displayName: 'LU ChatGPT',
            action: { type: 'url', href: 'https://genai.ln.edu.hk' },
          },
          {
            id: 'wayfinding',
            seq: '2.3.4',
            displayName: 'Wayfinding System',
            action: { type: 'url', href: 'https://map.ln.edu.hk/' },
          },
        ],
      },
    ],
    [],
  );

  if (activePage === 'efees') {
    return <EFeesNotesFlow onBack={() => setActivePage(null)} />;
  }

  return (
    <div className="page-shell page-shell--campus space-y-3">
      <div className="px-0.5">
        <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">Student Life</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          University services for fees, student affairs, and campus life tools.
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
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {group.items.map((item) => {
                const isExternal = item.action.type === 'url';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.action.type === 'events') {
                        onOpenEventsPage();
                        return;
                      }
                      if (item.action.type === 'efees') {
                        setActivePage('efees');
                        return;
                      }
                      openInAppBrowser(item.action.href, item.displayName);
                    }}
                    className={itemButtonClass}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex min-w-0 items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                          {group.id === 'admin' && <FileText className="h-3.5 w-3.5" />}
                          {group.id === 'student-affairs' && <Landmark className="h-3.5 w-3.5" />}
                          {group.id === 'student-life' && <ExternalLink className="h-3.5 w-3.5" />}
                        </div>
                        <span className="text-left text-xs font-semibold leading-snug text-slate-800">
                          {item.displayName}
                        </span>
                      </div>
                      {isExternal ? (
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-blue-700" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      )}
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
