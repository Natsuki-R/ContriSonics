"use client";

import type { ExperienceTab } from "@/components/experience/useContributionExperience";
import type { ViewMode } from "@/components/ViewToggle";

type Props = {
  sourceTab: ExperienceTab;
  onSourceTabChange: (tab: ExperienceTab) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

type Segment = {
  key: string;
  label: string;
  active: boolean;
  onClick: () => void;
};

export function ModeBar({
  sourceTab,
  onSourceTabChange,
  viewMode,
  onViewModeChange,
}: Props) {
  const segments: [Segment[], Segment[]] = [
    [
      { key: "github", label: "GitHub", active: sourceTab === "github", onClick: () => onSourceTabChange("github") },
      { key: "upload", label: "Upload", active: sourceTab === "upload", onClick: () => onSourceTabChange("upload") },
    ],
    [
      { key: "3d", label: "3D", active: viewMode === "3d", onClick: () => onViewModeChange("3d") },
      { key: "2d", label: "2D", active: viewMode === "2d", onClick: () => onViewModeChange("2d") },
    ],
  ];

  const btnBase =
    "px-4 py-1.5 text-sm font-semibold tracking-wide transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]";
  const btnActive = "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-md";
  const btnIdle = "text-muted hover:text-[var(--color-text)] hover:bg-[var(--color-button-hover)]";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {segments.map((group, gi) => (
        <div
          key={gi}
          className="inline-flex items-center rounded-full border border-strong p-0.5 shadow-sm"
          role="radiogroup"
          aria-label={gi === 0 ? "Data source" : "View mode"}
        >
          {group.map((seg, i) => (
            <button
              key={seg.key}
              type="button"
              role="radio"
              aria-checked={seg.active}
              onClick={seg.onClick}
              className={`${btnBase} ${seg.active ? btnActive : btnIdle} ${
                i === 0 ? "rounded-l-full" : ""
              } ${i === group.length - 1 ? "rounded-r-full" : ""}`}
            >
              {seg.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
