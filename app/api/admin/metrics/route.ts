import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminUserById, getMetrics } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const session = verifySession(token)

    if (!session) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 })
    }

    const user = await getAdminUserById(session.userId)
    if (!user) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 })
    }

    const url = new URL(request.url)
    const from = url.searchParams.get('from') ?? ''
    const to = url.searchParams.get('to') ?? ''

    const metrics = await getMetrics({ from, to })
    return NextResponse.json({ metrics })
  } catch {
    return NextResponse.json({ message: 'No se pudo obtener las métricas.' }, { status: 500 })
  }
}
