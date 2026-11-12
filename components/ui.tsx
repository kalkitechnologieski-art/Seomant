import Link from 'next/link'
import { formatIst } from '@/lib/time'
import type { WorkItem, WorkStatus } from '@/lib/facts'

export function PageHead({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  return (
    <header className="page-head">
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
    </header>
  )
}

export function Chip({ children, tone = 'cyan' }: { children: string; tone?: 'cyan' | 'amber' | 'magenta' | 'good' | 'danger' }) {
  return (
    <span className="chip" data-tone={tone}>
      <i aria-hidden="true" />
      {children}
    </span>
  )
}

export function toneFor(status: WorkStatus): 'amber' | 'cyan' | 'magenta' {
  if (status.startsWith('Approved')) return 'amber'
  if (status.startsWith('Decided')) return 'cyan'
  return 'magenta'
}

export function Spark({ points, label }: { points: { t: string; v: number }[]; label: string }) {
  if (points.length < 2) return null
  const width = 320
  const height = 78
  const min = Math.min(...points.map((point) => point.v))
  const max = Math.max(...points.map((point) => point.v))
  const span = max - min || 1
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * (width - 12) + 6
      const y = height - 10 - ((point.v - min) / span) * (height - 22)
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
  const latest = points[points.length - 1]
  return (
    <figure className="spark">
      <figcaption>
        {label}
        <br />
        Latest {latest.v} · {formatIst(latest.t)} · {points.length} readings
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        <path d={path} />
      </svg>
    </figure>
  )
}

export function WorkTable({ items }: { items: WorkItem[] }) {
  return (
    <div className="sheet-wrap">
      <table className="sheet">
        <thead>
          <tr>
            <th>Work</th>
            <th>Owner</th>
            <th>Accountable</th>
            <th>Status</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <Link href={`/pipeline/${item.id}`}>{item.title}</Link>
                <p className="fine">{item.domain}</p>
              </td>
              <td>{item.owner}</td>
              <td>{item.accountable}</td>
              <td>
                <Chip tone={toneFor(item.status)}>{item.status}</Chip>
              </td>
              <td>{item.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Foot() {
  return (
    <p className="footer-note">
      Internal board for KALKI Intelligence, Indore. Every figure is a measured reading or a dated operating record.
      Rankings, traffic, and citations are never a promise. Source time is Asia/Calcutta.
    </p>
  )
}
