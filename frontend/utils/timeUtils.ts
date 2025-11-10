// Time formatting utilities

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatTzLabel(offsetMin: number): string {
  const sign = offsetMin >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMin)
  const hh = Math.floor(abs / 60)
  const mm = abs % 60
  return `UTC${sign}${pad2(hh)}${mm ? ':' + pad2(mm) : ''}`
}

// All timezone offsets from UTC-12:00 to UTC+14:00 in 30-minute intervals
export const TZ_OFFSETS: number[] = Array.from(
  { length: ((14 - -12) * 60) / 30 + 1 },
  (_, i) => -12 * 60 + i * 30
)

export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const hms = `${pad2(h)}:${pad2(m)}:${pad2(sec)}`
  return d > 0 ? `${d}d ${hms}` : hms
}

export function msToDateTimeFields(msUTC: number, offsetMin: number): { date: string; time: string } {
  // Convert a UTC ms timestamp into date/time components in the given timezone
  const msLocal = msUTC + offsetMin * 60_000
  const d = new Date(msLocal)
  const year = d.getUTCFullYear()
  const month = pad2(d.getUTCMonth() + 1)
  const day = pad2(d.getUTCDate())
  const hour = pad2(d.getUTCHours())
  const minute = pad2(d.getUTCMinutes())
  return { date: `${year}-${month}-${day}`, time: `${hour}:${minute}` }
}

export function fieldsToEpoch(dateStr: string, timeStr: string, offsetMin: number): number {
  // Interpret date/time as being in the given timezone, and return epoch seconds (UTC)
  if (!dateStr || !timeStr) return NaN
  const [y, m, d] = dateStr.split('-').map((s) => parseInt(s, 10))
  const [hh, mm] = timeStr.split(':').map((s) => parseInt(s, 10))
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d) || !Number.isFinite(hh) || !Number.isFinite(mm)) {
    return NaN
  }
  const msUTC = Date.UTC(y, m - 1, d, hh, mm) - offsetMin * 60_000
  return Math.floor(msUTC / 1000)
}

export function defaultUnlockMs(): number {
  // Default: now + 2 minutes
  return Date.now() + 120_000
}
