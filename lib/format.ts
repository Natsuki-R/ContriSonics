export function formatContribution(count: number) {
  return `${count} ${count === 1 ? 'contribution' : 'contributions'}`;
}

export function formatDateLong(iso: string) {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  return new Intl.DateTimeFormat(undefined, opts).format(d);
}
