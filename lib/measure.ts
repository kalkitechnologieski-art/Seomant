import { MEASUREMENT_TARGETS } from './facts'
import { endpointFor, pagespeedKey, parsePsi, scrub } from './psi'
import type { PageAttempt, Snapshot, Strategy } from './types'

const STRATEGIES: Strategy[] = ['mobile', 'desktop']

async function one(
  fetchImpl: typeof fetch,
  target: string,
  strategy: Strategy,
  key: string,
  fetchedAt: string,
): Promise<PageAttempt> {
  const endpoint = endpointFor(target, strategy, key)
  try {
    const response = await fetchImpl(endpoint, { signal: AbortSignal.timeout(45_000), cache: 'no-store' })
    const text = await response.text()
    let body: unknown = null
    try {
      body = JSON.parse(text)
    } catch {
      body = { error: { message: text.slice(0, 180) || `HTTP ${response.status}` } }
    }
    const parsed = parsePsi(body, response.status)
    return { url: target, strategy, fetchedAt, httpStatus: response.status, ...parsed }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PageSpeed request failed'
    return { url: target, strategy, fetchedAt, ok: false, error: scrub(message) }
  }
}

export async function measureAll(fetchImpl: typeof fetch = fetch, now = new Date()): Promise<Snapshot> {
  const startedAt = now.toISOString()
  const key = pagespeedKey()
  const tasks = MEASUREMENT_TARGETS.flatMap((target) => STRATEGIES.map((strategy) => ({ url: target.url, strategy })))
  const attempts = new Array<PageAttempt>(tasks.length)
  let cursor = 0
  async function worker() {
    while (cursor < tasks.length) {
      const index = cursor
      cursor += 1
      const task = tasks[index]
      if (!task) return
      attempts[index] = await one(fetchImpl, task.url, task.strategy, key, new Date().toISOString())
    }
  }
  await Promise.all([worker(), worker()])
  return {
    id: startedAt,
    startedAt,
    finishedAt: new Date().toISOString(),
    trigger: 'vercel-cron',
    keyConfigured: Boolean(key),
    attempts,
  }
}
