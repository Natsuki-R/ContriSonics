'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';

type ThemeOption = {
  id: 'light' | 'dark' | 'system';
  label: string;
  icon: React.ReactNode;
};

const SunIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M3 12h2M19 12h2M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a6 6 0 1 0 10.5 10.5Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SystemIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </svg>
);

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = useMemo<ThemeOption[]>(
    () => [
      { id: 'light', label: 'Light', icon: <SunIcon /> },
      { id: 'dark', label: 'Dark', icon: <MoonIcon /> },
      { id: 'system', label: 'System', icon: <SystemIcon /> },
    ],
    []
  );

  const active = mounted ? theme ?? 'system' : 'system';

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex items-center gap-1 rounded-md border border-[color:var(--color-border)] bg-[var(--color-card)] p-1 shadow-sm"
    >
      {options.map((opt) => {
        const isActive = active === opt.id;
        const title =
          opt.id === 'system' && mounted
            ? `System (${resolvedTheme ?? 'light'})`
            : opt.label;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors focus-ring focus-visible:outline-none ${
              isActive
                ? 'border border-transparent bg-[var(--color-button-bg)] text-[color:var(--color-button-text)] shadow-sm'
                : 'border border-transparent text-[color:var(--color-muted)] hover:bg-[var(--color-card-strong)] hover:text-[color:var(--color-text)]'
            }`}
            aria-pressed={isActive}
            aria-label={`${opt.label} theme`}
            title={title}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
