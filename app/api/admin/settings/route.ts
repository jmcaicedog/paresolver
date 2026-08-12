import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth'
import { ensureSchema, getAdminUserById, getSiteSetting, setSiteSetting } from '@/lib/db'
import { DEFAULT_HOME_VIDEO_URL, getYouTubeVideoId, HOME_VIDEO_SETTING_KEY } from '@/lib/site-settings'

async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const session = verifySession(cookieStore.get(SESSION_COOKIE_NAME)?.value)
  if (!session) return null
  return getAdminUserById(session.userId)
}

export async function GET() {
  try {
    if (!(await getAuthenticatedUser())) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 })
    }

    await ensureSchema()
    const videoUrl = (await getSiteSetting(HOME_VIDEO_SETTING_KEY)) ?? DEFAULT_HOME_VIDEO_URL
    return NextResponse.json({ videoUrl })
  } catch {
    return NextResponse.json({ message: 'No se pudo cargar la configuración.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await getAuthenticatedUser())) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 })
    }

    const body = (await request.json()) as { videoUrl?: string }
    const videoUrl = (body.videoUrl ?? '').trim()

    if (!videoUrl || !getYouTubeVideoId(videoUrl)) {
      return NextResponse.json({ message: 'Ingresa un enlace válido de YouTube.' }, { status: 400 })
    }

    const setting = await setSiteSetting(HOME_VIDEO_SETTING_KEY, videoUrl)
    return NextResponse.json({ videoUrl: setting.value })
  } catch {
    return NextResponse.json({ message: 'No se pudo guardar la configuración.' }, { status: 500 })
  }
}