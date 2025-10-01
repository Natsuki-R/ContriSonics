"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "contrisonics-theme";
const themes: Theme[] = ["light", "dark", "system"];

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function isValidTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function applyThemeClass(theme: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  try {
    root.style.colorScheme = theme;
  } catch (error) {
    /* noop */
  }
}

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = isValidTheme(raw) ? raw : null;
      if (stored) {
        setThemeState(stored);
      } else {
        setThemeState(defaultTheme);
      }
    } catch (error) {
      setThemeState(defaultTheme);
    }
  }, [defaultTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = (event: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };
    updateSystemTheme(mql);

    if ("addEventListener" in mql) {
      const listener = updateSystemTheme as (event: MediaQueryListEvent) => void;
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    }

    const legacyListener = updateSystemTheme as (event: MediaQueryList | MediaQueryListEvent) => void;
    mql.addListener(legacyListener);
    return () => mql.removeListener(legacyListener);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (theme === "system") {
        localStorage.setItem(STORAGE_KEY, "system");
      } else {
        localStorage.setItem(STORAGE_KEY, theme);
      }
    } catch (error) {
      // ignored
    }
  }, [theme]);

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, systemTheme, setTheme }),
    [theme, resolvedTheme, systemTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return {
    theme: context.theme,
    resolvedTheme: context.resolvedTheme,
    systemTheme: context.systemTheme,
    setTheme: context.setTheme,
    themes,
  };
}

export { themes };
