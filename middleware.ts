import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requestPassesGate } from '@/lib/gate'

export function middleware(request: NextRequest) {
  if (!process.env.SEOMAN_GATE) return NextResponse.next()
  const pathname = request.nextUrl.pathname
  if (
    pathname === '/gate' ||
    pathname.startsWith('/api/gate') ||
    pathname.startsWith('/api/cron') ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next()
  }
  if (requestPassesGate(request.headers.get('cookie'))) return NextResponse.next()
  const url = request.nextUrl.clone()
  url.pathname = '/gate'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
