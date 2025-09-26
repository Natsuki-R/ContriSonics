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
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          className={`px-3 py-1 rounded ${
            tab === "github"
              ? "bg-blue-600"
              : "bg-neutral-800 hover:bg-neutral-700"
          }`}
          onClick={() => onTabChange("github")}
        >
          GitHub
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded ${
            tab === "upload"
              ? "bg-blue-600"
              : "bg-neutral-800 hover:bg-neutral-700"
          }`}
          onClick={() => onTabChange("upload")}
        >
          Upload
        </button>
      </div>

      {tab === "github" && (
        <section className="flex flex-col gap-3 p-3 border border-neutral-800 rounded-md">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="text-xs opacity-70">GitHub username</label>
              <input
                className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="octocat"
              />
            </div>
            <div>
              <label className="text-xs opacity-70">From</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
                value={from}
                onChange={(e) => onFromChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs opacity-70">To</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
                value={to}
                onChange={(e) => onToChange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
              onClick={onLoadGithub}
              disabled={loading}
            >
              {loading ? "Loading…" : "Load contributions"}
            </button>
            {error && <span className="text-red-400 text-sm">{error}</span>}
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
