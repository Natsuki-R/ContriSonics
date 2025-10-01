"use client";

import type { InstrumentId } from "@/lib/instruments";

type Props = {
  value: InstrumentId;
  onChange: (v: InstrumentId) => void;
  size?: "md" | "lg";
};

export function InstrumentSelect({ value, onChange, size = "md" }: Props) {
  const opts: {id: InstrumentId; label: string}[] = [
    {id:"metal",label:"Metal"},
    {id:"piano",label:"Piano"},
    {id:"organ",label:"Organ"},
    {id:"synth",label:"Synth"},
  ];

  const labelClass =
    size === "lg" ? "text-base font-medium" : "text-sm opacity-80";
  const selectClass =
    size === "lg"
      ? "border rounded px-3 py-2 text-base bg-neutral-900"
      : "border rounded px-2 py-1 bg-neutral-900";

  return (
    <label className="flex items-center gap-2">
      <span className={labelClass}>Instrument</span>
      <select
        className={selectClass}
        value={value}
        onChange={e=>onChange(e.target.value as InstrumentId)}
        aria-label="Instrument"
      >
        {opts.map(o=> <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}
