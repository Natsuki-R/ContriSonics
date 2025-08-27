import { semitoneToFreq } from './mapping';
import type { Grid } from './types';

export type Instrument = 'piano' | 'ep' | 'pad';

type ScheduledNote = {
  time: number;    // when to start (AudioContext time)
  freq: number;
  duration: number;
  velocity: number;
  col: number;     // to allow column-based grouping if needed
};

export class AudioEngine {
  ctx: AudioContext;
  master: GainNode;
  reverb: ConvolverNode | null = null;
  playing = false;
  lookahead = 0.1;       // seconds
  scheduleInterval = 0;  // ms
  currentCol = 0;
  startTime = 0;
  startAtPos = 0;        // seconds
  bpm = 90;
  baseHz = 261.63;       // C4
  instrument: Instrument = 'piano';
  scheduled: ScheduledNote[] = [];
  timer: number | null = null;
  grid: Grid | null = null;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(this.ctx.destination);
  }

  setBpm(bpm: number) { this.bpm = bpm; }
  setInstrument(i: Instrument) { this.instrument = i; }
  setBaseHz(hz: number) { this.baseHz = hz; }

  attachGrid(grid: Grid) {
    this.grid = grid;
    this.scheduled = [];
    this.currentCol = 0;
  }

  private columnDurationSec(): number {
    // 1 bar of 4 quarter notes at current BPM
    return (60 / this.bpm) * 4;
  }

  // Simple synths
  private playVoice(time: number, freq: number, duration: number, velocity: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (this.instrument) {
      case 'ep':
        osc.type = 'sine';
        break;
      case 'pad':
        osc.type = 'sawtooth';
        break;
      default:
        osc.type = 'triangle';
        break;
    }

    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.001 + velocity * 0.3, time + 0.01);
    gain.gain.linearRampToValueAtTime((0.001 + velocity * 0.3) * 0.6, time + 0.1);
    gain.gain.setTargetAtTime(0.0001, time + duration, 0.2);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(time);
    osc.stop(time + duration + 0.5);
  }

  preview(freq: number, velocity = 0.8, duration = 0.25) {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const t = this.ctx.currentTime + 0.01;
    this.playVoice(t, freq, duration, velocity);
  }

  // Prepare schedule from grid
  prepareScheduleFromGrid() {
    if (!this.grid) return;
    const notes: ScheduledNote[] = [];

    const colDur = this.columnDurationSec();
    const base = this.baseHz;

    for (const cell of this.grid.cells) {
      if (cell.intensity <= 0) continue; // rests
      const when = cell.col * colDur + (cell.row / 7) * colDur; // spread within bar
      const freq = semitoneToFreq(base, cell.noteIndex);
      notes.push({
        time: when,
        freq,
        duration: Math.max(0.12, cell.duration),
        velocity: cell.velocity,
        col: cell.col,
      });
    }
    this.scheduled = notes.sort((a, b) => a.time - b.time);
  }

  play() {
    if (!this.grid) return;
    if (!this.scheduled.length) this.prepareScheduleFromGrid();

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.playing = true;
    this.startTime = this.ctx.currentTime;
    const tick = () => {
      if (!this.playing) return;
      const now = this.ctx.currentTime - this.startTime + this.startAtPos;
      const horizon = now + this.lookahead;
      for (const n of this.scheduled) {
        if (n.time >= now && n.time < horizon) {
          this.playVoice(this.startTime + (n.time - this.startAtPos), n.freq, n.duration, n.velocity);
        }
      }
    };
    this.timer = window.setInterval(tick, 25);
  }

  pause() {
    this.playing = false;
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    // remember position
    this.startAtPos = this.getPositionSec();
  }

  stop() {
    this.pause();
    this.startAtPos = 0;
  }

  getTotalDurationSec(): number {
    if (!this.grid) return 0;
    return (this.grid.cols) * this.columnDurationSec();
  }

  getPositionSec(): number {
    if (!this.playing) return this.startAtPos;
    return (this.ctx.currentTime - this.startTime) + this.startAtPos;
  }

  seekTo(seconds: number) {
    this.startAtPos = Math.max(0, Math.min(seconds, this.getTotalDurationSec()));
    if (this.playing) {
      this.pause();
      this.play();
    }
  }

  skip(seconds: number) {
    this.seekTo(this.getPositionSec() + seconds);
  }
}
