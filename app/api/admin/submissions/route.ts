import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminUserById, getFormSubmissions } from '@/lib/db'
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
    const search = url.searchParams.get('search') ?? ''
    const from = url.searchParams.get('from') ?? ''
    const to = url.searchParams.get('to') ?? ''
    const type = url.searchParams.get('type') ?? 'all'

    const rows = await getFormSubmissions({ search, from, to, type })

    return NextResponse.json({ items: rows })
  } catch {
    return NextResponse.json({ message: 'No se pudo consultar los formularios.' }, { status: 500 })
  }
}
