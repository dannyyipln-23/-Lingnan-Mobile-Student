import React from 'react';
import { Bell, CircleHelp, Globe, Lock, UserRound } from 'lucide-react';
import { CURRENT_STUDENT } from '../data/mockData';

const settingItems = [
  {
    id: 'profile',
    title: 'Profile & Account',
    desc: 'Update contact and student profile settings',
    icon: UserRound,
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    desc: 'Password, session and security preferences',
    icon: Lock,
  },
  {
    id: 'notification',
    title: 'Notifications',
    desc: 'Manage academic and campus push alerts',
    icon: Bell,
  },
  {
    id: 'language',
    title: 'Language & Region',
    desc: 'Display language and locale format options',
    icon: Globe,
  },
  {
    id: 'help',
    title: 'Help & Support',
    desc: 'Support center and FAQ resources',
    icon: CircleHelp,
  },
];

export const SettingsTab: React.FC = () => {
  return (
    <div className="space-y-4 pb-24 text-slate-800">
      <div className="px-1">
        <h2 className="text-lg font-bold text-slate-900">Settings</h2>
        <p className="text-xs text-slate-500">Account, privacy and app preferences</p>
      </div>

      {/* Student Profile Card with Cartoon Avatar */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-red-500/20 bg-slate-100 border border-slate-200 shadow-xs shrink-0">
            <img
              src={CURRENT_STUDENT.avatarUrl}
              alt={CURRENT_STUDENT.fullName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-red-600 font-mono">
                {CURRENT_STUDENT.studentNumber}
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                Year {CURRENT_STUDENT.yearOfStudy}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {CURRENT_STUDENT.fullName}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              {CURRENT_STUDENT.major}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {settingItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className="w-full rounded-2xl bg-white border border-slate-200 p-3.5 text-left hover:bg-slate-50 transition"
            >
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
