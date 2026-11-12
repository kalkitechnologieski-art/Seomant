import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { measureAll } from '@/lib/measure'
import { readArchiveState, writeArchive } from '@/lib/store'

export const runtime = 'nodejs'
export const maxDuration = 300
export const dynamic = 'force-dynamic'

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const snapshot = await measureAll()
  const state = await readArchiveState()
  const archive = state.archive
  archive.snapshots = [snapshot, ...archive.snapshots].slice(0, 168)
  const saved = await writeArchive(archive)
  if (saved.ok) revalidatePath('/', 'layout')

  const succeeded = snapshot.attempts.filter((attempt) => attempt.ok).length
  return NextResponse.json({
    ok: saved.ok,
    persistence: saved.persistence,
    error: saved.error ?? state.error,
    startedAt: snapshot.startedAt,
    finishedAt: snapshot.finishedAt,
    keyConfigured: snapshot.keyConfigured,
    attempts: snapshot.attempts.length,
    succeeded,
    failed: snapshot.attempts.length - succeeded,
  })
}
