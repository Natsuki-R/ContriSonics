"use client";

import type { Grid, GridCell } from "@/lib/types";
import { useHoverStore } from "@/lib/hoverStore";
import { useCallback } from "react";

type Props = {
  grid: Grid | null;
  onHoverNote?: (cell: GridCell) => void;
  activeCell?: GridCell | null;
};

export function Grid2D({ grid, onHoverNote, activeCell }: Props) {
  const setHovered = useHoverStore((s) => s.setHovered);
  const setCursor = useHoverStore((s) => s.setCursor);

  const handleFocus = useCallback(
    (cell: GridCell, element: HTMLButtonElement | null) => {
      if (!element) return;
      setHovered(cell);
      const rect = element.getBoundingClientRect();
      setCursor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      onHoverNote?.(cell);
    },
    [onHoverNote, setCursor, setHovered]
  );

  if (!grid) {
    return <div className="p-6 text-muted">No grid loaded yet.</div>;
  }

  return (
    <div
      className="grid gap-1 p-3"
      style={{
        gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
      }}
    >
      {grid.cells.map((cell) => {
        const isActive = cell.intensity > 0;
        const isCurrent =
          activeCell?.row === cell.row && activeCell?.col === cell.col;
        const classes = [
          "aspect-square rounded-sm border border-subtle transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]",
          isActive ? "border-strong" : null,
          isCurrent
            ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[var(--color-bg)] scale-110 shadow-[0_0_12px_rgba(52,211,153,0.45)]"
            : null,
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <button
            key={`${cell.row}-${cell.col}`}
            type="button"
            className={classes}
            style={{ backgroundColor: cell.colorHex || "#161b22" }}
            aria-label={`${cell.count} contributions on ${cell.date}`}
            data-active={isCurrent ? "true" : undefined}
            onMouseEnter={() => {
              if (isActive) setHovered(cell);
              onHoverNote?.(cell);
            }}
            onMouseLeave={() => setHovered(null)}
            onFocus={(e) => handleFocus(cell, e.currentTarget)}
            onBlur={() => setHovered(null)}
          />
        );
      })}
    </div>
  );
}
