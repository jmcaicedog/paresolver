import { NextResponse } from 'next/server'
import { savePageView } from '@/lib/db'

function resolveCountry(request: Request) {
  const headers = request.headers
  const country = headers.get('x-vercel-ip-country') ?? headers.get('cf-ipcountry') ?? 'unknown'
  return country === 'unknown' ? 'unknown' : country.toUpperCase()
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      path?: string
      referrer?: string
      userAgent?: string
      country?: string
      deviceType?: string
      os?: string
      browser?: string
    }

    await savePageView({
      path: body.path ?? '/',
      referrer: body.referrer,
      userAgent: body.userAgent,
      country: body.country ?? resolveCountry(request),
      deviceType: body.deviceType,
      os: body.os,
      browser: body.browser,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: 'No se pudo guardar la visita.' }, { status: 500 })
  }
}
