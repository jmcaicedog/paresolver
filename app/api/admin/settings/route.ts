import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth'
import { ensureSchema, getAdminUserById, getSiteSetting, setSiteSetting } from '@/lib/db'
import {
  AGENT_NOTIFICATION_EMAILS_SETTING_KEY,
  areValidNotificationEmails,
  DEFAULT_HOME_VIDEO_URL,
  getYouTubeVideoId,
  HOME_VIDEO_SETTING_KEY,
  normalizeNotificationEmails,
  NOTIFICATION_EMAILS_SETTING_KEY,
  parseNotificationEmails,
} from '@/lib/site-settings'

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
    const notificationEmails = parseNotificationEmails(await getSiteSetting(NOTIFICATION_EMAILS_SETTING_KEY))
    const agentNotificationEmails = parseNotificationEmails(await getSiteSetting(AGENT_NOTIFICATION_EMAILS_SETTING_KEY))
    return NextResponse.json({ videoUrl, notificationEmails, agentNotificationEmails })
  } catch {
    return NextResponse.json({ message: 'No se pudo cargar la configuración.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await getAuthenticatedUser())) {
      return NextResponse.json({ message: 'No autorizado.' }, { status: 401 })
    }

    const body = (await request.json()) as { videoUrl?: string; notificationEmails?: string[]; agentNotificationEmails?: string[] }

    if (body.videoUrl !== undefined) {
      const videoUrl = body.videoUrl.trim()
      if (!videoUrl || !getYouTubeVideoId(videoUrl)) {
        return NextResponse.json({ message: 'Ingresa un enlace válido de YouTube.' }, { status: 400 })
      }

      const setting = await setSiteSetting(HOME_VIDEO_SETTING_KEY, videoUrl)
      return NextResponse.json({ videoUrl: setting.value })
    }

    if (body.notificationEmails !== undefined) {
      if (!Array.isArray(body.notificationEmails)) {
        return NextResponse.json({ message: 'La lista de correos no es válida.' }, { status: 400 })
      }

      const notificationEmails = normalizeNotificationEmails(body.notificationEmails)
      if (!areValidNotificationEmails(notificationEmails)) {
        return NextResponse.json({ message: 'Ingresa entre 1 y 10 correos electrónicos válidos.' }, { status: 400 })
      }

      await setSiteSetting(NOTIFICATION_EMAILS_SETTING_KEY, JSON.stringify(notificationEmails))
      return NextResponse.json({ notificationEmails })
    }

    if (body.agentNotificationEmails !== undefined) {
      if (!Array.isArray(body.agentNotificationEmails)) {
        return NextResponse.json({ message: 'La lista de correos de Agente no es válida.' }, { status: 400 })
      }

      const agentNotificationEmails = normalizeNotificationEmails(body.agentNotificationEmails)
      if (!areValidNotificationEmails(agentNotificationEmails)) {
        return NextResponse.json({ message: 'Ingresa entre 1 y 10 correos electrónicos válidos para Agente.' }, { status: 400 })
      }

      await setSiteSetting(AGENT_NOTIFICATION_EMAILS_SETTING_KEY, JSON.stringify(agentNotificationEmails))
      return NextResponse.json({ agentNotificationEmails })
    }

    return NextResponse.json({ message: 'No se recibió ninguna configuración.' }, { status: 400 })
  } catch {
    return NextResponse.json({ message: 'No se pudo guardar la configuración.' }, { status: 500 })
  }
}