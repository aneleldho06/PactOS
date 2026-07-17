export function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
}

export function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const past = diff >= 0;
  const buckets: [number, Intl.RelativeTimeFormatUnit, number][] = [
    [60 * 1000, "second", 1000],
    [60 * 60 * 1000, "minute", 60 * 1000],
    [24 * 60 * 60 * 1000, "hour", 60 * 60 * 1000],
    [7 * 24 * 60 * 60 * 1000, "day", 24 * 60 * 60 * 1000],
    [30 * 24 * 60 * 60 * 1000, "week", 7 * 24 * 60 * 60 * 1000],
    [365 * 24 * 60 * 60 * 1000, "month", 30 * 24 * 60 * 60 * 1000],
    [Number.POSITIVE_INFINITY, "year", 365 * 24 * 60 * 60 * 1000],
  ];
  for (const [limit, unit, divisor] of buckets) {
    if (abs < limit) {
      const value = Math.round(abs / divisor);
      return rtf.format(past ? -value : value, unit);
    }
  }
  return "";
}

export function countdown(iso?: string) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "now";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h ${m}m`;
}