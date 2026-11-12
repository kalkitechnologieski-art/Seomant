import type { Metadata } from 'next'
import { Foot, PageHead } from '@/components/ui'
import { CHARTER, OPERATIONAL_SOURCE, TEAM, WORK } from '@/lib/facts'

export const metadata: Metadata = { title: 'Team' }
export const revalidate = 3600

export default function TeamPage() {
  return (
    <>
      <PageHead
        kicker="CRM"
        title="Directory and RACI"
        lede="Named seats from the operating brief. A responsibility is listed only where that brief assigns it."
      />
      <p className="meta-line">
        Site {CHARTER.site} · Repo {CHARTER.repo} · {CHARTER.cadence}
      </p>
      <section className="people">
        {TEAM.map((person) => (
          <article className="person" key={person.name}>
            <p className="kicker">{person.role}</p>
            <h2>{person.name}</h2>
            <p>{person.line}</p>
            <p>{person.focus}</p>
          </article>
        ))}
      </section>
      <section className="section">
        <div className="section-head">
          <h2>RACI for locked work</h2>
          <p>{OPERATIONAL_SOURCE}</p>
        </div>
        <div className="sheet-wrap">
          <table className="sheet">
            <thead>
              <tr>
                <th>Work</th>
                <th>Responsible</th>
                <th>Accountable</th>
                <th>Consulted</th>
                <th>Informed</th>
              </tr>
            </thead>
            <tbody>
              {WORK.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.owner}</td>
                  <td>{item.accountable}</td>
                  <td>{item.consulted}</td>
                  <td>{item.informed}</td>
                </tr>
              ))}
              <tr>
                <td>Weekly quota plan</td>
                <td>Mitsi</td>
                <td>KALKI</td>
                <td>Not recorded</td>
                <td>Nobita reports to KALKI on the write queue, separately</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <Foot />
    </>
  )
}
