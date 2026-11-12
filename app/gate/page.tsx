import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Share token', robots: { index: false, follow: false } }

export default async function GatePage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const params = await searchParams
  return (
    <div className="gate">
      <form method="post" action="/api/gate">
        <p className="kicker">Seoman</p>
        <h1>Internal board</h1>
        <p className="lede">Enter the share token. This is not an account, and the board does not collect a password, card, or identity document.</p>
        {params.e ? <p className="fine">That token was not accepted.</p> : null}
        <input name="token" type="password" autoComplete="off" aria-label="Share token" required />
        <button className="button" type="submit">
          Continue
        </button>
      </form>
    </div>
  )
}
