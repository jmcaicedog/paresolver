import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminUser, deleteAdminUser, getAdminUserByEmail, getAdminUserById, listAdminUsers } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth'

export async function GET() {
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

    const users = await listAdminUsers()
    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ message: 'No se pudo listar usuarios.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const session = verifySession(token)

    if (!session) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 })
    }

    const body = (await request.json()) as { email?: string; password?: string }
    const email = (body.email ?? '').trim().toLowerCase()
    const password = (body.password ?? '').trim()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email y contraseña son obligatorios.' }, { status: 400 })
    }

    const existing = await getAdminUserByEmail(email)
    if (existing) {
      return NextResponse.json({ message: 'Ya existe un usuario con ese correo.' }, { status: 409 })
    }

    const created = await createAdminUser(email, password)
    return NextResponse.json({ user: created }, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'No se pudo crear el usuario.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const session = verifySession(token)

    if (!session) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 })
    }

    const currentUser = await getAdminUserById(session.userId)
    if (!currentUser) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 })
    }

    const body = (await request.json()) as { id?: string }
    const targetUserId = body.id
    if (!targetUserId) {
      return NextResponse.json({ message: 'Debes indicar un usuario.' }, { status: 400 })
    }

    if (targetUserId === session.userId) {
      return NextResponse.json({ message: 'No puedes borrarte a ti mismo.' }, { status: 400 })
    }

    await deleteAdminUser(targetUserId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: 'No se pudo eliminar el usuario.' }, { status: 500 })
  }
}
