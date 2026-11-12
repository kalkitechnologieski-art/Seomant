import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Chip, Foot, toneFor } from '@/components/ui'
import { OPERATIONAL_SOURCE, WORK } from '@/lib/facts'

export const revalidate = 3600

export function generateStaticParams() {
  return WORK.map((item) => ({ id: item.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const item = WORK.find((entry) => entry.id === id)
  return { title: item?.title ?? 'Work' }
}

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = WORK.find((entry) => entry.id === id)
  if (!item) notFound()
  const rows = [
    ['Domain', item.domain],
    ['Owner', item.owner],
    ['Accountable', item.accountable],
    ['Consulted', item.consulted],
    ['Informed', item.informed],
    ['Status', item.status],
    ['Start', item.start],
    ['Due', item.due],
    ['Demo', item.demo],
  ]
  return (
    <>
      <p className="kicker">Pipeline · {item.domain}</p>
      <h1>{item.title}</h1>
      <p className="lede">{item.detail}</p>
      <p>
        <Chip tone={toneFor(item.status)}>{item.status}</Chip>
      </p>
      <section className="panel" style={{ marginTop: 18 }}>
        <dl>
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="fine">{OPERATIONAL_SOURCE}</p>
      </section>
      <p className="fine">
        <Link href="/pipeline">Back to the queue</Link>
      </p>
      <Foot />
    </>
  )
}
