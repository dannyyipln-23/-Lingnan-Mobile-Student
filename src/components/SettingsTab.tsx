import React from 'react';
import { Bell, CircleHelp, Globe, Lock, Type, UserRound } from 'lucide-react';
import { CURRENT_STUDENT } from '../data/mockData';
import { FontSizeOption, useAppPreferences } from '../context/AppPreferencesContext';

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

const fontSizeOptions: Array<{ id: FontSizeOption; label: string; sample: string }> = [
  { id: 'sm', label: 'S', sample: 'Small' },
  { id: 'md', label: 'M', sample: 'Default' },
  { id: 'lg', label: 'L', sample: 'Large' },
  { id: 'xl', label: 'XL', sample: 'Extra large' },
];

export const SettingsTab: React.FC = () => {
  const { fontSize, setFontSize } = useAppPreferences();

  return (
    <div className="space-y-4 pb-24 text-[var(--text-primary)]">
      <div className="px-1">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Settings</h2>
        <p className="text-xs text-[var(--text-muted)]">Account, privacy and app preferences</p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] shadow-xs ring-2 ring-[var(--brand)]/20">
            <img
              src={CURRENT_STUDENT.avatarUrl}
              alt={CURRENT_STUDENT.fullName}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-[var(--brand)]">
                {CURRENT_STUDENT.studentNumber}
              </span>
              <span className="rounded-md border border-[var(--brand-border)] bg-[var(--brand-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--brand)]">
                Year {CURRENT_STUDENT.yearOfStudy}
              </span>
            </div>
            <h3 className="mt-0.5 truncate text-sm font-bold text-[var(--text-primary)]">
              {CURRENT_STUDENT.fullName}
            </h3>
            <p className="truncate text-xs text-[var(--text-muted)]">{CURRENT_STUDENT.major}</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-sm">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)]">
            <Type className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">Display text size</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Applies across the app. Preview: The quick brown fox.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {fontSizeOptions.map((option) => {
            const selected = fontSize === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setFontSize(option.id)}
                className={`rounded-xl border px-2 py-2.5 text-center transition ${
                  selected
                    ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]'
                    : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)]'
                }`}
                aria-pressed={selected}
              >
                <p className="text-sm font-bold">{option.label}</p>
                <p className="mt-0.5 text-[10px] font-semibold">{option.sample}</p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="space-y-2.5">
        {settingItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 text-left transition hover:bg-[var(--surface-muted)]"
            >
              <div className="flex items-start space-x-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{item.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">{item.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
