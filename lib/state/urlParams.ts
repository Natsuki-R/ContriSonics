import type { InstrumentId } from "../instruments";

export function getInstrumentFromUrl(): InstrumentId | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("instrument") as InstrumentId | null;
  return id;
}

export function setInstrumentInUrl(id: InstrumentId) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  params.set("instrument", id);
  const url = window.location.pathname + "?" + params.toString();
  window.history.replaceState(null, "", url);
}
