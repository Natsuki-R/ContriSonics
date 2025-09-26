"use client";

import type { Grid, GridCell } from "@/lib/types";
import { useHoverStore } from "@/lib/hoverStore";
import { useCallback } from "react";

type Props = {
  grid: Grid | null;
  onHoverNote?: (cell: GridCell) => void;
};

export function Grid2D({ grid, onHoverNote }: Props) {
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
    return <div className="p-6 opacity-70">No grid loaded yet.</div>;
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
        return (
          <button
            key={`${cell.row}-${cell.col}`}
            type="button"
            className={`aspect-square rounded-sm border ${
              isActive ? "border-neutral-700" : "border-neutral-900"
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            style={{ backgroundColor: cell.colorHex || "#161b22" }}
            aria-label={`${cell.count} contributions on ${cell.date}`}
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
