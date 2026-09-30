import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type FontSizeOption = 'sm' | 'md' | 'lg' | 'xl';
export type HomeShortcutId =
  | 'calendar'
  | 'book-seat'
  | 'campus-apps'
  | 'wayfinding'
  | 'moodle-assignments'
  | 'exam-timetable'
  | 'graduation-progress';

export const HOME_SHORTCUT_OPTIONS: Array<{
  id: HomeShortcutId;
  label: string;
  description: string;
}> = [
  {
    id: 'calendar',
    label: 'Calendar',
    description: 'Open your course calendar page',
  },
  {
    id: 'book-seat',
    label: 'Book Seat',
    description: 'Open library seat booking modal',
  },
  {
    id: 'campus-apps',
    label: 'Campus Apps',
    description: 'Open Campus functions hub',
  },
  {
    id: 'wayfinding',
    label: 'Wayfinding',
    description: 'Open campus map in in-app browser',
  },
  {
    id: 'moodle-assignments',
    label: 'Moodle Assignments',
    description: 'Open assignment area from LMS',
  },
  {
    id: 'exam-timetable',
    label: 'Exam Timetable',
    description: 'Jump to exam related functions via Campus',
  },
  {
    id: 'graduation-progress',
    label: 'Graduation Progress',
    description: 'Jump to degree and graduation functions',
  },
];

type InAppBrowserState = {
  url: string;
  title: string;
} | null;

type AppPreferencesContextValue = {
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  homeShortcuts: HomeShortcutId[];
  setHomeShortcuts: (items: HomeShortcutId[]) => void;
  inAppBrowser: InAppBrowserState;
  openInAppBrowser: (url: string, title?: string) => void;
  closeInAppBrowser: () => void;
};

const STORAGE_KEY = 'lu-mobile-font-size';
const HOME_SHORTCUTS_STORAGE_KEY = 'lu-mobile-home-shortcuts';
const DEFAULT_HOME_SHORTCUTS: HomeShortcutId[] = ['calendar', 'book-seat', 'campus-apps'];

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

const readStoredFontSize = (): FontSizeOption => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'sm' || value === 'md' || value === 'lg' || value === 'xl') {
      return value;
    }
  } catch {
    /* ignore */
  }
  return 'md';
};

const readStoredHomeShortcuts = (): HomeShortcutId[] => {
  try {
    const raw = localStorage.getItem(HOME_SHORTCUTS_STORAGE_KEY);
    if (!raw) return DEFAULT_HOME_SHORTCUTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_HOME_SHORTCUTS;

    const valid = parsed.filter((item): item is HomeShortcutId =>
      HOME_SHORTCUT_OPTIONS.some((option) => option.id === item),
    );

    if (valid.length === 0) return DEFAULT_HOME_SHORTCUTS;
    return valid.slice(0, 6);
  } catch {
    return DEFAULT_HOME_SHORTCUTS;
  }
};

export const AppPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSizeOption>(() => readStoredFontSize());
  const [homeShortcuts, setHomeShortcutsState] = useState<HomeShortcutId[]>(() => readStoredHomeShortcuts());
  const [inAppBrowser, setInAppBrowser] = useState<InAppBrowserState>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    try {
      localStorage.setItem(STORAGE_KEY, fontSize);
    } catch {
      /* ignore */
    }
  }, [fontSize]);

  useEffect(() => {
    try {
      localStorage.setItem(HOME_SHORTCUTS_STORAGE_KEY, JSON.stringify(homeShortcuts));
    } catch {
      /* ignore */
    }
  }, [homeShortcuts]);

  const setFontSize = useCallback((size: FontSizeOption) => {
    setFontSizeState(size);
  }, []);

  const setHomeShortcuts = useCallback((items: HomeShortcutId[]) => {
    const unique = Array.from(new Set(items)).filter((item): item is HomeShortcutId =>
      HOME_SHORTCUT_OPTIONS.some((option) => option.id === item),
    );
    setHomeShortcutsState(unique.slice(0, 6));
  }, []);

  const openInAppBrowser = useCallback((url: string, title = 'External site') => {
    setInAppBrowser({ url, title });
  }, []);

  const closeInAppBrowser = useCallback(() => {
    setInAppBrowser(null);
  }, []);

  const value = useMemo(
    () => ({
      fontSize,
      setFontSize,
      homeShortcuts,
      setHomeShortcuts,
      inAppBrowser,
      openInAppBrowser,
      closeInAppBrowser,
    }),
    [fontSize, setFontSize, homeShortcuts, setHomeShortcuts, inAppBrowser, openInAppBrowser, closeInAppBrowser],
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
};

export const useAppPreferences = () => {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) {
    throw new Error('useAppPreferences must be used within AppPreferencesProvider');
  }
  return ctx;
};
