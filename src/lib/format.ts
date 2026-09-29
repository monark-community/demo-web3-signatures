import { intlLocale, type Locale } from "@/i18n/config"

export function formatDateTime(locale: Locale, ts: number): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ts)
}

export function formatDate(locale: Locale, ts: number): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { year: "numeric", month: "short", day: "numeric" }).format(ts)
}

export function formatRelative(locale: Locale, ts: number, now = Date.now()): string {
  const rtf = new Intl.RelativeTimeFormat(intlLocale[locale], { numeric: "auto" })
  const diff = ts - now
  const abs = Math.abs(diff)
  if (abs < 60_000) return rtf.format(Math.round(diff / 1000), "second")
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), "minute")
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), "hour")
  return rtf.format(Math.round(diff / 86_400_000), "day")
}

export function formatNumber(locale: Locale, n: number): string {
  return new Intl.NumberFormat(intlLocale[locale]).format(n)
}

export function formatBytes(locale: Locale, bytes: number): string {
  const units = locale === "fr" ? ["o", "Ko", "Mo", "Go"] : ["B", "KB", "MB", "GB"]
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  const num = new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: i === 0 ? 0 : 1 }).format(v)
  return `${num} ${units[i]}`
}

export function shortHex(hex: string, start = 6, end = 4): string {
  const s = hex.startsWith("0x") ? hex : `0x${hex}`
  if (s.length <= start + end + 3) return s
  return `${s.slice(0, start + 2)}…${s.slice(-end)}`
}

/** 64 hex chars → 8 groups of 8. */
export function hashGroups(hash: string): string[] {
  return hash.match(/.{1,8}/g) ?? []
}
