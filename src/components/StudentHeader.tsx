import React from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { CURRENT_STUDENT } from '../data/mockData';

interface StudentHeaderProps {
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  onOpenNotifications,
  unreadCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 text-slate-900 shadow-xs">
      <div className="flex items-center justify-between">
        {/* Lingnan Emblem & Branding in Lighten Red + Grey Theme */}
        <div className="flex items-center space-x-2.5">
          <div className="relative w-9 h-9 rounded-full bg-slate-50 p-0.5 shadow-xs ring-2 ring-red-500/30 flex items-center justify-center overflow-hidden border border-slate-200">
            <img
              src="/lingnan-logo.svg"
              alt="Lingnan University Emblem"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase">
                Lingnan University
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900 leading-tight">
              Student Mobile Portal
            </h1>
          </div>
        </div>

        {/* Right Actions: Notifications & Student Avatar */}
        <div className="flex items-center space-x-2.5">
          <div className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600">
            <span>Term 1</span>
          </div>

          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200 bg-slate-50"
            aria-label="Campus Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          <div className="w-8 h-8 rounded-full ring-2 ring-red-500/20 overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
            <img
              src={CURRENT_STUDENT.avatarUrl}
              alt={CURRENT_STUDENT.fullName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
