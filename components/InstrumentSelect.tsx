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
      ? "w-full min-w-[10rem] appearance-none rounded border border-subtle bg-[var(--color-surface)] pl-3 pr-8 py-2 text-base text-[var(--color-text)] shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
      : "appearance-none rounded border border-subtle bg-[var(--color-surface)] pl-3 pr-8 py-1 text-sm text-[var(--color-text)] shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]";

  return (
    <label className="flex items-center gap-2 text-[var(--color-text)]">
      <span className={labelClass}>Instrument</span>
      <div className="relative">
        <select
          className={selectClass}
          value={value}
          onChange={e=>onChange(e.target.value as InstrumentId)}
          aria-label="Instrument"
        >
          {opts.map(o=> <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </div>
    </label>
  );
}
