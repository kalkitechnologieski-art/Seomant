import type { Metadata } from 'next'
import { Foot, PageHead } from '@/components/ui'
import { DECISIONS, OPERATIONAL_SOURCE } from '@/lib/facts'

export const metadata: Metadata = { title: 'Decisions' }
export const revalidate = 3600

export default function DecisionsPage() {
  return (
    <>
      <PageHead
        kicker="CRM"
        title="Decision log"
        lede="Accepted scope, earned links, measured rankings, and the closed n8n and VPS path."
      />
      <div className="stack">
        {DECISIONS.map((decision) => (
          <article className="log" key={decision.id}>
            <time>{decision.at}</time>
            <h2>{decision.title}</h2>
            <p>{decision.body}</p>
            <p className="fine">{OPERATIONAL_SOURCE}</p>
          </article>
        ))}
      </div>
      <Foot />
    </>
  )
}
