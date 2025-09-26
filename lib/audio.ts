import { semitoneToFreq } from './mapping';
import type { Grid, GridCell } from './types';
import { INSTRUMENTS, type InstrumentId, type Instrument as InstrumentDef } from './instruments';

interface LoadedSampler {
  buffers: Record<number, AudioBuffer>;
}

const DEFAULT_RECIPE = {
  osc: 'sine' as OscillatorType,
  attack: 0.01,
  decay: 0.1,
  sustain: 0.8,
  release: 0.2,
};

type ScheduledNote = {
  time: number;    // when to start (AudioContext time)
  freq: number;
  duration: number;
  velocity: number;
  col: number;     // to allow column-based grouping if needed
  cell: GridCell;
  hasTriggered: boolean;
};

export class AudioEngine {
  ctx: AudioContext;
  master: GainNode;
  reverb: ConvolverNode | null = null;
  instrumentGain: GainNode;
  reverbGain: GainNode;
  playing = false;
  lookahead = 0.1; // seconds
  scheduleInterval = 0; // ms
  currentCol = 0;
  startTime = 0;
  startAtPos = 0; // seconds
  bpm = 90;
  baseHz = 261.63; // C4
  instrument: InstrumentDef = INSTRUMENTS.piano;
  sampler: LoadedSampler | null = null;
  scheduled: ScheduledNote[] = [];
  timer: number | null = null;
  grid: Grid | null = null;
  activeSources: AudioScheduledSourceNode[] = [];
  activeCellListener: ((cell: GridCell | null) => void) | null = null;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(this.ctx.destination);

    this.instrumentGain = this.ctx.createGain();
    this.instrumentGain.gain.value = this.instrument.gain;
    this.instrumentGain.connect(this.master);

    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = this.instrument.reverbSend;
    this.reverbGain.connect(this.reverb ?? this.master);
  }

  setBpm(bpm: number) { this.bpm = bpm; }
  setBaseHz(hz: number) { this.baseHz = hz; }

  async setInstrument(id: InstrumentId): Promise<void> {
    const pack = INSTRUMENTS[id];
    if (!pack) return;

    // preload samples if sampler
    let sampler: LoadedSampler | null = null;
    if (pack.type === 'sampler' && pack.samples) {
      const buffers: Record<number, AudioBuffer> = {};
      await Promise.all(
        Object.entries(pack.samples).map(async ([m, url]) => {
          try {
            const res = await fetch(url);
            const arr = await res.arrayBuffer();
            const buf = await this.ctx.decodeAudioData(arr);
            buffers[Number(m)] = buf;
          } catch (e) {
            console.warn('Failed to load sample', url, e);
          }
        })
      );
      if (Object.keys(buffers).length) {
        sampler = { buffers };
      }
    }

    const now = this.ctx.currentTime;
    const oldGain = this.instrumentGain;
    const newGain = this.ctx.createGain();
    newGain.gain.value = 0;
    newGain.connect(this.master);
    newGain.gain.linearRampToValueAtTime(pack.gain, now + 0.12);
    oldGain.gain.setValueAtTime(oldGain.gain.value, now);
    oldGain.gain.linearRampToValueAtTime(0, now + 0.12);

    this.instrumentGain = newGain;
    this.reverbGain.gain.setValueAtTime(pack.reverbSend, now);
    this.instrument = pack;
    this.sampler = sampler;

    // disconnect old gain after fade
    setTimeout(() => oldGain.disconnect(), 200);
  }

  attachGrid(grid: Grid) {
    this.grid = grid;
    this.scheduled = [];
    this.currentCol = 0;
    this.notifyActiveCell(null);
  }

  setActiveCellListener(listener: ((cell: GridCell | null) => void) | null) {
    this.activeCellListener = listener;
  }

  private notifyActiveCell(cell: GridCell | null) {
    if (this.activeCellListener) {
      this.activeCellListener(cell);
    }
  }

  private updateTriggeredForPosition(position: number) {
    let last: GridCell | null = null;
    for (const note of this.scheduled) {
      const triggered = note.time < position;
      note.hasTriggered = triggered;
      if (triggered) {
        last = note.cell;
      }
    }
    this.notifyActiveCell(last);
  }

  private columnDurationSec(): number {
    // 1 bar of 4 quarter notes at current BPM
    return (60 / this.bpm) * 4;
  }

  private freqToMidi(freq: number): number {
    return Math.round(69 + 12 * Math.log2(freq / 440));
  }

  private trackSource(src: AudioScheduledSourceNode) {
    const max = this.instrument.recipe?.voices ?? 32;
    if (this.activeSources.length >= max) {
      const old = this.activeSources.shift();
      old?.stop();
    }
    this.activeSources.push(src);
    src.addEventListener('ended', () => {
      const idx = this.activeSources.indexOf(src);
      if (idx >= 0) this.activeSources.splice(idx, 1);
    });
  }

  private playSynth(time: number, freq: number, duration: number, velocity: number) {
    const recipe = this.instrument.recipe ?? DEFAULT_RECIPE;
    const osc = this.ctx.createOscillator();
    osc.type = recipe.osc;
    const gain = this.ctx.createGain();

    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(velocity, time + recipe.attack);
    gain.gain.linearRampToValueAtTime(velocity * recipe.sustain, time + recipe.attack + recipe.decay);
    gain.gain.setTargetAtTime(0.0001, time + recipe.attack + recipe.decay + duration, recipe.release);

    osc.connect(gain);
    gain.connect(this.instrumentGain);
    gain.connect(this.reverbGain);
    osc.start(time);
    osc.stop(time + recipe.attack + recipe.decay + duration + recipe.release + 0.1);
    this.trackSource(osc);
  }

  private playSampler(time: number, freq: number, duration: number, velocity: number) {
    if (!this.sampler) {
      this.playSynth(time, freq, duration, velocity);
      return;
    }
    const midi = this.freqToMidi(freq);
    let sel: number | null = null;
    let min = Infinity;
    for (const m of Object.keys(this.sampler.buffers)) {
      const n = Number(m);
      const d = Math.abs(n - midi);
      if (d < min) { sel = n; min = d; }
    }
    if (sel == null) {
      this.playSynth(time, freq, duration, velocity);
      return;
    }
    const buf = this.sampler.buffers[sel];
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const rate = Math.pow(2, (midi - sel) / 12);
    src.playbackRate.value = rate;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity, time);
    src.connect(gain);
    gain.connect(this.instrumentGain);
    gain.connect(this.reverbGain);
    src.start(time);
    src.stop(time + duration + 1);
    this.trackSource(src);
  }

  private playVoice(time: number, freq: number, duration: number, velocity: number) {
    if (this.instrument.type === 'sampler' && this.sampler) {
      this.playSampler(time, freq, duration, velocity);
    } else {
      this.playSynth(time, freq, duration, velocity);
    }
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
        cell,
        hasTriggered: false,
      });
    }
    this.scheduled = notes.sort((a, b) => a.time - b.time);
    this.updateTriggeredForPosition(this.startAtPos);
  }

  play() {
    if (!this.grid) return;
    if (!this.scheduled.length) this.prepareScheduleFromGrid();

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.playing = true;
    this.startTime = this.ctx.currentTime;
    this.updateTriggeredForPosition(this.startAtPos);
    const tick = () => {
      if (!this.playing) return;
      const now = this.ctx.currentTime - this.startTime + this.startAtPos;
      const horizon = now + this.lookahead;
      for (const n of this.scheduled) {
        if (!n.hasTriggered && n.time >= now && n.time < horizon) {
          this.playVoice(this.startTime + (n.time - this.startAtPos), n.freq, n.duration, n.velocity);
          n.hasTriggered = true;
          this.notifyActiveCell(n.cell);
        }
      }
      if (now >= this.getTotalDurationSec()) {
        this.stop();
      }
    };
    this.timer = window.setInterval(tick, 25);
  }

  pause() {
    const pos = this.getPositionSec();
    this.playing = false;
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    // remember position
    this.startAtPos = pos;
    this.updateTriggeredForPosition(this.startAtPos);
  }

  stop() {
    this.pause();
    this.startAtPos = 0;
    this.updateTriggeredForPosition(this.startAtPos);
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
    this.updateTriggeredForPosition(this.startAtPos);
    if (this.playing) {
      this.pause();
      this.play();
    }
  }

  skip(seconds: number) {
    this.seekTo(this.getPositionSec() + seconds);
  }
}
