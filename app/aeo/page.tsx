import type { Metadata } from 'next'
import Link from 'next/link'
import { Chip, Foot, PageHead, toneFor } from '@/components/ui'
import { OPERATIONAL_AS_OF, WORK } from '@/lib/facts'

export const metadata: Metadata = { title: 'AEO' }
export const revalidate = 3600

export default function AeoPage() {
  return (
    <>
      <PageHead
        kicker="AEO"
        title="Answer readiness"
        lede="What the site can honestly answer, whether schema matches the copy, and which AEO work is still in flight. Coverage scores appear only from a measured pass."
      />
      <section className="stack">
        {WORK.map((item) => (
          <article className="panel" key={item.id}>
            <p className="kicker">{item.domain}</p>
            <h2>
              <Link href={`/pipeline/${item.id}`}>{item.title}</Link>
            </h2>
            <p>
              <Chip tone={toneFor(item.status)}>{item.status}</Chip>
            </p>
            <p>{item.detail}</p>
            <p className="fine">
              Owner {item.owner} · Accountable {item.accountable} · {OPERATIONAL_AS_OF}
            </p>
          </article>
        ))}
        <article className="panel">
          <h2>Extractable answer coverage</h2>
          <p>Unmeasured. No coverage percentage is shown.</p>
        </article>
        <article className="panel">
          <h2>FAQ and schema alignment</h2>
          <p>
            The Enterprise SEO page must keep schema in agreement with the copy after Rank #1 language and unsubstantiated guarantees are removed. That change is approved and not shipped. No FAQ audit score is stored.
          </p>
        </article>
        <article className="panel">
          <h2>Questions the site can answer</h2>
          <p>Unmeasured. A question list appears only after a pass records questions that are actually on the page.</p>
        </article>
        <article className="panel">
          <h2>Citation of canonical pages</h2>
          <p>Unmeasured. No citation count is shown. Canonical targets for the in-flight pages are the Enterprise SEO offer and the marketing home.</p>
        </article>
      </section>
      <Foot />
    </>
  )
}
