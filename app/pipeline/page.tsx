import type { Metadata } from 'next'
import Link from 'next/link'
import { Foot, PageHead, WorkTable } from '@/components/ui'
import { WORK } from '@/lib/facts'

export const metadata: Metadata = { title: 'Pipeline' }
export const revalidate = 3600

const FILTERS = ['All', 'SEO', 'AEO', 'GEO'] as const

export default async function PipelinePage({ searchParams }: { searchParams: Promise<{ domain?: string }> }) {
  const params = await searchParams
  const domain = FILTERS.find((item) => item.toLowerCase() === (params.domain ?? '').toLowerCase()) ?? 'All'
  const items = domain === 'All' ? WORK : WORK.filter((item) => item.domain === domain)
  return (
    <>
      <PageHead
        kicker="CRM"
        title="Write queue"
        lede="Owner, accountable lead, status, and due date for the three locked items. Shipping starts only after Monday 16 Nov 2026, 10:00 IST, through Nobita."
      />
      <div className="filters">
        {FILTERS.map((item) => (
          <Link key={item} href={item === 'All' ? '/pipeline' : `/pipeline?domain=${item}`} aria-current={domain === item ? 'page' : undefined}>
            {item}
          </Link>
        ))}
      </div>
      <WorkTable items={items} />
      <Foot />
    </>
  )
}
