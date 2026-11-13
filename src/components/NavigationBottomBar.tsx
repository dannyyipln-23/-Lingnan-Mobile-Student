import React from 'react';
import {
  CalendarDays,
  Compass,
  GraduationCap,
  Home,
  Settings,
} from 'lucide-react';

export type TabType = 'home' | 'calendar' | 'academic' | 'campus' | 'events' | 'transport' | 'setting';

interface NavigationBottomBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const NavigationBottomBar: React.FC<NavigationBottomBarProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'calendar' as TabType,
      label: 'Calendar',
      icon: CalendarDays,
    },
    {
      id: 'academic' as TabType,
      label: 'Academic',
      icon: GraduationCap,
    },
    {
      id: 'campus' as TabType,
      label: 'Services',
      icon: Compass,
    },
    {
      id: 'setting' as TabType,
      label: 'Setting',
      icon: Settings,
      highlight: true,
    },
  ];

  return (
    <nav className="nav-bar">
      <div className="nav-bar__grid">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`nav-item${isActive ? ' is-active' : ''}`}
            >
              {tab.highlight && !isActive && (
                <span className="nav-item__dot" />
              )}
              <div className={`nav-item__icon${isActive ? ' is-active' : ''}`}>
                <Icon className="nav-item__svg" />
              </div>
              <span className="nav-item__label">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
