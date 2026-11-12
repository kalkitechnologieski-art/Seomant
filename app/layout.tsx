import type { Metadata } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { IstClock } from '@/components/clock'
import { Shell } from '@/components/shell'
import { formatIst } from '@/lib/time'
import './globals.css'

const sans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif' })

export const metadata: Metadata = {
  title: { default: 'Seoman', template: '%s · Seoman' },
  description: 'Internal SEO, AEO, and GEO command board by KALKI Intelligence.',
  robots: { index: false, follow: false, nocache: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const renderedAt = new Date()
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body>
        <Shell clock={<IstClock initial={formatIst(renderedAt)} iso={renderedAt.toISOString()} />}>{children}</Shell>
      </body>
    </html>
  )
}
