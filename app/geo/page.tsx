import type { Metadata } from 'next'
import Link from 'next/link'
import { Foot, PageHead } from '@/components/ui'
import { HELD_OFF_SCHEMA, OPERATIONAL_AS_OF, WORK } from '@/lib/facts'

export const metadata: Metadata = { title: 'GEO' }
export const revalidate = 3600

const entity = WORK.find((item) => item.id === 'entity-map')

export default function GeoPage() {
  return (
    <>
      <PageHead
        kicker="GEO"
        title="Generative visibility"
        lede="Prompt clusters and citation-to-canonical tracking stay blank until a real measurement is stored. Unverified claims remain off live schema."
      />
      <section className="split">
        <article className="panel">
          <h2>Held off live schema</h2>
          <ul className="facts">
            {HELD_OFF_SCHEMA.map((claim) => (
              <li key={claim}>{claim}</li>
            ))}
          </ul>
          <p className="fine">{OPERATIONAL_AS_OF}. These are exclusions, not published facts.</p>
        </article>
        <article className="panel">
          <h2>Entity map</h2>
          <p>
            <Link href="/pipeline/entity-map">{entity?.title}</Link>
          </p>
          <p>{entity?.detail}</p>
          <p className="fine">
            Owner {entity?.owner} · {entity?.status}
          </p>
        </article>
      </section>
      <section className="section">
        <div className="section-head">
          <h2>Prompt clusters</h2>
          <p>No measured prompts</p>
        </div>
        <div className="sheet-wrap">
          <table className="sheet">
            <thead>
              <tr>
                <th>Cluster</th>
                <th>Prompt</th>
                <th>Canonical target</th>
                <th>Citation measured</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5}>No prompt cluster has been measured. Rows will be added from a stored reading, not from a forecast.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="section">
        <article className="panel">
          <h2>AI presence</h2>
          <p>Unmeasured. Citation-to-canonical figures are omitted. Bramha’s seat is citation analysis and digital PR drafts only, with no locked item this week.</p>
        </article>
      </section>
      <Foot />
    </>
  )
}
