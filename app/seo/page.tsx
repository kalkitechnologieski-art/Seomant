import type { Metadata } from 'next'
import { Chip, Foot, PageHead, Spark } from '@/components/ui'
import { MEASUREMENT_TARGETS, OPERATIONAL_AS_OF, WORK } from '@/lib/facts'
import { readArchiveState } from '@/lib/store'
import { formatCls, formatIst, formatMs } from '@/lib/time'
import { attemptsFor, canChart, labSeries, lastSuccess, metricSeries } from '@/lib/view'
import type { PageAttempt } from '@/lib/types'

export const metadata: Metadata = { title: 'SEO' }
export const revalidate = 3600

const METRICS = [
  ['performance', 'Performance'],
  ['accessibility', 'Accessibility'],
  ['bestPractices', 'Best practices'],
  ['seo', 'SEO category'],
] as const

export default async function SeoPage() {
  const state = await readArchiveState()
  const sitemap = WORK.find((item) => item.id === 'chat-sitemap')
  const charts = MEASUREMENT_TARGETS.flatMap((target) =>
    (['mobile', 'desktop'] as const).flatMap((strategy) => {
      const attempts = attemptsFor(state.archive.snapshots, target.url, strategy)
      return METRICS.flatMap(([key, label]) => {
        const points = metricSeries(attempts, key)
        return canChart(points) ? [{ key: `${target.url}-${strategy}-${key}`, label: `${target.name} · ${strategy} · ${label}`, points }] : []
      }).concat(
        canChart(labSeries(attempts, 'lcpMs'))
          ? [{ key: `${target.url}-${strategy}-lcp`, label: `${target.name} · ${strategy} · LCP lab`, points: labSeries(attempts, 'lcpMs').map((point) => ({ t: point.t, v: Math.round(point.v) })) }]
          : [],
      )
    }),
  )

  return (
    <>
      <PageHead
        kicker="SEO"
        title="Measurement desk"
        lede="Page inventory, device split, Core Web Vitals, and crawl hygiene. Query and ranking tables stay empty until a measured export exists."
      />
      <section className="section" style={{ marginTop: 0 }}>
        <div className="section-head">
          <h2>Device split</h2>
          <p>PageSpeed Insights · strategy=mobile and strategy=desktop</p>
        </div>
        <div className="stack">
          {MEASUREMENT_TARGETS.map((target) => (
            <article className="panel" key={target.url}>
              <h3>{target.name}</h3>
              <p className="fine">{target.url}</p>
              <p>{target.note}</p>
              <div className="split" style={{ marginTop: 12 }}>
                <Device attempts={attemptsFor(state.archive.snapshots, target.url, 'mobile')} strategy="mobile" />
                <Device attempts={attemptsFor(state.archive.snapshots, target.url, 'desktop')} strategy="desktop" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Charts</h2>
          <p>Drawn only after two successful readings of the same series</p>
        </div>
        {charts.length > 0 ? (
          <div className="chart-grid">
            {charts.map((chart) => (
              <Spark key={chart.key} label={chart.label} points={chart.points} />
            ))}
          </div>
        ) : (
          <p className="fine">No chart is drawn. The hourly job has not stored two successful readings for any series.</p>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Page inventory</h2>
          <p>The three URLs this board measures. Not a crawled catalogue.</p>
        </div>
        <div className="sheet-wrap">
          <table className="sheet">
            <thead>
              <tr>
                <th>Page</th>
                <th>URL</th>
                <th>Mobile</th>
                <th>Desktop</th>
              </tr>
            </thead>
            <tbody>
              {MEASUREMENT_TARGETS.map((target) => {
                const mobile = lastSuccess(attemptsFor(state.archive.snapshots, target.url, 'mobile'))
                const desktop = lastSuccess(attemptsFor(state.archive.snapshots, target.url, 'desktop'))
                return (
                  <tr key={target.url}>
                    <td>{target.name}</td>
                    <td>{target.url}</td>
                    <td>{summary(mobile)}</td>
                    <td>{summary(desktop)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section split">
        <article className="panel">
          <h2>Query inventory</h2>
          <p>No Search Console export is connected. Queries, impressions, clicks, and rankings are omitted.</p>
        </article>
        <article className="panel">
          <h2>Indexation and sitemap</h2>
          <p>
            <Chip tone="cyan">{sitemap?.status ?? 'Recorded'}</Chip>
          </p>
          <p>{sitemap?.detail}</p>
          <p className="fine">Operating record {OPERATIONAL_AS_OF}. The hourly job does not crawl the sitemap.</p>
        </article>
      </section>
      <Foot />
    </>
  )
}

function summary(attempt: PageAttempt | null) {
  if (!attempt?.scores) return 'Unmeasured'
  const parts = [
    typeof attempt.scores.performance === 'number' ? `Perf ${attempt.scores.performance}` : null,
    typeof attempt.lab?.lcpMs === 'number' ? `LCP ${formatMs(attempt.lab.lcpMs)}` : null,
    typeof attempt.lab?.cls === 'number' ? `CLS ${formatCls(attempt.lab.cls)}` : null,
    typeof attempt.lab?.inpMs === 'number' ? `INP ${formatMs(attempt.lab.inpMs)}` : null,
  ].filter(Boolean)
  return `${parts.join(' · ')} · ${formatIst(attempt.fetchedAt)}`
}

function Device({ attempts, strategy }: { attempts: PageAttempt[]; strategy: string }) {
  const latest = attempts[0]
  const success = lastSuccess(attempts)
  return (
    <div>
      <p className="kicker">{strategy}</p>
      {success?.scores ? (
        <ul className="facts">
          {METRICS.map(([key, label]) =>
            typeof success.scores?.[key] === 'number' ? (
              <li key={key}>
                {label} {success.scores[key]} <span className="mono">PSI lab · {formatIst(success.fetchedAt)}</span>
              </li>
            ) : null,
          )}
          {typeof success.lab?.lcpMs === 'number' ? <li>LCP {formatMs(success.lab.lcpMs)} lab</li> : null}
          {typeof success.lab?.cls === 'number' ? <li>CLS {formatCls(success.lab.cls)} lab</li> : null}
          {typeof success.lab?.inpMs === 'number' ? <li>INP {formatMs(success.lab.inpMs)} lab</li> : null}
          {typeof success.lab?.fcpMs === 'number' ? <li>FCP {formatMs(success.lab.fcpMs)} lab</li> : null}
          {typeof success.lab?.ttfbMs === 'number' ? <li>TTFB {formatMs(success.lab.ttfbMs)} lab</li> : null}
          {success.field ? (
            <li>
              CrUX {success.field.scope}
              {success.field.category ? ` ${success.field.category}` : ''}
              {typeof success.field.lcpMs === 'number' ? ` · LCP p75 ${formatMs(success.field.lcpMs)}` : ''}
              {typeof success.field.inpMs === 'number' ? ` · INP p75 ${formatMs(success.field.inpMs)}` : ''}
              {typeof success.field.clsPercentile === 'number' ? ` · CLS percentile ${success.field.clsPercentile}` : ''}
            </li>
          ) : (
            <li>No field data in this reading.</li>
          )}
        </ul>
      ) : (
        <p>Unmeasured.</p>
      )}
      {latest && !latest.ok ? (
        <p className="fine">
          Latest attempt failed · {latest.error} · {formatIst(latest.fetchedAt)}
          {latest.httpStatus ? ` · HTTP ${latest.httpStatus}` : ''}
        </p>
      ) : null}
    </div>
  )
}
