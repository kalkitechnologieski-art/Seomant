import { NextResponse } from 'next/server'
import { tokensMatch } from '@/lib/gate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const gate = process.env.SEOMAN_GATE
  const form = await request.formData()
  const token = String(form.get('token') ?? '')
  if (!gate || !tokensMatch(token, gate)) {
    return NextResponse.redirect(new URL('/gate?e=1', request.url), 303)
  }
  const response = NextResponse.redirect(new URL('/', request.url), 303)
  response.cookies.set('seoman_gate', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
