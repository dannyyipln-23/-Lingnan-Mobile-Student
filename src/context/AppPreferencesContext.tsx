import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_HOME_TRANSPORT_ROUTES,
  HOME_TRANSPORT_OPTIONS,
  HomeTransportRouteId,
} from '../lib/homeTransport';

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
    label: 'Services',
    description: 'Open Student Life & Services hub',
  },
  {
    id: 'wayfinding',
    label: 'Wayfinding',
    description: 'Open campus map in system browser',
  },
  {
    id: 'moodle-assignments',
    label: 'Moodle Assignments',
    description: 'Open assignment area from LMS',
  },
  {
    id: 'exam-timetable',
    label: 'Exam Timetable',
    description: 'Jump to exam related functions via Academic',
  },
  {
    id: 'graduation-progress',
    label: 'Graduation Progress',
    description: 'Jump to degree and graduation functions',
  },
];

export {
  HOME_TRANSPORT_OPTIONS,
  DEFAULT_HOME_TRANSPORT_ROUTES,
  type HomeTransportRouteId,
} from '../lib/homeTransport';

type AppPreferencesContextValue = {
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  homeShortcuts: HomeShortcutId[];
  setHomeShortcuts: (items: HomeShortcutId[]) => void;
  homeTransportRoutes: HomeTransportRouteId[];
  setHomeTransportRoutes: (items: HomeTransportRouteId[]) => void;
  /** Opens university / external URLs in the system browser (not an iframe). */
  openInAppBrowser: (url: string, title?: string) => void;
};

const STORAGE_KEY = 'lu-mobile-font-size';
const HOME_SHORTCUTS_STORAGE_KEY = 'lu-mobile-home-shortcuts';
const HOME_TRANSPORT_STORAGE_KEY = 'lu-mobile-home-transport-routes';
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

const readStoredHomeTransportRoutes = (): HomeTransportRouteId[] => {
  try {
    const raw = localStorage.getItem(HOME_TRANSPORT_STORAGE_KEY);
    if (!raw) return DEFAULT_HOME_TRANSPORT_ROUTES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_HOME_TRANSPORT_ROUTES;

    const valid = parsed.filter((item): item is HomeTransportRouteId =>
      HOME_TRANSPORT_OPTIONS.some((option) => option.id === item),
    );

    if (valid.length === 0) return DEFAULT_HOME_TRANSPORT_ROUTES;
    return valid.slice(0, 4);
  } catch {
    return DEFAULT_HOME_TRANSPORT_ROUTES;
  }
};

export const AppPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSizeOption>(() => readStoredFontSize());
  const [homeShortcuts, setHomeShortcutsState] = useState<HomeShortcutId[]>(() =>
    readStoredHomeShortcuts(),
  );
  const [homeTransportRoutes, setHomeTransportRoutesState] = useState<HomeTransportRouteId[]>(() =>
    readStoredHomeTransportRoutes(),
  );

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

  useEffect(() => {
    try {
      localStorage.setItem(HOME_TRANSPORT_STORAGE_KEY, JSON.stringify(homeTransportRoutes));
    } catch {
      /* ignore */
    }
  }, [homeTransportRoutes]);

  const setFontSize = useCallback((size: FontSizeOption) => {
    setFontSizeState(size);
  }, []);

  const setHomeShortcuts = useCallback((items: HomeShortcutId[]) => {
    const unique = Array.from(new Set(items)).filter((item): item is HomeShortcutId =>
      HOME_SHORTCUT_OPTIONS.some((option) => option.id === item),
    );
    setHomeShortcutsState(unique.slice(0, 6));
  }, []);

  const setHomeTransportRoutes = useCallback((items: HomeTransportRouteId[]) => {
    const unique = Array.from(new Set(items)).filter((item): item is HomeTransportRouteId =>
      HOME_TRANSPORT_OPTIONS.some((option) => option.id === item),
    );
    // Keep at least one route so Home always has a transport preview.
    setHomeTransportRoutesState(
      unique.length > 0 ? unique.slice(0, 4) : DEFAULT_HOME_TRANSPORT_ROUTES,
    );
  }, []);

  const openInAppBrowser = useCallback((url: string, _title?: string) => {
    // ADFS / campus SSO pages block iframe embedding; always use the system browser.
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const value = useMemo(
    () => ({
      fontSize,
      setFontSize,
      homeShortcuts,
      setHomeShortcuts,
      homeTransportRoutes,
      setHomeTransportRoutes,
      openInAppBrowser,
    }),
    [
      fontSize,
      setFontSize,
      homeShortcuts,
      setHomeShortcuts,
      homeTransportRoutes,
      setHomeTransportRoutes,
      openInAppBrowser,
    ],
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
