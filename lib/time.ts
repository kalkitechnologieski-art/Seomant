const IST = 'Asia/Calcutta'

export const RATE_LIMIT_MS = 15 * 60 * 1000

export function formatIst(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(date.getTime())) return 'Unknown time'
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
  return `${formatted} IST`
}

/** Next Vercel cron tick. Schedule `30 * * * *` is HH:30 UTC, which is the top of the hour in IST. */
export function nextCron(now = new Date()): Date {
  const next = new Date(now.getTime())
  next.setUTCSeconds(0, 0)
  if (next.getUTCMinutes() < 30) {
    next.setUTCMinutes(30)
    if (next.getTime() <= now.getTime()) next.setUTCHours(next.getUTCHours() + 1)
    return next
  }
  next.setUTCMinutes(30)
  next.setUTCHours(next.getUTCHours() + 1)
  return next
}

export function rateLimit(lastIso: string | undefined, now = Date.now()): { limited: boolean; retryAt: string | null } {
  if (!lastIso) return { limited: false, retryAt: null }
  const last = new Date(lastIso).getTime()
  if (Number.isNaN(last)) return { limited: false, retryAt: null }
  const retry = last + RATE_LIMIT_MS
  if (now < retry) return { limited: true, retryAt: new Date(retry).toISOString() }
  return { limited: false, retryAt: null }
}

export function formatMs(ms: number | undefined): string | null {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return null
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`
  return `${Math.round(ms)} ms`
}

export function formatCls(cls: number | undefined): string | null {
  if (typeof cls !== 'number' || !Number.isFinite(cls)) return null
  return cls.toFixed(3)
}
