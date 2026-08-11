'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json().catch(() => ({}))
    setLoading(false)

    if (!response.ok) {
      setError(data.message ?? 'Credenciales inválidas.')
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">Pa&apos; Resolver</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Panel administrativo</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0 transition focus:border-sky-400"
              placeholder="admin@paresolver.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0 transition focus:border-sky-400"
              placeholder="••••••••"
              required
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  )
}
