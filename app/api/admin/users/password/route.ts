import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { setAdminPassword, getAdminUserById } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth'

export async function POST(request: Request) {
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

    const body = (await request.json()) as { password?: string }
    const password = (body.password ?? '').trim()

    if (!password) {
      return NextResponse.json({ message: 'La contraseña es obligatoria.' }, { status: 400 })
    }

    await setAdminPassword(session.userId, password)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: 'No se pudo actualizar la contraseña.' }, { status: 500 })
  }
}
