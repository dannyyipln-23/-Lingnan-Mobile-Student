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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  return (
    <MobileFrame>
      {/* Top Header */}
      <StudentHeader
        onOpenNotifications={() => setIsNotificationOpen(true)}
        unreadCount={4}
      />

      {/* Main Tab Views */}
      <main className="mt-2">
        {activeTab === 'home' && (
          <HomeTab
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenLibraryModal={() => setIsLibraryOpen(true)}
          />
        )}

        {activeTab === 'timetable' && <TimetableTab />}

        {activeTab === 'campus' && (
          <CampusLifeTab
            onOpenLibraryModal={() => setIsLibraryOpen(true)}
          />
        )}

        {activeTab === 'setting' && <SettingsTab />}
      </main>

      {/* Bottom Floating Navigation */}
      <NavigationBottomBar
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
      />

      {/* Interactive Modals */}
      <LibraryBookingModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </MobileFrame>
  );
}
