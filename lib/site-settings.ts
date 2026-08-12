export const HOME_VIDEO_SETTING_KEY = 'home_video_url'
export const DEFAULT_HOME_VIDEO_URL = 'https://www.youtube.com/watch?v=ScMzIvxBSi4'

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