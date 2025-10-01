"use client";

import Uploader from "@/components/Uploader";
import type { Grid } from "@/lib/types";
import type { ExperienceTab } from "./useContributionExperience";

type Props = {
  tab: ExperienceTab;
  onTabChange: (tab: ExperienceTab) => void;
  username: string;
  onUsernameChange: (value: string) => void;
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onLoadGithub: () => void | Promise<void>;
  loading: boolean;
  error: string | null;
  onUpload: (grid: Grid) => void;
  variant?: "default" | "touch";
};

export function ContributionControls({
  tab,
  onTabChange,
  username,
  onUsernameChange,
  from,
  to,
  onFromChange,
  onToChange,
  onLoadGithub,
  loading,
  error,
  onUpload,
  variant = "default",
}: Props) {
  const isTouch = variant === "touch";
  const tabButtonBase = isTouch
    ? "px-4 py-2 text-base font-medium"
    : "px-3 py-1 text-sm font-medium sm:text-base";
  const tabActiveClass =
    "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-sm";
  const tabIdleClass = isTouch
    ? "btn-muted hover:bg-[var(--color-button-hover)]"
    : "btn-muted hover:bg-[var(--color-button-hover)]";
  const sectionPadding = isTouch ? "p-4" : "p-3";
  const labelClass = isTouch ? "text-sm font-medium" : "text-xs text-muted";
  const inputClass = isTouch
    ? "w-full rounded-md border border-subtle bg-[var(--color-surface)] px-3 py-3 text-base text-[var(--color-text)] shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
    : "w-full rounded-md border border-subtle bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]";
  const loadButtonClass = isTouch
    ? "px-4 py-3 text-base font-medium"
    : "px-3 py-2 text-sm font-medium";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          className={`${tabButtonBase} rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] ${
            tab === "github" ? tabActiveClass : tabIdleClass
          }`}
          onClick={() => onTabChange("github")}
        >
          GitHub
        </button>
        <button
          type="button"
          className={`${tabButtonBase} rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] ${
            tab === "upload" ? tabActiveClass : tabIdleClass
          }`}
          onClick={() => onTabChange("upload")}
        >
          Upload
        </button>
      </div>

      {tab === "github" && (
        <section
          className={`flex flex-col gap-3 rounded-md border border-subtle surface-elevated ${sectionPadding}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className={labelClass}>GitHub username</label>
              <input
                className={inputClass}
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="octocat"
              />
            </div>
            <div>
              <label className={labelClass}>From</label>
              <input
                type="date"
                className={inputClass}
                value={from}
                onChange={(e) => onFromChange(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>To</label>
              <input
                type="date"
                className={inputClass}
                value={to}
                onChange={(e) => onToChange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              className={`${loadButtonClass} rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] disabled:opacity-60`}
              onClick={onLoadGithub}
              disabled={loading}
            >
              {loading ? "Loading…" : "Load contributions"}
            </button>
            {error && (
              <span className={`text-rose-400 ${isTouch ? "text-base" : "text-sm"}`}>
                {error}
              </span>
            )}
          </div>
        </section>
      )}

      {tab === "upload" && (
        <Uploader
          onGridLoaded={(grid) => {
            onUpload(grid);
          }}
        />
      )}
    </div>
  );
}
