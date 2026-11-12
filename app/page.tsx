import { UpdateNow } from '@/components/update-now'
import { Chip, Foot, PageHead, WorkTable } from '@/components/ui'
import { CHARTER, MILESTONES, OPERATIONAL_AS_OF, OPERATIONAL_SOURCE, QUOTA, WORK, nextMilestone, shippingLocked } from '@/lib/facts'
import { readArchiveState } from '@/lib/store'
import { formatIst, nextCron, rateLimit } from '@/lib/time'
import { attemptsFor, lastSuccess } from '@/lib/view'

export const revalidate = 3600

const HOME = 'https://kalki-intelligence.in'

export default async function CommandPage() {
  const state = await readArchiveState()
  const now = new Date()
  const upcoming = nextMilestone(now)
  const locked = shippingLocked(now)
  const limit = rateLimit(state.archive.lastWebhookAttemptAt)
  const mobile = attemptsFor(state.archive.snapshots, HOME, 'mobile')
  const desktop = attemptsFor(state.archive.snapshots, HOME, 'desktop')
  const mobileScore = lastSuccess(mobile)
  const desktopScore = lastSuccess(desktop)
  const latest = state.archive.snapshots[0]

  return (
    <>
      <PageHead
        kicker="Command"
        title="This cycle"
        lede="Charter, the next commitment, device performance, and the written quota plan. Shipping stays in Nobita’s queue."
      />
      <p className="meta-line">
        {CHARTER.site} · {CHARTER.cadence} · Operating record {OPERATIONAL_AS_OF}
      </p>
      <section className="glance" aria-label="Director glance">
        <article className="tile">
          <p className="kicker">Status</p>
          <p className="tile-value">{locked ? 'Locked' : 'Open'}</p>
          <p className="tile-sub">{locked ? 'Shipping starts Mon 16 Nov, 10:00 IST' : 'Shipping is through Nobita’s write queue'}</p>
          <p className="fine">Charter {CHARTER.window}. {OPERATIONAL_SOURCE}.</p>
        </article>
        <article className="tile">
          <p className="kicker">Due next</p>
          <p className="tile-value">{upcoming ? formatIst(upcoming.at).replace(', ', ' · ') : 'Charter closed'}</p>
          <p className="tile-sub">{upcoming?.label ?? 'No later milestone is recorded.'}</p>
          <p className="fine">{upcoming?.detail}</p>
        </article>
        <article className="tile">
          <p className="kicker">Mobile · home</p>
          <Score attempt={mobileScore} latestFailed={mobile[0] && !mobile[0].ok ? mobile[0] : null} />
        </article>
        <article className="tile">
          <p className="kicker">Desktop · home</p>
          <Score attempt={desktopScore} latestFailed={desktop[0] && !desktop[0].ok ? desktop[0] : null} />
        </article>
        <article className="tile">
          <p className="kicker">Quota plan</p>
          <p className="tile-value">{QUOTA.cap}% cap</p>
          <p className="tile-sub">{QUOTA.reserve}% reserve · reset {QUOTA.reset}</p>
          <p className="fine">{QUOTA.label}. Window {QUOTA.window}.</p>
        </article>
        <article className="tile">
          <p className="kicker">Freshness</p>
          <p className="tile-value">{latest ? 'Reading stored' : 'No reading yet'}</p>
          <p className="tile-sub">Last updated {latest ? formatIst(latest.finishedAt) : '— waiting for the hourly job'}</p>
          <p className="fine">Next automatic refresh {formatIst(nextCron(now))}. Vercel Cron only. Store: {state.persistence}.</p>
          <UpdateNow limited={limit.limited} retryAt={limit.retryAt} />
        </article>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Locked this cycle</h2>
          <p>Three items. No fourth this week.</p>
        </div>
        <WorkTable items={WORK} />
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Calendar</h2>
          <p>Asia/Calcutta</p>
        </div>
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
      {state.error ? <p className="fine">Snapshot store: {state.error}</p> : null}
      <Foot />
    </>
  )
}

function Score({
  attempt,
  latestFailed,
}: {
  attempt: { scores?: { performance?: number }; fetchedAt: string } | null
  latestFailed: { error?: string; fetchedAt: string } | null
}) {
  const score = attempt?.scores?.performance
  if (!attempt || typeof score !== 'number') {
    return (
      <>
        <p className="tile-value">Unmeasured</p>
        <p className="fine">
          {latestFailed?.error
            ? `${latestFailed.error} · ${formatIst(latestFailed.fetchedAt)}`
            : 'PageSpeed Insights has not stored a score for kalki-intelligence.in.'}
        </p>
      </>
    )
  }
  return (
    <>
      <p className="tile-value">{score}</p>
      <p className="tile-sub">
        <Chip tone="good">PSI performance</Chip>
      </p>
      <p className="fine">
        PageSpeed Insights lab · {formatIst(attempt.fetchedAt)}
        {latestFailed ? ` · latest attempt failed ${formatIst(latestFailed.fetchedAt)}` : ''}
      </p>
    </>
  )
}
