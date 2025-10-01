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
    size === "lg" ? "text-base font-medium" : "text-xs text-muted";
  const selectClass =
    size === "lg"
      ? "w-full min-w-[10rem] rounded-full border border-subtle bg-[var(--color-surface)] px-3 py-2 text-base text-[var(--color-text)] shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
      : "rounded-full border border-subtle bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-text)] shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]";

  return (
    <label className="flex items-center gap-2 text-[var(--color-text)]">
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
