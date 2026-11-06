import React from 'react';
import { Bell } from 'lucide-react';

interface StudentHeaderProps {
  pageTitle: string;
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  pageTitle,
  onOpenNotifications,
  unreadCount,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white px-[var(--frame-pad)] py-2.5 text-slate-900">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center space-x-2.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-0.5 shadow-xs ring-2 ring-red-500/30">
            <img
              src="lingnan-logo.svg"
              alt="Lingnan University Emblem"
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                Lingnan University
              </span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
            </div>
            <h1 className="truncate text-sm font-extrabold leading-tight tracking-tight text-slate-900">
              {pageTitle}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative shrink-0 rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Campus Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-red-600 ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
};
