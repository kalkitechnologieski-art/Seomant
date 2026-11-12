import type { Metadata } from 'next'
import Link from 'next/link'
import { Foot, PageHead } from '@/components/ui'
import { QUOTA, QUOTA_BANDS } from '@/lib/facts'

export const metadata: Metadata = { title: 'Quota' }
export const revalidate = 3600

export default function QuotaPage() {
  return (
    <>
      <PageHead
        kicker="CRM"
        title="Quota as a resource"
        lede="The 12–19 Nov plan. Bars show the written allocation. They are not a live usage meter and they do not move when someone spends quota."
      />
      <section className="panel">
        <p className="kicker">{QUOTA.label}</p>
        <h2>
          {QUOTA.cap}% operating cap · {QUOTA.reserve}% reserve
        </h2>
        <div className="bands" aria-hidden="true">
          {QUOTA_BANDS.map((band) => (
            <span key={band.name} style={{ width: `${band.share}%` }} />
          ))}
          <span className="reserve" style={{ width: `${QUOTA.reserve}%` }} />
        </div>
        <ul className="band-list">
          {QUOTA_BANDS.map((band) => (
            <li key={band.name}>
              <strong>{band.name}</strong>
              <b>{band.share}%</b>
              <span>{band.note}</span>
            </li>
          ))}
          <li>
            <strong>Reserve</strong>
            <b>{QUOTA.reserve}%</b>
            <span>Outside the operating cap. Reset {QUOTA.reset}.</span>
          </li>
        </ul>
      </section>
      <section className="section panel">
        <h2>Two refresh paths</h2>
        <p>The hourly reading is a Vercel Cron job. It does not call Grok Bot and it does not spend assistant quota.</p>
        <p>
          Update now sits on the <Link href="/">command view</Link>. It is secondary, rate limited to one signed request every 15 minutes, and it talks to CEO KALKI only when WEBHOOK_URL is set. That path uses weekly quota.
        </p>
      </section>
      <Foot />
    </>
  )
}
