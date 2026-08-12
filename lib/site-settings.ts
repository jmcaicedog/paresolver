export const HOME_VIDEO_SETTING_KEY = 'home_video_url'
export const DEFAULT_HOME_VIDEO_URL = 'https://www.youtube.com/watch?v=ScMzIvxBSi4'
export const NOTIFICATION_EMAILS_SETTING_KEY = 'notification_emails'
export const AGENT_NOTIFICATION_EMAILS_SETTING_KEY = 'agent_notification_emails'
export const DEFAULT_NOTIFICATION_EMAILS = ['prestamos@caguascoop.com', 'ernesto@altacommunication.net']

export function normalizeNotificationEmails(values: string[]) {
  return [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))]
}

export function areValidNotificationEmails(values: string[]) {
  return values.length > 0 && values.length <= 10 && values.every((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
}

export function parseNotificationEmails(value: string | null) {
  if (!value) return DEFAULT_NOTIFICATION_EMAILS

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return DEFAULT_NOTIFICATION_EMAILS
    const emails = normalizeNotificationEmails(parsed.filter((item): item is string => typeof item === 'string'))
    return areValidNotificationEmails(emails) ? emails : DEFAULT_NOTIFICATION_EMAILS
  } catch {
    return DEFAULT_NOTIFICATION_EMAILS
  }
}

export function getYouTubeVideoId(value: string) {
  let videoId: string | null = null

  try {
    const url = new URL(value.trim())
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')

    if (hostname === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] ?? null
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com' || hostname === 'youtube-nocookie.com') {
      if (url.pathname === '/watch') videoId = url.searchParams.get('v')
      const [section, pathVideoId] = url.pathname.split('/').filter(Boolean)
      if (['embed', 'shorts', 'live'].includes(section)) videoId = pathVideoId ?? null
    }
  } catch {
    return null
  }

  return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : null
}