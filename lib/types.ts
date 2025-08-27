export type GridCell = {
  date: string; // ISO date
  count: number; // contributionCount
  color: string; // hex
  intensity: number; // 0..4
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
