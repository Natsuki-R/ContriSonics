import type { Grid, GridCell } from './types';

// Pentatonic scale (in semitones relative to root)
const PENTATONIC = [0, 2, 4, 7, 9];

export type MappingOptions = {
  keyRootHz?: number; // frequency of root (A4=440; default C4=261.63)
  scale?: number[];   // semitone offsets
  bpm?: number;       // beats per minute
};

export function mapGridToMusic(grid: Grid, opts: MappingOptions = {}): Grid {
  const keyRootHz = opts.keyRootHz ?? 261.63; // C4
  const scale = opts.scale ?? PENTATONIC;
  const bpm = opts.bpm ?? 90;

  // Each column = one bar at 4/4; each row = step within bar, but we keep it simple:
  // We'll map day(row) → degree index and intensity → velocity + octave bump.
  const cells = grid.cells.map((cell) => {
    const degree = (cell.row % scale.length);
    const semis = scale[degree] + (cell.intensity >= 4 ? 12 : 0);
    const noteIndex = semis;
    const velocity = Math.max(0.2, Math.min(1, cell.intensity / 4 + 0.2));
    const duration = 0.25 * (60 / bpm); // 16th note

    return { ...cell, noteIndex, velocity, duration };
  });

  return { ...grid, cells };
}

// Convert semitones (relative to C4 by default in Audio) to frequency
export function semitoneToFreq(baseHz: number, semis: number): number {
  return baseHz * Math.pow(2, semis / 12);
}
