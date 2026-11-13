import React, { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  FileBadge,
  HeartHandshake,
  House,
  LucideIcon,
  MapPinned,
  Receipt,
  ShieldAlert,
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
  icon: LucideIcon;
  accent: string;
  action: ServiceAction;
};

type ServiceGroup = {
  id: string;
  title: string;
  icon: LucideIcon;
  items: ServiceItem[];
};

export const CampusLifeTab: React.FC<CampusLifeTabProps> = ({
  onOpenEventsPage,
  openEfeesOnMount = false,
  onEfeesOpened,
}) => {
  const { openInAppBrowser, studentLifeLayout } = useAppPreferences();
  const [activePage, setActivePage] = useState<'efees' | null>(null);
  const isGrid = studentLifeLayout === 'grid';

  useEffect(() => {
    if (!openEfeesOnMount) return;
    setActivePage('efees');
    onEfeesOpened?.();
  }, [openEfeesOnMount, onEfeesOpened]);

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
            icon: Receipt,
            accent: '#BE123C',
            action: { type: 'efees' },
          },
          {
            id: 'temporary-certificates',
            seq: '2.1.2',
            displayName: 'Application for Temporary Certificates of Graduation',
            icon: FileBadge,
            accent: '#1D4ED8',
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
            icon: House,
            accent: '#0F766E',
            action: { type: 'url', href: 'https://bannerapp.ln.edu.hk/hostel/hostelR/index/' },
          },
          {
            id: 'counselling',
            seq: '2.2.2',
            displayName: 'Counselling Services Booking',
            icon: HeartHandshake,
            accent: '#C2410C',
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
            icon: CalendarDays,
            accent: '#7C3AED',
            action: { type: 'events' },
          },
          {
            id: 'anti-fraud',
            seq: '2.3.2',
            displayName: 'Anti-Fraud Online Training',
            icon: ShieldAlert,
            accent: '#B45309',
            action: { type: 'url', href: 'https://uniapp.ln.edu.hk/anti-fraud/' },
          },
          {
            id: 'lu-chatgpt',
            seq: '2.3.3',
            displayName: 'LU ChatGPT',
            icon: Bot,
            accent: '#0369A1',
            action: { type: 'url', href: 'https://genai.ln.edu.hk' },
          },
          {
            id: 'wayfinding',
            seq: '2.3.4',
            displayName: 'Wayfinding System',
            icon: MapPinned,
            accent: '#15803D',
            action: { type: 'url', href: 'https://map.ln.edu.hk/' },
          },
        ],
      },
    ],
    [],
  );

  const handleItemClick = (item: ServiceItem) => {
    if (item.action.type === 'events') {
      onOpenEventsPage();
      return;
    }
    if (item.action.type === 'efees') {
      setActivePage('efees');
      return;
    }
    openInAppBrowser(item.action.href, item.displayName);
  };

  if (activePage === 'efees') {
    return <EFeesNotesFlow onBack={() => setActivePage(null)} />;
  }

  return (
    <div className="page-shell page-shell--campus space-y-3">

      {appGroups.map((group) => {
        const Icon = group.icon;

        return (
          <section key={group.id} className="svc-section">
            <div className="svc-section__head">
              <div className="svc-section__title-wrap">
                <div className="svc-section__icon">
                  <Icon className="svc-section__icon-svg" />
                </div>
                <h3 className="svc-section__title">{group.title}</h3>
              </div>
            </div>

            {isGrid ? (
              <div className="svc-grid">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isExternal = item.action.type === 'url';

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className="svc-grid-card"
                    >
                      {isExternal && <ExternalLink className="svc-grid-card__ext" />}
                      <div
                        className="svc-grid-card__icon"
                        style={{
                          background: `color-mix(in srgb, ${item.accent} 14%, white)`,
                          color: item.accent,
                        }}
                      >
                        <ItemIcon className="svc-grid-card__icon-svg" strokeWidth={1.75} />
                      </div>
                      <span className="svc-grid-card__label">{item.displayName}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="svc-list">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isExternal = item.action.type === 'url';

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className="svc-list-item"
                    >
                      <div className="svc-list-item__row">
                        <div className="svc-list-item__lead">
                          <div className="svc-list-item__icon" style={{ color: item.accent }}>
                            <ItemIcon className="svc-list-item__icon-svg" />
                          </div>
                          <span className="svc-list-item__label">{item.displayName}</span>
                        </div>
                        {isExternal ? (
                          <ExternalLink className="svc-list-item__trail svc-list-item__trail--ext" />
                        ) : (
                          <ChevronRight className="svc-list-item__trail svc-list-item__trail--chevron" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
