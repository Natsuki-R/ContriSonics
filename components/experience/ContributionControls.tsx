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
    ? "px-4 py-2 text-base"
    : "px-3 py-1 text-sm sm:text-base";
  const tabActiveClass = "bg-blue-600";
  const tabIdleClass = isTouch
    ? "bg-neutral-800 hover:bg-neutral-700"
    : "bg-neutral-800 hover:bg-neutral-700";
  const sectionPadding = isTouch ? "p-4" : "p-3";
  const labelClass = isTouch ? "text-sm font-medium" : "text-xs opacity-70";
  const inputClass = isTouch
    ? "w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-3 text-base"
    : "w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2";
  const loadButtonClass = isTouch
    ? "px-4 py-3 text-base"
    : "px-3 py-2";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          className={`${tabButtonBase} rounded ${
            tab === "github" ? tabActiveClass : tabIdleClass
          }`}
          onClick={() => onTabChange("github")}
        >
          GitHub
        </button>
        <button
          type="button"
          className={`${tabButtonBase} rounded ${
            tab === "upload" ? tabActiveClass : tabIdleClass
          }`}
          onClick={() => onTabChange("upload")}
        >
          Upload
        </button>
      </div>

      {tab === "github" && (
        <section
          className={`flex flex-col gap-3 border border-neutral-800 rounded-md ${sectionPadding}`}
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
              className={`${loadButtonClass} rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-60`}
              onClick={onLoadGithub}
              disabled={loading}
            >
              {loading ? "Loading…" : "Load contributions"}
            </button>
            {error && (
              <span className={`text-red-400 ${isTouch ? "text-base" : "text-sm"}`}>
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
