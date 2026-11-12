'use client'

import { useState } from 'react'
import { formatIst } from '@/lib/time'

type State =
  | { kind: 'idle' }
  | { kind: 'rate_limited'; retryAt: string | null }
  | { kind: 'sent' }
  | { kind: 'not_configured'; detail: string }
  | { kind: 'failed'; detail: string }
  | { kind: 'unauthorized' }

export function UpdateNow({ limited, retryAt }: { limited: boolean; retryAt: string | null }) {
  const [pending, setPending] = useState(false)
  const [state, setState] = useState<State>(limited ? { kind: 'rate_limited', retryAt } : { kind: 'idle' })

  async function onClick() {
    if (pending || state.kind === 'sent' || state.kind === 'rate_limited') return
    setPending(true)
    try {
      const response = await fetch('/api/request-update', { method: 'POST' })
      const data = (await response.json()) as { outcome?: string; detail?: string; retryAt?: string | null }
      if (data.outcome === 'sent') setState({ kind: 'sent' })
      else if (data.outcome === 'rate_limited') setState({ kind: 'rate_limited', retryAt: data.retryAt ?? null })
      else if (data.outcome === 'not_configured') setState({ kind: 'not_configured', detail: data.detail ?? 'Nothing was sent.' })
      else if (data.outcome === 'unauthorized') setState({ kind: 'unauthorized' })
      else setState({ kind: 'failed', detail: data.detail ?? 'Nothing was confirmed.' })
    } catch {
      setState({ kind: 'failed', detail: 'Nothing was confirmed.' })
    } finally {
      setPending(false)
    }
  }

  const disabled = pending || state.kind === 'sent' || state.kind === 'rate_limited'
  return (
    <div className="secondary">
      <button className="button" type="button" onClick={onClick} disabled={disabled}>
        {pending ? 'Sending request…' : 'Update now'}
      </button>
      {state.kind === 'idle' ? (
        <p className="fine">Secondary path. Uses Grok Bot weekly quota and talks to CEO KALKI. The hourly refresh does not use that quota.</p>
      ) : null}
      {state.kind === 'sent' ? <p className="confirm">Requested — this uses weekly quota</p> : null}
      {state.kind === 'not_configured' ? <p className="fine">{state.detail}</p> : null}
      {state.kind === 'failed' ? <p className="fine">{state.detail}</p> : null}
      {state.kind === 'unauthorized' ? <p className="fine">The share token is required before this request.</p> : null}
      {state.kind === 'rate_limited' ? (
        <p className="fine">Rate limited until {state.retryAt ? formatIst(state.retryAt) : 'the next window'}.</p>
      ) : null}
      <noscript>
        <p className="fine">Update now needs JavaScript. The hourly Vercel refresh still runs without it.</p>
      </noscript>
    </div>
  )
}
