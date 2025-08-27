// lib/contrib.ts
import type { Grid, GridCell } from "./types";

export type FetchParams = {
  username: string;
  from: string; // ISO
  to: string; // ISO
};

export async function fetchContributionGrid(
  params: FetchParams
): Promise<Grid> {
  const res = await fetch("/api/github", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  // Parse once
  let payload: any = null;
  try {
    payload = await res.json();
  } catch (e) {
    throw new Error("Bad response from server (not JSON).");
  }

  if (!res.ok) {
    const msg = payload?.error ?? "Failed to fetch contributions";
    throw new Error(msg);
  }

  const data = payload as {
    weeks: { days: { date: string; color: string; count: number }[] }[];
  };
  const weeks = data.weeks || [];
  const cols = weeks.length;
  const rows = 7;
  const cells: GridCell[] = [];
  const allCounts: number[] = [];

  weeks.forEach((w, col) => {
    w.days.forEach((d, row) => {
      allCounts.push(d.count);
      cells.push({
        date: d.date,
        count: d.count,
        color: d.color,
        intensity: 0,
        row,
        col,
        noteIndex: 0,
        velocity: 0.5,
        duration: 0.25,
      });
    });
  });

  // Quantile buckets 0..4
  const sorted = [...allCounts].sort((a, b) => a - b);
  const q = (p: number) => sorted[Math.floor(p * (sorted.length - 1))] ?? 0;
  const q1 = q(0.2),
    q2 = q(0.4),
    q3 = q(0.6),
    q4 = q(0.8);

  for (const c of cells) {
    let bucket = 0;
    if (c.count <= 0) bucket = 0;
    else if (c.count <= q1) bucket = 1;
    else if (c.count <= q2) bucket = 2;
    else if (c.count <= q3) bucket = 3;
    else bucket = 4;
    c.intensity = bucket;
  }

  return { rows, cols, cells };
}
