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
    <label className="flex items-center gap-2 text-sm text-[color:var(--color-muted)]">
      <span>Instrument</span>
      <select
        className="focus-ring rounded-md border border-[color:var(--color-border)] bg-[var(--color-card)] px-2.5 py-1.5 text-sm text-[color:var(--color-text)] shadow-sm transition-colors"
        value={value}
        onChange={e=>onChange(e.target.value as InstrumentId)}
        aria-label="Instrument"
      >
        {opts.map(o=> <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}
