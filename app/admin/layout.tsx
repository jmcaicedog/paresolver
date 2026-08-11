import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token || !verifySession(token)) {
    redirect('/admin/login')
  }

  return <div className="min-h-screen bg-slate-950 text-slate-50">{children}</div>
}
