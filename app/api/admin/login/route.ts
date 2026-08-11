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
  } catch (error) {
    console.error('Error al iniciar sesión del admin:', error)

    const message = error instanceof Error && error.message.includes('SESSION_SECRET')
      ? 'Falta SESSION_SECRET en el entorno de producción.'
      : error instanceof Error && error.message.includes('ADMIN_EMAIL')
        ? 'Falta ADMIN_EMAIL o ADMIN_PASSWORD en el entorno de producción.'
        : 'No se pudo iniciar sesión.'

    return NextResponse.json({ message }, { status: 500 })
  }
}
