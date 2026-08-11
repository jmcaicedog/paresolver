import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminUserByEmail, ensureDefaultAdmin } from '@/lib/db'
import { setSessionCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = (body.email ?? '').trim().toLowerCase()
    const password = (body.password ?? '').trim()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email y contraseña son obligatorios.' }, { status: 400 })
    }

    await ensureDefaultAdmin()
    const user = await getAdminUserByEmail(email)
    if (!user) {
      return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 })
    }

    const matches = await bcrypt.compare(password, user.password_hash)
    if (!matches) {
      return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    setSessionCookie(response, String(user.id))
    return response
  } catch {
    return NextResponse.json({ message: 'No se pudo iniciar sesión.' }, { status: 500 })
  }
}
