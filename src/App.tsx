import React, { useState } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { StudentHeader } from './components/StudentHeader';
import { NavigationBottomBar, TabType } from './components/NavigationBottomBar';
import { HomeTab } from './components/HomeTab';
import { TimetableTab } from './components/TimetableTab';
import { EventsTab } from './components/EventsTab';
import { AcademicTab } from './components/AcademicTab';
import { CampusLifeTab } from './components/CampusLifeTab';
import { ShuttleBusTab } from './components/ShuttleBusTab';
import { SettingsTab } from './components/SettingsTab.tsx';
import { LibraryBookingModal } from './components/LibraryBookingModal';
import {
  AppNotification,
  isOfficialPushNotification,
  NotificationModal,
} from './components/NotificationModal';
const initialNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'ILP Units Approved & Credited',
    desc: 'Your participation in "Lingnan Centenary Campus Heritage Tour" has been verified and awarded 3 Civic Education units.',
    time: '10 mins ago',
    kind: 'award',
    isRead: false,
  },
  {
    id: 'n3',
    title: 'Term 1 Final Exam Timetable Released',
    desc: 'The Registry has published the final examination venues and schedule on the myLingnan portal.',
    time: '1 day ago',
    kind: 'exam',
    isRead: false,
  },
  {
    id: 'n4',
    title: 'Campus Weather & Transit Alert',
    desc: 'Standby Signal No. 1 is in effect. All classes and Siu Hong MTR campus shuttle bus services remain normal.',
    time: '1 day ago',
    kind: 'alert',
    isRead: false,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [openEfeesOnCampus, setOpenEfeesOnCampus] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  const unreadCount = notifications.filter(
    (item) => isOfficialPushNotification(item) && !item.isRead,
  ).length;

  const pageTitleByTab: Record<TabType, string> = {
    home: 'Home',
    calendar: 'Personal Calendar',
    academic: 'Academic Service',
    campus: 'Student Life',
    events: 'Events',
    transport: 'Transport',
    setting: 'Settings',
  };

  const handleAddStudyReminderNotification = (taskText: string, reminderDateTime: string) => {
    const displayDateTime = reminderDateTime.replace('T', ' ');
    setNotifications((prev) => [
      {
        id: `study-${Date.now()}`,
        title: 'New Study Reminder Added',
        desc: `${taskText} (Reminder at ${displayDateTime})`,
        time: 'Just now',
        kind: 'study',
        isRead: false,
      },
      ...prev,
    ]);
  };

  return (
    <MobileFrame
      topBar={
        <StudentHeader
          pageTitle={pageTitleByTab[activeTab]}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          unreadCount={unreadCount}
        />
      }
      bottomBar={
        <NavigationBottomBar
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
        />
      }
    >
      <main className="flex flex-1 flex-col">
        {activeTab === 'home' && (
          <HomeTab
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenLibraryModal={() => setIsLibraryOpen(true)}
            onOpenEfeesNotes={() => {
              setOpenEfeesOnCampus(true);
              setActiveTab('campus');
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <TimetableTab onAddStudyReminder={handleAddStudyReminderNotification} />
        )}

        {activeTab === 'events' && <EventsTab />}

        {activeTab === 'transport' && (
          <div className="page-shell">
            <ShuttleBusTab />
          </div>
        )}

        {activeTab === 'academic' && <AcademicTab />}

        {activeTab === 'campus' && (
          <CampusLifeTab
            onOpenLibraryModal={() => setIsLibraryOpen(true)}
            onOpenEventsPage={() => setActiveTab('events')}
            openEfeesOnMount={openEfeesOnCampus}
            onEfeesOpened={() => setOpenEfeesOnCampus(false)}
          />
        )}

        {activeTab === 'setting' && <SettingsTab />}
      </main>

      <LibraryBookingModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) =>
            prev.map((item) =>
              isOfficialPushNotification(item) ? { ...item, isRead: true } : item,
            ),
          )
        }
      />

    </MobileFrame>
  );
}
