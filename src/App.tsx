import React, { useState } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { StudentHeader } from './components/StudentHeader';
import { NavigationBottomBar, TabType } from './components/NavigationBottomBar';
import { HomeTab } from './components/HomeTab';
import { TimetableTab } from './components/TimetableTab';
import { EventsTab } from './components/EventsTab';
import { CampusLifeTab } from './components/CampusLifeTab';
import { SettingsTab } from './components/SettingsTab.tsx';
import { LibraryBookingModal } from './components/LibraryBookingModal';
import { AppNotification, NotificationModal } from './components/NotificationModal';
import { InAppBrowser } from './components/InAppBrowser';

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
    id: 'n2',
    title: 'Library Book Due Date Reminder',
    desc: 'Borrowed book "Principles of Risk Management" is due in 3 days. You can renew online via 1-Search.',
    time: '2 hours ago',
    kind: 'library',
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
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

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
          />
        )}

        {activeTab === 'calendar' && (
          <TimetableTab onAddStudyReminder={handleAddStudyReminderNotification} />
        )}

        {activeTab === 'events' && <EventsTab />}

        {activeTab === 'campus' && (
          <CampusLifeTab
            onOpenLibraryModal={() => setIsLibraryOpen(true)}
            onOpenEventsPage={() => setActiveTab('events')}
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
        onMarkAllRead={() => setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))}
      />

      <InAppBrowser />
    </MobileFrame>
  );
}
