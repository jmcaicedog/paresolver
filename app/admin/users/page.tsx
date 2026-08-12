'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type AdminUser = {
  id: string
  email: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [notificationEmails, setNotificationEmails] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingVideo, setSavingVideo] = useState(false)
  const [savingEmails, setSavingEmails] = useState(false)

  async function loadUsers() {
    setLoading(true)
    const response = await fetch('/api/admin/users')
    if (response.status === 401) {
      router.push('/admin/login')
      return
    }
    const data = await response.json().catch(() => ({ users: [] }))
    setUsers(data.users ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
    fetch('/api/admin/settings')
      .then(async (response) => {
        if (response.status === 401) {
          router.push('/admin/login')
          return null
        }
        return response.json()
      })
      .then((data) => {
        if (data?.videoUrl) setVideoUrl(data.videoUrl)
        if (data?.notificationEmails) setNotificationEmails(data.notificationEmails.join('\n'))
      })
  }, [])

  async function handleVideoUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    setSavingVideo(true)

    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl }),
    })
    const data = await response.json().catch(() => ({}))
    setSavingVideo(false)

    if (response.status === 401) {
      router.push('/admin/login')
      return
    }
    if (!response.ok) {
      setError(data.message ?? 'No se pudo actualizar el video.')
      return
    }

    setVideoUrl(data.videoUrl)
    setMessage('Video del inicio actualizado correctamente.')
  }

  async function handleEmailsUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    setSavingEmails(true)

    const emails = notificationEmails.split(/[\n,;]+/).map((value) => value.trim()).filter(Boolean)
    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationEmails: emails }),
    })
    const data = await response.json().catch(() => ({}))
    setSavingEmails(false)

    if (response.status === 401) {
      router.push('/admin/login')
      return
    }
    if (!response.ok) {
      setError(data.message ?? 'No se pudieron actualizar los destinatarios.')
      return
    }

    setNotificationEmails(data.notificationEmails.join('\n'))
    setMessage('Correos de notificación actualizados correctamente.')
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(data.message ?? 'No se pudo crear el usuario.')
      return
    }

    setMessage('Usuario creado correctamente.')
    setEmail('')
    setPassword('')
    await loadUsers()
  }

  async function handleDelete(id: string) {
    const response = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(data.message ?? 'No se pudo eliminar el usuario.')
      return
    }

    setMessage('Usuario eliminado.')
    await loadUsers()
  }

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    const response = await fetch('/api/admin/users/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: currentPassword }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(data.message ?? 'No se pudo cambiar la contraseña.')
      return
    }

    setMessage('Contraseña actualizada.')
    setCurrentPassword('')
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Administración</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Configuración</h1>
          </div>
          <button type="button" onClick={() => router.push('/admin')} className="rounded-xl border border-slate-700 px-4 py-2 text-slate-100 hover:bg-slate-800">Volver</button>
        </header>

        {message ? <div className="rounded-xl border border-emerald-600/40 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null}
        {error ? <div className="rounded-xl border border-rose-600/40 bg-rose-600/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold text-white">Video del inicio</h2>
          <p className="mt-1 text-sm text-slate-400">El enlace guardado se mostrará en la sección de video de la página principal.</p>
          <form onSubmit={handleVideoUpdate} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="videoUrl" className="mb-2 block text-sm text-slate-300">Enlace de YouTube</label>
              <input
                id="videoUrl"
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-sky-500"
              />
            </div>
            <button type="submit" disabled={savingVideo} className="rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60">
              {savingVideo ? 'Guardando…' : 'Guardar video'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold text-white">Correos de notificación</h2>
          <p className="mt-1 text-sm text-slate-400">Todos los formularios se enviarán a estos destinatarios. Ingresa un correo por línea.</p>
          <form onSubmit={handleEmailsUpdate} className="mt-4 space-y-3">
            <div>
              <label htmlFor="notificationEmails" className="mb-2 block text-sm text-slate-300">Destinatarios</label>
              <textarea
                id="notificationEmails"
                value={notificationEmails}
                onChange={(event) => setNotificationEmails(event.target.value)}
                required
                rows={4}
                placeholder={'prestamos@caguascoop.com\nernesto@altacommunication.net'}
                className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-sky-500"
              />
            </div>
            <button type="submit" disabled={savingEmails} className="rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60">
              {savingEmails ? 'Guardando…' : 'Guardar correos'}
            </button>
          </form>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-4 text-xl font-semibold text-white">Crear nuevo administrador</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Correo electrónico</label>
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-sky-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Contraseña temporal</label>
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-sky-500" />
              </div>
              <button type="submit" className="rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white hover:bg-sky-500">Crear usuario</button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-4 text-xl font-semibold text-white">Cambiar mi contraseña</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Nueva contraseña</label>
                <input value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} type="password" required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-sky-500" />
              </div>
              <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500">Actualizar contraseña</button>
            </form>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-xl font-semibold text-white">Usuarios activos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 pr-6 font-medium">Correo</th>
                  <th className="py-3 pr-6 font-medium">Rol</th>
                  <th className="py-3 pr-6 font-medium">Creado</th>
                  <th className="py-3 pr-6 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400">Cargando…</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400">No hay usuarios.</td></tr>
                ) : users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-800">
                    <td className="py-3 pr-6 text-white">{user.email}</td>
                    <td className="py-3 pr-6 text-slate-300">{user.is_admin ? 'Administrador' : 'Usuario'}</td>
                    <td className="py-3 pr-6 text-slate-300">{new Date(user.created_at).toLocaleDateString('es-PR')}</td>
                    <td className="py-3 pr-6">
                      <button type="button" onClick={() => handleDelete(user.id)} className="rounded-lg border border-rose-600/50 bg-rose-600/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-600/20 disabled:opacity-50" disabled={user.email === 'admin@paresolver.com'}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
