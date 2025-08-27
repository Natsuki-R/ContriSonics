"use client";

import type { InstrumentId } from "@/lib/instruments";

export function InstrumentSelect({ value, onChange }: { value: InstrumentId; onChange: (v: InstrumentId)=>void }) {
  const opts: {id: InstrumentId; label: string}[] = [
    {id:"metal",label:"Metal"},
    {id:"piano",label:"Piano"},
    {id:"organ",label:"Organ"},
    {id:"synth",label:"Synth"},
  ];
  return (
    <label className="flex items-center gap-2">
      <span className="text-sm opacity-80">Instrument</span>
      <select
        className="border rounded px-2 py-1 bg-neutral-900"
        value={value}
        onChange={e=>onChange(e.target.value as InstrumentId)}
        aria-label="Instrument"
      >
        {opts.map(o=> <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}
