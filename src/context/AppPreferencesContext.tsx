import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type FontSizeOption = 'sm' | 'md' | 'lg' | 'xl';

type InAppBrowserState = {
  url: string;
  title: string;
} | null;

type AppPreferencesContextValue = {
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  inAppBrowser: InAppBrowserState;
  openInAppBrowser: (url: string, title?: string) => void;
  closeInAppBrowser: () => void;
};

const STORAGE_KEY = 'lu-mobile-font-size';

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

export const AppPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSizeOption>(() => readStoredFontSize());
  const [inAppBrowser, setInAppBrowser] = useState<InAppBrowserState>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    try {
      localStorage.setItem(STORAGE_KEY, fontSize);
    } catch {
      /* ignore */
    }
  }, [fontSize]);

  const setFontSize = useCallback((size: FontSizeOption) => {
    setFontSizeState(size);
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
      inAppBrowser,
      openInAppBrowser,
      closeInAppBrowser,
    }),
    [fontSize, setFontSize, inAppBrowser, openInAppBrowser, closeInAppBrowser],
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
