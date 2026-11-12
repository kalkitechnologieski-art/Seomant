import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { requestPassesGate } from '@/lib/gate'
import { signBody, webhookTarget } from '@/lib/sign'
import { readArchiveState, writeArchive } from '@/lib/store'
import { rateLimit } from '@/lib/time'
import type { UpdateRequest } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!requestPassesGate(request.headers.get('cookie'))) {
    return NextResponse.json({ outcome: 'unauthorized', detail: 'Share token required.' }, { status: 401 })
  }

  const state = await readArchiveState()
  const archive = state.archive
  const target = webhookTarget(process.env.WEBHOOK_URL)
  const secret = process.env.WEBHOOK_SECRET
  const requestedAt = new Date().toISOString()

  if (!target || !secret) {
    const entry: UpdateRequest = {
      id: requestedAt,
      requestedAt,
      outcome: 'not_configured',
      detail: 'WEBHOOK_URL and WEBHOOK_SECRET are both required. Nothing was sent.',
    }
    archive.updateRequests = [entry, ...archive.updateRequests]
    const saved = await writeArchive(archive)
    if (saved.ok) revalidatePath('/', 'layout')
    return NextResponse.json({ outcome: 'not_configured', detail: entry.detail, persistence: saved.persistence })
  }

  const limit = rateLimit(archive.lastWebhookAttemptAt)
  if (limit.limited) {
    return NextResponse.json({ outcome: 'rate_limited', retryAt: limit.retryAt, detail: 'One request each 15 minutes.' })
  }

  archive.lastWebhookAttemptAt = requestedAt
  const locked = await writeArchive(archive)
  if (!locked.ok) {
    return NextResponse.json(
      { outcome: 'failed', detail: locked.error ?? 'The rate-limit record could not be saved. Nothing was sent.' },
      { status: 503 },
    )
  }

  const timestamp = Date.now().toString()
  const body = JSON.stringify({
    source: 'seoman',
    product: 'Seoman',
    requestedAt,
    message: 'Update now requested from the Seoman board. This uses weekly Grok Bot quota and is addressed to CEO KALKI.',
  })
  const signature = signBody(secret, timestamp, body)

  let outcome: UpdateRequest['outcome'] = 'failed'
  let detail = 'The webhook did not confirm the request.'
  let httpStatus: number | undefined
  try {
    const response = await fetch(target, {
      method: 'POST',
      redirect: 'error',
      headers: {
        'content-type': 'application/json',
        'x-seoman-timestamp': timestamp,
        'x-seoman-signature': signature,
      },
      body,
      signal: AbortSignal.timeout(15_000),
    })
    httpStatus = response.status
    if (response.ok) {
      outcome = 'sent'
      detail = 'Requested — this uses weekly quota.'
    } else {
      detail = `Webhook returned HTTP ${response.status}. Nothing was confirmed.`
    }
  } catch {
    detail = 'The webhook could not be reached. Nothing was confirmed.'
  }

  const fresh = await readArchiveState()
  fresh.archive.updateRequests = [
    { id: requestedAt, requestedAt, outcome, detail, httpStatus },
    ...fresh.archive.updateRequests,
  ]
  fresh.archive.lastWebhookAttemptAt = requestedAt
  await writeArchive(fresh.archive)
  revalidatePath('/', 'layout')
  return NextResponse.json({ outcome, detail, retryAt: rateLimit(requestedAt).retryAt })
}
