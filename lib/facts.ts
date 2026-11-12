export const OPERATIONAL_AS_OF = '12 Nov 2026, late morning IST'
export const OPERATIONAL_SOURCE = 'Operating brief verified 12 Nov 2026, late morning IST'

export type WorkStatus = 'Approved — not shipped' | 'Decided — not started' | 'Proposed — accepted as proposed'

export type WorkItem = {
  id: string
  domain: 'SEO' | 'AEO' | 'GEO'
  title: string
  detail: string
  owner: string
  accountable: string
  consulted: string
  informed: string
  status: WorkStatus
  start: string
  due: string
  demo: string
}

export const WORK: WorkItem[] = [
  {
    id: 'enterprise-seo-copy',
    domain: 'AEO',
    title: 'Enterprise SEO page — remove Rank #1 and unsubstantiated guarantees',
    detail:
      'suniyo and Sizuka QA the Enterprise SEO page. Remove Rank #1 and unsubstantiated guarantees. Keep the starting price and ₹0 advance as two separate facts. Design stays unchanged. Schema must agree with the copy. Founder approved. Not yet shipped.',
    owner: 'suniyo and Sizuka',
    accountable: 'Nobita, through the single write queue',
    consulted: 'Founder — approved',
    informed: 'Tiger team at the Friday demo',
    status: 'Approved — not shipped',
    start: 'Mon 16 Nov 2026, 10:00 IST',
    due: 'Fri 20 Nov 2026, 17:00 IST',
    demo: 'Fri 20 Nov 2026, 17:00 IST',
  },
  {
    id: 'chat-sitemap',
    domain: 'SEO',
    title: '/chat is noindex and still listed in sitemap.xml',
    detail:
      'Sizuka: /chat is noindex but present in sitemap.xml. If it is excluded, remove only the sitemap entry, keep noindex, and verify the live response. Team decision. Not started. This row is the operating record, not a fresh crawl by this board.',
    owner: 'Sizuka',
    accountable: 'Nobita, through the single write queue',
    consulted: 'Team decision, 12 Nov 2026',
    informed: 'Tiger team',
    status: 'Decided — not started',
    start: 'Mon 16 Nov 2026, 10:00 IST',
    due: 'No separate due date recorded. Review at the Fri 20 Nov 2026, 17:00 IST demo.',
    demo: 'Fri 20 Nov 2026, 17:00 IST',
  },
  {
    id: 'entity-map',
    domain: 'GEO',
    title: 'Entity map from home, about, and contact',
    detail:
      'Giaan drafts the entity map from home, about, and contact. Unverified claims stay off live schema: foundingDate 2025-01-01, a founder person, LLP registration, coordinates, and LinkedIn or X sameAs. Proposed. Nobita accepted it as proposed.',
    owner: 'Giaan',
    accountable: 'Nobita',
    consulted: 'Nobita accepted the proposal',
    informed: 'Tiger team',
    status: 'Proposed — accepted as proposed',
    start: 'Mon 16 Nov 2026, 10:00 IST',
    due: 'No separate due date recorded. Review at the Fri 20 Nov 2026, 17:00 IST demo.',
    demo: 'Fri 20 Nov 2026, 17:00 IST',
  },
]

export const TEAM = [
  {
    name: 'Nobita',
    role: 'Tiger Team Lead',
    line: 'Single write queue. Reports to KALKI.',
    focus: 'Nothing in this cycle ships except through this queue, and not before Mon 16 Nov 2026, 10:00 IST.',
  },
  {
    name: 'Giaan',
    role: 'SEO and AI Search Strategy Lead',
    line: 'Reporting line beyond the write queue is not recorded.',
    focus: 'Entity map from home, about, and contact. Proposed work only.',
  },
  {
    name: 'Sizuka',
    role: 'Technical AEO/GEO Engineer',
    line: 'Reporting line beyond the write queue is not recorded.',
    focus: 'Enterprise SEO schema QA with suniyo, and the /chat sitemap decision.',
  },
  {
    name: 'suniyo',
    role: 'AEO Content Lead',
    line: 'Reporting line beyond the write queue is not recorded.',
    focus: 'Enterprise SEO copy QA with Sizuka.',
  },
  {
    name: 'Bramha',
    role: 'Citation Analyst',
    line: 'Digital PR drafts only. No locked item this week.',
    focus: 'Drafts only. No live claim is added from this seat.',
  },
  {
    name: 'Mitsi',
    role: 'Senior Quota Manager',
    line: 'Reports only to KALKI.',
    focus: 'Weekly quota plan. Allocation below is a written plan, not a live usage meter.',
  },
] as const

export const QUOTA_BANDS = [
  { name: 'Founder / KALKI', share: 15, note: 'Named allocation.' },
  { name: 'SEO tiger team', share: 15, note: 'Monday and Friday only.' },
  { name: 'Koyal', share: 10, note: 'Paused. Delivery role is not restated on this board.' },
  { name: 'Contingency', share: 8, note: 'Held inside the operating cap.' },
  { name: 'RAAMU', share: 6, note: 'First assignment complete. Delivery role is not restated on this board.' },
  { name: 'Gopu', share: 4, note: 'Paused. Delivery role is not restated on this board.' },
  { name: 'Mitsi', share: 2, note: 'Senior Quota Manager.' },
] as const

export const QUOTA = {
  window: '12–19 Nov 2026',
  cap: 60,
  reserve: 40,
  reset: 'Thu 19 Nov 2026, 11:25 IST',
  label: 'Written plan, not a live usage reading',
}

export const DECISIONS = [
  {
    id: 'D1',
    at: '12 Nov 2026',
    title: 'Four scope templates accepted',
    body: '₹0 advance is not free work. Payment terms are the terms in the approved quote. The quote amount is not restated here.',
  },
  {
    id: 'D2',
    at: '12 Nov 2026',
    title: 'Link building is earned only',
    body: 'SEO link building is earned. This board does not treat links as a purchased promise.',
  },
  {
    id: 'D3',
    at: '12 Nov 2026',
    title: 'Rankings in reports are measured results',
    body: 'A ranking in a report is a measured result. It is never a promise of position.',
  },
  {
    id: 'D4',
    at: '12 Nov 2026',
    title: 'n8n and VPS management is closed',
    body: 'This cycle does not run n8n or a VPS. Refresh stays on Vercel.',
  },
  {
    id: 'D5',
    at: '12 Nov 2026',
    title: 'Enterprise SEO copy is approved and unshipped',
    body: 'Founder approved the copy and schema correction. Shipping waits for Nobita’s write queue after Mon 16 Nov 2026, 10:00 IST.',
  },
  {
    id: 'D6',
    at: '12 Nov 2026',
    title: 'Entity map accepted as proposed',
    body: 'Nobita accepted Giaan’s entity map as proposed. Unverified claims stay off live schema.',
  },
] as const

export const MILESTONES = [
  { at: '2026-11-13T17:00:00+05:30', label: 'Thin kickoff', detail: 'Friday cadence. Shipping does not start here.' },
  { at: '2026-11-16T10:00:00+05:30', label: 'First formal plan', detail: 'Shipping may start, only through Nobita’s write queue.' },
  { at: '2026-11-19T11:25:00+05:30', label: 'Quota reset', detail: 'End of the 12–19 Nov written plan.' },
  { at: '2026-11-20T17:00:00+05:30', label: 'Cycle demo', detail: 'Enterprise SEO QA is the named demo item.' },
  { at: '2027-05-12T23:59:00+05:30', label: 'Charter ends', detail: 'Charter window 12 Nov 2026–12 May 2027.' },
] as const

export const HELD_OFF_SCHEMA = [
  'foundingDate 2025-01-01',
  'Founder as a person entity',
  'LLP registration',
  'Geographic coordinates',
  'LinkedIn or X sameAs',
] as const

export const MEASUREMENT_TARGETS = [
  {
    url: 'https://kalki-intelligence.in',
    name: 'Marketing home',
    note: 'Primary reading for the command view.',
  },
  {
    url: 'https://kalki-intelligence.in/marketplace/Marketing/enterprise-seo',
    name: 'Enterprise SEO offer',
    note: 'Copy and schema QA is locked and unshipped.',
  },
  {
    url: 'https://www.kalki-intelligence.in/chat',
    name: 'Chat',
    note: 'Recorded 12 Nov 2026 as noindex and still present in sitemap.xml. The hourly job measures speed only.',
  },
] as const

export const CHARTER = {
  window: '12 Nov 2026 – 12 May 2027',
  site: 'https://kalki-intelligence.in',
  repo: 'https://github.com/kalkitechnologieski-art/kalkios',
  cadence: 'Monday 10:00 IST plan. Friday 17:00 IST demo.',
  shippingLock: '2026-11-16T10:00:00+05:30',
}

export function nextMilestone(now = new Date()) {
  return MILESTONES.find((item) => new Date(item.at).getTime() > now.getTime()) ?? null
}

export function shippingLocked(now = new Date()) {
  return now.getTime() < new Date(CHARTER.shippingLock).getTime()
}

export function quotaShareTotal() {
  return QUOTA_BANDS.reduce((sum, band) => sum + band.share, 0)
}
