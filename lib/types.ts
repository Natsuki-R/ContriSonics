export type GridCell = {
  date: string; // ISO date
  count: number; // contributionCount
  colorHex: string; // hex color
  intensity: 0 | 1 | 2 | 3 | 4; // bucket
  row: number; // 0..6 (Sun..Sat)
  col: number; // 0..N-1 (earliest..latest)
  noteIndex: number; // computed
  velocity: number; // 0..1
  duration: number; // seconds
};

export type Grid = {
  rows: number; // 7
  cols: number;
  cells: GridCell[]; // length = rows * cols
};
