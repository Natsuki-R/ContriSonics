export type InstrumentId = "metal" | "piano" | "organ" | "synth";

export interface Instrument {
  id: InstrumentId;
  label: string;
  type: "sampler" | "synth";
  samples?: Record<number, string>;
  recipe?: {
    osc: "sine" | "square" | "sawtooth" | "triangle";
    voices?: number;
    detuneCents?: number;
    chorus?: boolean;
    drive?: number;
    attack: number; decay: number; sustain: number; release: number;
    filter?: { type: BiquadFilterType; cutoffHz: number; q?: number };
  };
  gain: number;
  reverbSend: number;
}

export const INSTRUMENTS: Record<InstrumentId, Instrument> = {
  metal: {
    id: "metal", label: "Metal",
    type: "synth",
    recipe: {
      osc: "sawtooth", voices: 6, detuneCents: 8, chorus: true, drive: 0.35,
      attack: 0.002, decay: 0.08, sustain: 0.7, release: 0.15,
      filter: { type: "lowpass", cutoffHz: 3800, q: 0.8 }
    },
    gain: 0.85, reverbSend: 0.15,
  },
  piano: {
    id: "piano", label: "Piano",
    type: "sampler",
    samples: { 60:"/samples/piano/C4.mp3", 64:"/samples/piano/E4.mp3", 67:"/samples/piano/G4.mp3" },
    gain: 0.9, reverbSend: 0.2,
  },
  organ: {
    id: "organ", label: "Organ",
    type: "synth",
    recipe: {
      osc: "square", voices: 8, detuneCents: 2,
      attack: 0.005, decay: 0.02, sustain: 0.95, release: 0.05,
      filter: { type: "lowpass", cutoffHz: 5200 }
    },
    gain: 0.8, reverbSend: 0.1,
  },
  synth: {
    id: "synth", label: "Synth Pad",
    type: "synth",
    recipe: {
      osc: "triangle", voices: 4, detuneCents: 12, chorus: true,
      attack: 0.12, decay: 0.2, sustain: 0.85, release: 0.6,
      filter: { type: "lowpass", cutoffHz: 2200, q: 0.7 }
    },
    gain: 0.75, reverbSend: 0.35,
  },
};
