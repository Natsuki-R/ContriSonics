"use client";

import Uploader from "@/components/Uploader";
import type { Grid } from "@/lib/types";
import type { ExperienceTab } from "./useContributionExperience";

type Props = {
  tab: ExperienceTab;
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
  const labelClass = "text-xs text-muted";
  const inputClass =
    "w-full rounded-md border border-subtle bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]";

  if (tab === "upload") {
    return <Uploader onGridLoaded={(grid) => onUpload(grid)} />;
  }

  return (
    <section className="flex flex-col gap-3 rounded-md border border-subtle surface-elevated p-3">
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
          className="px-3 py-2 text-sm font-medium rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] disabled:opacity-60"
          onClick={onLoadGithub}
          disabled={loading}
        >
          {loading ? "Loading\u2026" : "Load contributions"}
        </button>
        {error && <span className="text-rose-400 text-sm">{error}</span>}
      </div>
    </section>
  );
}
