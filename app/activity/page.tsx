import type { Metadata } from 'next'
import { Foot, PageHead } from '@/components/ui'
import { MILESTONES } from '@/lib/facts'
import { readArchiveState } from '@/lib/store'
import { formatIst, nextCron } from '@/lib/time'

export const metadata: Metadata = { title: 'Activity' }
export const revalidate = 3600

export default async function ActivityPage() {
  const state = await readArchiveState()
  return (
    <>
      <PageHead
        kicker="CRM"
        title="Activity"
        lede="Scheduled commitments, hourly measurement runs, and Update now requests. A failed reading is kept as a failure."
      />
      <p className="meta-line">
        Store {state.persistence}
        {state.error ? ` · ${state.error}` : ''} · Next automatic refresh {formatIst(nextCron())}
      </p>
      <section className="section" style={{ marginTop: 0 }}>
        <h2>Measurement runs</h2>
        {state.archive.snapshots.length === 0 ? (
          <p>No hourly snapshot is stored yet.</p>
        ) : (
          <div className="stack">
            {state.archive.snapshots.map((snapshot) => {
              const ok = snapshot.attempts.filter((attempt) => attempt.ok).length
              return (
                <article className="log" key={snapshot.id}>
                  <time dateTime={snapshot.finishedAt}>{formatIst(snapshot.finishedAt)}</time>
                  <strong>
                    {ok} of {snapshot.attempts.length} readings succeeded
                  </strong>
                  <p className="fine">
                    Vercel Cron · API key {snapshot.keyConfigured ? 'configured' : 'not configured'} · started {formatIst(snapshot.startedAt)}
                  </p>
                  <ul className="facts">
                    {snapshot.attempts.map((attempt) => (
                      <li key={`${attempt.url}-${attempt.strategy}-${attempt.fetchedAt}`}>
                        {attempt.strategy} · {attempt.url} · {attempt.ok ? 'recorded' : attempt.error} · {formatIst(attempt.fetchedAt)}
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        )}
      </section>
      <section className="section">
        <h2>Update now</h2>
        {state.archive.updateRequests.length === 0 ? (
          <p>No secondary request has been made from this board.</p>
        ) : (
          <div className="stack">
            {state.archive.updateRequests.map((entry) => (
              <article className="log" key={entry.id}>
                <time dateTime={entry.requestedAt}>{formatIst(entry.requestedAt)}</time>
                <strong>{entry.outcome}</strong>
                <p>{entry.detail}</p>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="section">
        <h2>Charter calendar</h2>
        <div className="stack">
          {MILESTONES.map((item) => (
            <article className="log" key={item.at}>
              <time dateTime={item.at}>{formatIst(item.at)}</time>
              <strong>{item.label}</strong>
              <p className="fine">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <Foot />
    </>
  )
}
