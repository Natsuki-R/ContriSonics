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
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`focus-ring rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "github"
              ? "bg-[var(--color-primary)] text-[color:var(--color-primary-foreground)]"
              : "border border-[color:var(--color-border)] bg-[var(--color-card)] text-[color:var(--color-text)] hover:bg-[var(--color-card-strong)]"
          }`}
          onClick={() => onTabChange("github")}
        >
          GitHub
        </button>
        <button
          type="button"
          className={`focus-ring rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "upload"
              ? "bg-[var(--color-primary)] text-[color:var(--color-primary-foreground)]"
              : "border border-[color:var(--color-border)] bg-[var(--color-card)] text-[color:var(--color-text)] hover:bg-[var(--color-card-strong)]"
          }`}
          onClick={() => onTabChange("upload")}
        >
          Upload
        </button>
      </div>

      {tab === "github" && (
        <section className="flex flex-col gap-3 rounded-lg border border-[color:var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="text-xs uppercase tracking-wide text-[color:var(--color-muted)]">GitHub username</label>
              <input
                className="focus-ring mt-1 w-full rounded-md border border-[color:var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-[color:var(--color-text)] shadow-sm"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="octocat"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-[color:var(--color-muted)]">From</label>
              <input
                type="date"
                className="focus-ring mt-1 w-full rounded-md border border-[color:var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-[color:var(--color-text)] shadow-sm"
                value={from}
                onChange={(e) => onFromChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-[color:var(--color-muted)]">To</label>
              <input
                type="date"
                className="focus-ring mt-1 w-full rounded-md border border-[color:var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-[color:var(--color-text)] shadow-sm"
                value={to}
                onChange={(e) => onToChange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              className="focus-ring rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-[color:var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
              onClick={onLoadGithub}
              disabled={loading}
            >
              {loading ? "Loading…" : "Load contributions"}
            </button>
            {error && <span className="text-sm text-red-500 dark:text-red-300">{error}</span>}
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
