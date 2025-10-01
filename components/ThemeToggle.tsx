"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";

type Option = {
  value: "light" | "dark" | "system";
  label: string;
  icon: ReactNode;
};

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 5.25a1 1 0 0 1-1-1V2.5a1 1 0 0 1 2 0v1.75a1 1 0 0 1-1 1Zm0 16.25a1 1 0 0 1-1 1v-1.75a1 1 0 1 1 2 0V22.5a1 1 0 0 1-1 1Zm10-9.5a1 1 0 0 1-1 1h-1.75a1 1 0 0 1 0-2H21a1 1 0 0 1 1 1ZM5.75 12a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h1.75a1 1 0 0 1 1 1Zm13.45 6.45a1 1 0 0 1 0 1.41l-1.24 1.25a1 1 0 0 1-1.42-1.41l1.25-1.25a1 1 0 0 1 1.41 0ZM7.46 6.54a1 1 0 0 1 0 1.41L6.22 9.2A1 1 0 0 1 4.8 7.78L6.05 6.53a1 1 0 0 1 1.41 0Zm11 1.24a1 1 0 0 1-1.42-1.41l1.25-1.25a1 1 0 1 1 1.41 1.41Zm-11 9.92a1 1 0 0 1 1.42 0l1.24 1.25a1 1 0 1 1-1.41 1.41L7.46 19.1a1 1 0 0 1 0-1.41ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M20.5 13.43A8.5 8.5 0 0 1 10.57 3.5a.5.5 0 0 0-.53-.68A8.5 8.5 0 1 0 21.18 14a.5.5 0 0 0-.68-.57Z"
      />
    </svg>
  );
}

function SystemIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9A2.5 2.5 0 0 1 17.5 17H6.5A2.5 2.5 0 0 1 4 14.5Zm2.5-1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1ZM5 19.5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"
      />
    </svg>
  );
}

function clsx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options: Option[] = useMemo(
    () => [
      { value: "light", label: "Light", icon: <SunIcon className="h-4 w-4" /> },
      { value: "dark", label: "Dark", icon: <MoonIcon className="h-4 w-4" /> },
      { value: "system", label: "System", icon: <SystemIcon className="h-4 w-4" /> },
    ],
    []
  );

  const activeValue = mounted ? theme ?? "system" : "system";

  return (
    <div
      className={clsx(
        "flex items-center gap-1 rounded-full border border-subtle bg-[var(--color-surface-elevated)] px-1 py-1 text-xs shadow-sm backdrop-blur",
        className
      )}
      role="group"
      aria-label="Toggle theme"
    >
      {options.map((option) => {
        const isActive = activeValue === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={clsx(
              "flex items-center gap-1 rounded-full px-2 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              "focus-visible:outline-[var(--color-focus-ring)]",
              isActive
                ? "bg-[var(--color-button-hover)] text-[var(--color-text)] shadow-sm"
                : "text-muted hover:bg-[var(--color-button)]"
            )}
            aria-pressed={isActive}
            aria-label={option.label}
            onClick={() => setTheme(option.value)}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ThemeToggle;
