import type { PageAttempt, PsiScores, Snapshot, Strategy } from './types'

export function attemptsFor(snapshots: Snapshot[], url: string, strategy: Strategy): PageAttempt[] {
  const list: PageAttempt[] = []
  for (const snapshot of snapshots) {
    for (const attempt of snapshot.attempts) {
      if (attempt.url === url && attempt.strategy === strategy) list.push(attempt)
    }
  }
  return list
}

export function metricSeries(attempts: PageAttempt[], metric: keyof PsiScores) {
  return [...attempts].reverse().flatMap((attempt) => {
    const value = attempt.scores?.[metric]
    return attempt.ok && typeof value === 'number' ? [{ t: attempt.fetchedAt, v: value }] : []
  })
}

export function canChart(points: { v: number }[]) {
  return points.length >= 2
}

export function labSeries(attempts: PageAttempt[], key: 'lcpMs' | 'cls' | 'inpMs') {
  return [...attempts].reverse().flatMap((attempt) => {
    const value = attempt.lab?.[key]
    return attempt.ok && typeof value === 'number' ? [{ t: attempt.fetchedAt, v: value }] : []
  })
}

export function lastSuccess(attempts: PageAttempt[]) {
  return attempts.find((attempt) => attempt.ok && attempt.scores && Object.keys(attempt.scores).length > 0) ?? null
}
