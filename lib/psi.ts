import type { FieldVitals, LabVitals, PageAttempt, PsiScores, Strategy } from './types'

const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'] as const

export function pagespeedKey() {
  return process.env.PAGESPEED_API_KEY || process.env.GOOGLE_API_KEY || ''
}

export function scrub(value: string) {
  return value.replace(/key=[^&\s]+/gi, 'key=redacted').replace(/\s+/g, ' ').trim().slice(0, 240)
}

export function endpointFor(target: string, strategy: Strategy, key: string) {
  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
  endpoint.searchParams.set('url', target)
  endpoint.searchParams.set('strategy', strategy)
  for (const category of CATEGORIES) endpoint.searchParams.append('category', category)
  if (key) endpoint.searchParams.set('key', key)
  return endpoint
}

function categoryScore(raw: unknown): number | undefined {
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0 || raw > 1) return undefined
  return Math.round(raw * 100)
}

function positive(raw: unknown): number | undefined {
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0) return undefined
  return raw
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

export function parsePsi(body: unknown, httpStatus: number): Pick<PageAttempt, 'ok' | 'error' | 'finalUrl' | 'scores' | 'lab' | 'field'> {
  const root = asRecord(body)
  const error = asRecord(root?.error)
  if (!root || httpStatus >= 400 || error) {
    const message = typeof error?.message === 'string' ? error.message : `PageSpeed returned HTTP ${httpStatus}`
    return { ok: false, error: scrub(message) }
  }

  const lighthouse = asRecord(root.lighthouseResult)
  const categories = asRecord(lighthouse?.categories)
  const audits = asRecord(lighthouse?.audits)
  const scores: PsiScores = {}
  const performance = categoryScore(asRecord(categories?.performance)?.score)
  const accessibility = categoryScore(asRecord(categories?.accessibility)?.score)
  const bestPractices = categoryScore(asRecord(categories?.['best-practices'])?.score)
  const seo = categoryScore(asRecord(categories?.seo)?.score)
  if (performance !== undefined) scores.performance = performance
  if (accessibility !== undefined) scores.accessibility = accessibility
  if (bestPractices !== undefined) scores.bestPractices = bestPractices
  if (seo !== undefined) scores.seo = seo

  const lab: LabVitals = {}
  const lcpMs = positive(asRecord(audits?.['largest-contentful-paint'])?.numericValue)
  const cls = positive(asRecord(audits?.['cumulative-layout-shift'])?.numericValue)
  const inpMs = positive(asRecord(audits?.['interaction-to-next-paint'])?.numericValue)
  const fcpMs = positive(asRecord(audits?.['first-contentful-paint'])?.numericValue)
  const ttfbMs = positive(asRecord(audits?.['server-response-time'])?.numericValue)
  if (lcpMs !== undefined) lab.lcpMs = lcpMs
  if (cls !== undefined) lab.cls = cls
  if (inpMs !== undefined) lab.inpMs = inpMs
  if (fcpMs !== undefined) lab.fcpMs = fcpMs
  if (ttfbMs !== undefined) lab.ttfbMs = ttfbMs

  const field = readField(asRecord(root.loadingExperience), 'url') ?? readField(asRecord(root.originLoadingExperience), 'origin')
  const finalUrl = typeof lighthouse?.finalUrl === 'string' ? lighthouse.finalUrl : undefined
  const hasScores = Object.keys(scores).length > 0
  const hasLab = Object.keys(lab).length > 0

  if (!hasScores && !hasLab && !field) {
    return { ok: false, error: 'PageSpeed responded without category scores or vitals.', finalUrl }
  }

  return {
    ok: true,
    finalUrl,
    scores: hasScores ? scores : undefined,
    lab: hasLab ? lab : undefined,
    field,
  }
}

function readField(block: Record<string, unknown> | null, scope: 'url' | 'origin'): FieldVitals | undefined {
  if (!block) return undefined
  const metrics = asRecord(block.metrics)
  if (!metrics && typeof block.overall_category !== 'string') return undefined
  const field: FieldVitals = { scope }
  if (typeof block.overall_category === 'string') field.category = block.overall_category
  const lcp = positive(asRecord(metrics?.LARGEST_CONTENTFUL_PAINT_MS)?.percentile)
  const cls = positive(asRecord(metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE)?.percentile)
  const inp = positive(asRecord(metrics?.INTERACTION_TO_NEXT_PAINT)?.percentile)
  if (lcp !== undefined) field.lcpMs = lcp
  if (cls !== undefined) field.clsPercentile = cls
  if (inp !== undefined) field.inpMs = inp
  if (!field.category && field.lcpMs === undefined && field.clsPercentile === undefined && field.inpMs === undefined) return undefined
  return field
}
