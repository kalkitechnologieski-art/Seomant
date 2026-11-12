import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { get, put } from '@vercel/blob'
import type { Archive, ArchiveState, Persistence } from './types'

const BLOB_PATH = 'seoman/archive.json'
const LOCAL_PATH = path.join(process.cwd(), '.data', 'archive.json')

export function emptyArchive(): Archive {
  return { version: 1, snapshots: [], updateRequests: [] }
}

function normalize(value: unknown): Archive {
  const record = value && typeof value === 'object' ? (value as Partial<Archive>) : {}
  return {
    version: 1,
    snapshots: Array.isArray(record.snapshots) ? record.snapshots.slice(0, 168) : [],
    updateRequests: Array.isArray(record.updateRequests) ? record.updateRequests.slice(0, 50) : [],
    lastWebhookAttemptAt: typeof record.lastWebhookAttemptAt === 'string' ? record.lastWebhookAttemptAt : undefined,
  }
}

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
}

function accessMode(): 'private' | 'public' {
  return process.env.BLOB_ACCESS === 'public' ? 'public' : 'private'
}

export async function readArchiveState(): Promise<ArchiveState> {
  if (blobConfigured()) {
    try {
      const result = await get(BLOB_PATH, { access: accessMode(), useCache: false })
      if (!result || result.statusCode !== 200) return { archive: emptyArchive(), persistence: 'blob' }
      const text = await new Response(result.stream).text()
      return { archive: normalize(JSON.parse(text)), persistence: 'blob' }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Blob read failed'
      return { archive: emptyArchive(), persistence: 'blob', error: message.slice(0, 180) }
    }
  }
  if (process.env.VERCEL) return { archive: emptyArchive(), persistence: 'unconfigured' }
  try {
    const text = await readFile(LOCAL_PATH, 'utf8')
    return { archive: normalize(JSON.parse(text)), persistence: 'local' }
  } catch {
    return { archive: emptyArchive(), persistence: 'local' }
  }
}

export async function writeArchive(archive: Archive): Promise<{ ok: boolean; persistence: Persistence; error?: string }> {
  const next = normalize({
    ...archive,
    snapshots: archive.snapshots.slice(0, 168),
    updateRequests: archive.updateRequests.slice(0, 50),
  })
  if (blobConfigured()) {
    try {
      await put(BLOB_PATH, JSON.stringify(next), {
        access: accessMode(),
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 60,
      })
      return { ok: true, persistence: 'blob' }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Blob write failed'
      return { ok: false, persistence: 'blob', error: message.slice(0, 180) }
    }
  }
  if (process.env.VERCEL) return { ok: false, persistence: 'unconfigured', error: 'Vercel Blob is not connected.' }
  await mkdir(path.dirname(LOCAL_PATH), { recursive: true })
  await writeFile(LOCAL_PATH, JSON.stringify(next, null, 2))
  return { ok: true, persistence: 'local' }
}
