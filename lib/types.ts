export type Strategy = 'mobile' | 'desktop'

export type PsiScores = {
  performance?: number
  accessibility?: number
  bestPractices?: number
  seo?: number
}

export type LabVitals = {
  lcpMs?: number
  cls?: number
  inpMs?: number
  fcpMs?: number
  ttfbMs?: number
}

export type FieldVitals = {
  scope: 'url' | 'origin'
  category?: string
  lcpMs?: number
  clsPercentile?: number
  inpMs?: number
}

export type PageAttempt = {
  url: string
  strategy: Strategy
  fetchedAt: string
  ok: boolean
  httpStatus?: number
  error?: string
  finalUrl?: string
  scores?: PsiScores
  lab?: LabVitals
  field?: FieldVitals
}

export type Snapshot = {
  id: string
  startedAt: string
  finishedAt: string
  trigger: 'vercel-cron'
  keyConfigured: boolean
  attempts: PageAttempt[]
}

export type UpdateOutcome = 'sent' | 'not_configured' | 'rate_limited' | 'failed' | 'unauthorized'

export type UpdateRequest = {
  id: string
  requestedAt: string
  outcome: UpdateOutcome
  detail: string
  httpStatus?: number
}

export type Archive = {
  version: 1
  snapshots: Snapshot[]
  updateRequests: UpdateRequest[]
  lastWebhookAttemptAt?: string
}

export type Persistence = 'blob' | 'local' | 'unconfigured'

export type ArchiveState = {
  archive: Archive
  persistence: Persistence
  error?: string
}
