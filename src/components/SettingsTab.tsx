import React, { useMemo, useState } from 'react';
import {
  Bell,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Globe,
  GraduationCap,
  LayoutGrid,
  Library,
  Lock,
  Map,
  Notebook,
  Type,
  UserRound,
} from 'lucide-react';
import { CURRENT_STUDENT } from '../data/mockData';
import {
  FontSizeOption,
  HOME_SHORTCUT_OPTIONS,
  HomeShortcutId,
  useAppPreferences,
} from '../context/AppPreferencesContext';

const settingItems = [
  {
    id: 'profile',
    title: 'Profile & Account',
    desc: 'Update contact and student profile settings',
    icon: UserRound,
    enabled: false,
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    desc: 'Password, session and security preferences',
    icon: Lock,
    enabled: false,
  },
  {
    id: 'notification',
    title: 'Notifications',
    desc: 'Manage academic and campus push alerts',
    icon: Bell,
    enabled: false,
  },
  {
    id: 'language',
    title: 'Language & Region',
    desc: 'Display language and locale format options',
    icon: Globe,
    enabled: false,
  },
  {
    id: 'help',
    title: 'Help & Support',
    desc: 'Support center and FAQ resources',
    icon: CircleHelp,
    enabled: false,
  },
];

const fontSizeOptions: Array<{ id: FontSizeOption; label: string; sample: string }> = [
  { id: 'sm', label: 'S', sample: 'Small' },
  { id: 'md', label: 'M', sample: 'Default' },
  { id: 'lg', label: 'L', sample: 'Large' },
  { id: 'xl', label: 'XL', sample: 'Extra large' },
];

export const SettingsTab: React.FC = () => {
  const { fontSize, setFontSize, homeShortcuts, setHomeShortcuts } = useAppPreferences();
  const [settingsPage, setSettingsPage] = useState<'main' | 'shortcuts'>('main');

  const shortcutIconMap = useMemo<Record<HomeShortcutId, React.ComponentType<{ className?: string }>>>(
    () => ({
      calendar: Calendar,
      'book-seat': Library,
      'campus-apps': LayoutGrid,
      wayfinding: Map,
      'moodle-assignments': Notebook,
      'exam-timetable': Bell,
      'graduation-progress': GraduationCap,
    }),
    [],
  );

  const toggleShortcut = (shortcutId: HomeShortcutId) => {
    if (homeShortcuts.includes(shortcutId)) {
      if (homeShortcuts.length <= 1) return;
      setHomeShortcuts(homeShortcuts.filter((item) => item !== shortcutId));
      return;
    }

    if (homeShortcuts.length >= 6) return;
    setHomeShortcuts([...homeShortcuts, shortcutId]);
  };

  if (settingsPage === 'shortcuts') {
    return (
      <div className="page-shell page-shell--settings space-y-4">
        <div className="px-1">
          <button
            type="button"
            onClick={() => setSettingsPage('main')}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Settings
          </button>
          <h2 className="mt-2 text-lg font-bold text-[var(--text-primary)]">Home Shortcuts</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Choose 1 to 6 shortcuts from campus functions and core app actions.
          </p>
        </div>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">
              Selected: {homeShortcuts.length} / 6
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              At least 1 shortcut required
            </p>
          </div>

          <div className="space-y-2">
            {HOME_SHORTCUT_OPTIONS.map((option) => {
              const Icon = shortcutIconMap[option.id];
              const selected = homeShortcuts.includes(option.id);

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleShortcut(option.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                    selected
                      ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                      : 'border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{option.label}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{option.description}</p>
                      </div>
                    </div>
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        selected
                          ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                          : 'border-[var(--border)] bg-[var(--surface)] text-transparent'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell page-shell--settings space-y-4">
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

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-sm">
        <button
          type="button"
          onClick={() => setSettingsPage('shortcuts')}
          className="w-full text-left"
        >
          <div className="flex items-center justify-between">
            <div className="inline-flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">Home shortcut preferences</p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Select which campus and app functions appear in Student Shortcuts.
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
          </div>
        </button>
      </section>

      <div className="space-y-2.5">
        {settingItems.map((item) => {
          const Icon = item.icon;
          const isDisabled = !item.enabled;
          return (
            <button
              key={item.id}
              type="button"
              disabled={isDisabled}
              className={`w-full rounded-2xl border border-[var(--border)] p-3.5 text-left transition ${
                isDisabled
                  ? 'bg-[var(--surface)] opacity-60 cursor-not-allowed'
                  : 'bg-[var(--surface)] hover:bg-[var(--surface-muted)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)]">{item.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">{item.desc}</p>
                </div>
                {isDisabled && <Lock className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
