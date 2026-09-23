import React, { useState } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { StudentHeader } from './components/StudentHeader';
import { NavigationBottomBar, TabType } from './components/NavigationBottomBar';
import { HomeTab } from './components/HomeTab';
import { TimetableTab } from './components/TimetableTab';
import { CampusLifeTab } from './components/CampusLifeTab';
import { SettingsTab } from './components/SettingsTab.tsx';
import { LibraryBookingModal } from './components/LibraryBookingModal';
import { NotificationModal } from './components/NotificationModal';
import { InAppBrowser } from './components/InAppBrowser';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  return (
    <MobileFrame>
      <StudentHeader
        onOpenNotifications={() => setIsNotificationOpen(true)}
        unreadCount={4}
      />

      <main className="mt-2">
        {activeTab === 'home' && (
          <HomeTab
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenLibraryModal={() => setIsLibraryOpen(true)}
          />
        )}

        {activeTab === 'timetable' && <TimetableTab />}

        {activeTab === 'campus' && (
          <CampusLifeTab onOpenLibraryModal={() => setIsLibraryOpen(true)} />
        )}

        {activeTab === 'setting' && <SettingsTab />}
      </main>

      <NavigationBottomBar
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
      />

      <LibraryBookingModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      <InAppBrowser />
    </MobileFrame>
  );
}
