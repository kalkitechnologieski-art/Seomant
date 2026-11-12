'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const NAV = [
  ['/', 'Command'],
  ['/seo', 'SEO'],
  ['/aeo', 'AEO'],
  ['/geo', 'GEO'],
  ['/pipeline', 'Pipeline'],
  ['/team', 'Team'],
  ['/decisions', 'Decisions'],
  ['/quota', 'Quota'],
  ['/activity', 'Activity'],
] as const

export function Shell({ clock, children }: { clock: ReactNode; children: ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/gate') return <>{children}</>
  const current = NAV.find((item) => (item[0] === '/' ? pathname === '/' : pathname.startsWith(item[0])))
  return (
    <div className="app">
      <aside className="rail">
        <Link className="brand" href="/">
          <span className="brand-mark">SEOMAN</span>
          <span className="brand-by">by KALKI Intelligence</span>
        </Link>
        <nav className="nav" aria-label="Board">
          {NAV.map(([href, label], index) => (
            <Link key={href} href={href} aria-current={current?.[0] === href ? 'page' : undefined}>
              {label}
              <span>{String(index + 1).padStart(2, '0')}</span>
            </Link>
          ))}
        </nav>
        <p className="quiet">Temple of technology</p>
      </aside>
      <div className="stage">
        <header className="topbar">
          <p>{current?.[1] ?? 'Seoman'} · internal board</p>
          {clock}
        </header>
        <main className="canvas">{children}</main>
      </div>
    </div>
  )
}
