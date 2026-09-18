import React from 'react';
import { Home, CreditCard, Calendar, Compass, Bus, CalendarDays } from 'lucide-react';

export type TabType = 'home' | 'idcard' | 'timetable' | 'campus' | 'shuttle' | 'events';

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
      id: 'idcard' as TabType,
      label: 'Student ID',
      icon: CreditCard,
    },
    {
      id: 'timetable' as TabType,
      label: 'Timetable',
      icon: Calendar,
    },
    {
      id: 'campus' as TabType,
      label: 'Campus',
      icon: Compass,
    },
    {
      id: 'shuttle' as TabType,
      label: 'Shuttle',
      icon: Bus,
      highlight: true,
    },
    {
      id: 'events' as TabType,
      label: 'Events',
      icon: CalendarDays,
      highlight: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe">
      <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 relative transition-colors ${
                isActive
                  ? 'text-red-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.highlight && !isActive && (
                <span className="absolute top-1 right-3.5 w-2 h-2 rounded-full bg-red-500 animate-pulse ring-2 ring-white" />
              )}
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-red-50 text-red-600 scale-105 border border-red-100 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[68px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
