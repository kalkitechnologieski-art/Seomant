import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createHmac } from 'node:crypto'
import { QUOTA, quotaShareTotal, shippingLocked, nextMilestone } from '../lib/facts'
import { measureAll } from '../lib/measure'
import { parsePsi } from '../lib/psi'
import { signBody } from '../lib/sign'
import { nextCron, rateLimit } from '../lib/time'
import { canChart, metricSeries } from '../lib/view'
import type { PageAttempt } from '../lib/types'

describe('schedule and quota', () => {
  it('places the next cron on the IST hour', () => {
    assert.equal(nextCron(new Date('2026-11-12T06:00:00Z')).toISOString(), '2026-11-12T06:30:00.000Z')
    assert.equal(nextCron(new Date('2026-11-12T06:30:00Z')).toISOString(), '2026-11-12T07:30:00.000Z')
    assert.equal(nextCron(new Date('2026-11-12T06:45:00Z')).toISOString(), '2026-11-12T07:30:00.000Z')
  })

  it('keeps the written plan at 60 plus a 40 reserve', () => {
    assert.equal(quotaShareTotal(), 60)
    assert.equal(QUOTA.reserve, 40)
    assert.equal(quotaShareTotal() + QUOTA.reserve, 100)
  })

  it('names the 13 Nov kickoff before the shipping window', () => {
    const now = new Date('2026-11-12T06:30:00Z')
    assert.equal(shippingLocked(now), true)
    assert.equal(nextMilestone(now)?.label, 'Thin kickoff')
  })

  it('rate limits for 15 minutes', () => {
    const last = '2026-11-12T06:00:00.000Z'
    assert.equal(rateLimit(last, Date.parse('2026-11-12T06:14:00.000Z')).limited, true)
    assert.equal(rateLimit(last, Date.parse('2026-11-12T06:15:00.000Z')).limited, false)
    assert.equal(rateLimit(undefined, Date.now()).limited, false)
  })
})

describe('measurements stay honest', () => {
  it('omits missing categories instead of writing zero', () => {
    const parsed = parsePsi(
      {
        lighthouseResult: {
          finalUrl: 'https://kalki-intelligence.in/',
          categories: { performance: { score: 0.42 }, accessibility: { score: 0 } },
          audits: { 'largest-contentful-paint': { numericValue: 2400 }, 'cumulative-layout-shift': { numericValue: 0.02 } },
        },
      },
      200,
    )
    assert.equal(parsed.ok, true)
    assert.equal(parsed.scores?.performance, 42)
    assert.equal(parsed.scores?.accessibility, 0)
    assert.equal(parsed.scores?.seo, undefined)
    assert.equal(parsed.scores?.bestPractices, undefined)
    assert.equal(parsed.lab?.lcpMs, 2400)
  })

  it('records a quota block without scores', () => {
    const parsed = parsePsi({ error: { code: 429, message: 'Quota exceeded for quota metric' } }, 429)
    assert.equal(parsed.ok, false)
    assert.equal(parsed.scores, undefined)
    assert.match(parsed.error ?? '', /Quota exceeded/)
  })

  it('hides a chart until two real points exist', () => {
    const attempts: PageAttempt[] = [
      { url: 'https://kalki-intelligence.in', strategy: 'mobile', fetchedAt: '2026-11-12T07:30:00Z', ok: true, scores: { performance: 40 } },
      { url: 'https://kalki-intelligence.in', strategy: 'mobile', fetchedAt: '2026-11-12T06:30:00Z', ok: false, error: 'blocked' },
    ]
    assert.equal(canChart(metricSeries(attempts, 'performance')), false)
    attempts.push({ url: 'https://kalki-intelligence.in', strategy: 'mobile', fetchedAt: '2026-11-12T05:30:00Z', ok: true, scores: { performance: 55 } })
    const series = metricSeries(attempts, 'performance')
    assert.equal(canChart(series), true)
    assert.deepEqual(series.map((point) => point.v), [55, 40])
  })

  it('stores failed live calls from a stubbed PageSpeed response', async () => {
    const previous = process.env.PAGESPEED_API_KEY
    delete process.env.PAGESPEED_API_KEY
    let calls = 0
    const snapshot = await measureAll(async () => {
      calls += 1
      return new Response(JSON.stringify({ error: { message: 'API key missing' } }), { status: 403 })
    }, new Date('2026-11-12T06:30:00Z'))
    if (previous) process.env.PAGESPEED_API_KEY = previous
    assert.equal(calls, 6)
    assert.equal(snapshot.attempts.length, 6)
    assert.equal(snapshot.attempts.every((attempt) => attempt.ok === false && attempt.scores === undefined), true)
    assert.equal(snapshot.keyConfigured, false)
  })
})

describe('webhook signature', () => {
  it('signs timestamp and raw body', () => {
    const secret = 'shared'
    const timestamp = '1700000000000'
    const body = '{"source":"seoman"}'
    const expected = `sha256=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`
    assert.equal(signBody(secret, timestamp, body), expected)
  })
})
