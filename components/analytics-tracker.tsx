'use client'

import { useEffect } from 'react'

function inferDeviceType(userAgent: string) {
  if (/mobile|android|iphone|ipad/i.test(userAgent)) return 'mobile'
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  return 'desktop'
}

function inferOS(userAgent: string) {
  if (/windows/i.test(userAgent)) return 'Windows'
  if (/mac os/i.test(userAgent)) return 'macOS'
  if (/android/i.test(userAgent)) return 'Android'
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS'
  if (/linux/i.test(userAgent)) return 'Linux'
  return 'unknown'
}

function inferBrowser(userAgent: string) {
  if (/edg/i.test(userAgent)) return 'Edge'
  if (/chrome|crios/i.test(userAgent)) return 'Chrome'
  if (/safari/i.test(userAgent)) return 'Safari'
  if (/firefox/i.test(userAgent)) return 'Firefox'
  if (/opr/i.test(userAgent)) return 'Opera'
  return 'unknown'
}

export function AnalyticsTracker() {
  useEffect(() => {
    const track = async () => {
      try {
        if (window.location.pathname.startsWith('/admin')) return

        const userAgent = navigator.userAgent
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: window.location.pathname,
            referrer: document.referrer || 'direct',
            userAgent,
            deviceType: inferDeviceType(userAgent),
            os: inferOS(userAgent),
            browser: inferBrowser(userAgent),
          }),
        })
      } catch {
        // no-op: tracking should not block the page
      }
    }

    track()
  }, [])

  return null
}
