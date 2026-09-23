import React from 'react';
import { Home, Calendar, Compass, Settings } from 'lucide-react';

export type TabType = 'home' | 'timetable' | 'campus' | 'setting';

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
      id: 'setting' as TabType,
      label: 'Setting',
      icon: Settings,
      highlight: true,
    },
  ];

  return (
    <nav className="z-40 shrink-0 border-t border-slate-200 bg-white/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(15,23,42,0.06)] backdrop-blur-md">
      <div className="grid grid-cols-4 gap-0 px-1 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
                isActive ? 'text-red-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.highlight && !isActive && (
                <span className="absolute right-[28%] top-1 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
              )}
              <div
                className={`rounded-xl p-1.5 transition-all ${
                  isActive
                    ? 'scale-105 border border-red-200 bg-red-50 text-red-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="max-w-full truncate px-0.5 text-[10px] leading-none tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
