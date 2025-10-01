'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  themes: Theme[];
};

type ThemeProviderProps = {
  attribute?: 'class' | 'data-theme' | string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  storageKey?: string;
  disableTransitionOnChange?: boolean;
  children: React.ReactNode;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const DEFAULT_STORAGE_KEY = 'contrisonics-theme';
const DEFAULT_THEME: Theme = 'system';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme, systemTheme: ResolvedTheme): ResolvedTheme {
  if (theme === 'system') return systemTheme;
  return theme;
}

function applyTheme(attribute: string, resolvedTheme: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (attribute === 'class') {
    root.classList.remove('dark');
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    }
  } else {
    root.setAttribute(attribute, resolvedTheme);
  }
}

export function ThemeProvider({
  attribute = 'class',
  defaultTheme = DEFAULT_THEME,
  enableSystem = true,
  storageKey = DEFAULT_STORAGE_KEY,
  children,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(defaultTheme, getSystemTheme())
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) {
      setThemeState(stored);
    } else {
      setThemeState(defaultTheme);
    }
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handle = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    setSystemTheme(mql.matches ? 'dark' : 'light');

    if (enableSystem) {
      mql.addEventListener('change', handle);
    }

    return () => {
      if (enableSystem) {
        mql.removeEventListener('change', handle);
      }
    };
  }, [enableSystem]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nextResolved = resolveTheme(theme, systemTheme);
    setResolvedTheme(nextResolved);
    applyTheme(attribute, nextResolved);
  }, [attribute, systemTheme, theme]);

  const setTheme = useCallback(
    (value: Theme) => {
      setThemeState(value);
      if (typeof window !== 'undefined') {
        try {
          if (value === 'system') {
            localStorage.removeItem(storageKey);
          } else {
            localStorage.setItem(storageKey, value);
          }
        } catch (err) {
          console.warn('Unable to persist theme', err);
        }
      }
    },
    [storageKey]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      systemTheme,
      resolvedTheme,
      themes: enableSystem ? (['light', 'dark', 'system'] as Theme[]) : (['light', 'dark'] as Theme[]),
    }),
    [enableSystem, resolvedTheme, setTheme, systemTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

export type { ThemeContextValue as UseThemeContext, ThemeProviderProps };
