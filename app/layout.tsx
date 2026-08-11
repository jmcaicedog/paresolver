import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { AnalyticsTracker } from '@/components/analytics-tracker'
import './globals.css'

export const metadata: Metadata = {
  title: 'Préstamos Personales desde $68.41 mensual | Pa\' Resolver - CAGUAS COOP',
  description:
    'Solicita tu préstamo personal con CAGUAS COOP desde $68.41 mensual. Pa\' Resolver lo que necesites. Solicita ahora, rápido y fácil.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0b5fd9',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/wdb5eza.css" />
      </head>
      <body className="font-sans antialiased">
        <AnalyticsTracker />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
