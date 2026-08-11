'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-PR', { dateStyle: 'short', timeStyle: 'short' })
}

const formatFormType = (value: string) => value === 'lead_nuevo' ? 'Lead Nuevo' : 'Pre-calificación'

function RealBarChart({
  data,
  labelKey,
  valueKey,
}: {
  data: Array<Record<string, string | number | undefined>>
  labelKey: string
  valueKey: string
}) {
  const maxValue = Math.max(...data.map((item) => Number(item[valueKey] ?? 0)), 1)

  return (
    <div className="space-y-3">
      {data.length === 0 ? (
        <p className="text-sm text-slate-400">Sin datos reales disponibles.</p>
      ) : (
        data.map((item, index) => {
          const value = Number(item[valueKey] ?? 0)
          const height = Math.max((value / maxValue) * 100, value > 0 ? 14 : 0)

          return (
            <div key={`${String(item[labelKey] ?? 'unknown')}-${index}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>{String(item[labelKey] ?? 'Unknown')}</span>
                <span>{value}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                  style={{ width: `${height}%` }}
                />
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

type Submission = {
  id: string
  form_type: string
  name: string
  email: string | null
  phone: string | null
  payload: Record<string, unknown>
  created_at: string
}

type MetricPoint = {
  country?: string
  device_type?: string
  os?: string
  form_type?: string
  total?: number
}

export default function AdminPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [type, setType] = useState('all')
  const [rows, setRows] = useState<Submission[]>([])
  const [metrics, setMetrics] = useState({
    totalVisits: 0,
    totalForms: 0,
    byCountry: [] as MetricPoint[],
    byDevice: [] as MetricPoint[],
    byOs: [] as MetricPoint[],
    byFormType: [] as MetricPoint[],
  })
  const [selected, setSelected] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [submissionsResponse, metricsResponse] = await Promise.all([
          fetch(`/api/admin/submissions?search=${encodeURIComponent(search)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&type=${encodeURIComponent(type)}`),
          fetch(`/api/admin/metrics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
        ])

        if (submissionsResponse.status === 401 || metricsResponse.status === 401) {
          router.push('/admin/login')
          return
        }

        const submissionsData = await submissionsResponse.json().catch(() => ({ items: [] }))
        const metricsData = await metricsResponse.json().catch(() => ({ metrics: { totalVisits: 0, totalForms: 0, byCountry: [], byDevice: [], byOs: [], byFormType: [] } }))

        setRows(submissionsData.items ?? [])
        setMetrics(metricsData.metrics ?? { totalVisits: 0, totalForms: 0, byCountry: [], byDevice: [], byOs: [], byFormType: [] })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router, search, from, to, type])

  const topCountries = useMemo(() => metrics.byCountry.slice(0, 5), [metrics.byCountry])
  const topDevices = useMemo(() => metrics.byDevice.slice(0, 5), [metrics.byDevice])
  const topOs = useMemo(() => metrics.byOs.slice(0, 5), [metrics.byOs])
  const formBreakdown = useMemo(() => metrics.byFormType.slice(0, 5), [metrics.byFormType])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-50">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Administración</h1>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/users')}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-medium text-slate-100 hover:bg-slate-700"
            >
              Usuarios admin
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-rose-600 px-4 py-2 font-medium text-white hover:bg-rose-500"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Visitas</p>
            <p className="mt-3 text-3xl font-bold text-white">{metrics.totalVisits}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Formularios</p>
            <p className="mt-3 text-3xl font-bold text-white">{metrics.totalForms}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Países</p>
            <p className="mt-3 text-3xl font-bold text-white">{topCountries.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Dispositivos</p>
            <p className="mt-3 text-3xl font-bold text-white">{topDevices.length}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Registros</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Formulario diligenciado</h2>
              </div>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                />
                <input
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                />
                <input
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                />
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                >
                  <option value="all">Todos</option>
                  <option value="lead_nuevo">Lead Nuevo</option>
                  <option value="pre_calificacion">Pre-calificación</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 pr-6 font-medium">Nombre</th>
                    <th className="py-3 pr-6 font-medium">Tipo</th>
                    <th className="py-3 pr-6 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">Cargando…</td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">No hay registros.</td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="cursor-pointer border-b border-slate-800 hover:bg-slate-800/60" onClick={() => setSelected(row)}>
                        <td className="py-3 pr-6 font-medium text-white">{row.name}</td>
                        <td className="py-3 pr-6 text-slate-300">{formatFormType(row.form_type)}</td>
                        <td className="py-3 pr-6 text-slate-300">{formatDate(row.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Origen geográfico</p>
              <div className="mt-4">
                <RealBarChart data={topCountries.map((item) => ({ country: item.country ?? 'Unknown', total: item.total ?? 0 }))} labelKey="country" valueKey="total" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Dispositivos</p>
              <div className="mt-4">
                <RealBarChart data={topDevices.map((item) => ({ device_type: item.device_type ?? 'Unknown', total: item.total ?? 0 }))} labelKey="device_type" valueKey="total" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Sistema operativo</p>
              <div className="mt-4">
                <RealBarChart data={topOs.map((item) => ({ os: item.os ?? 'Unknown', total: item.total ?? 0 }))} labelKey="os" valueKey="total" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Tipo de formulario</p>
            <div className="mt-4">
              <RealBarChart data={formBreakdown.map((item) => ({ form_type: item.form_type ? formatFormType(item.form_type) : 'Unknown', total: item.total ?? 0 }))} labelKey="form_type" valueKey="total" />
            </div>
          </div>
        </section>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Detalle</p>
                <h3 className="mt-2 text-2xl font-bold text-white">{selected.name}</h3>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Cerrar</button>
            </div>

            <div className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400">Tipo</span>
                <span className="font-medium text-white">{formatFormType(selected.form_type)}</span>
              </div>
              <div className="flex justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400">Fecha</span>
                <span className="font-medium text-white">{formatDate(selected.created_at)}</span>
              </div>
              {selected.email ? (
                <div className="flex justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-400">Correo</span>
                  <span className="font-medium text-white">{selected.email}</span>
                </div>
              ) : null}
              {selected.phone ? (
                <div className="flex justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-400">Teléfono</span>
                  <span className="font-medium text-white">{selected.phone}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">Campos diligenciados</p>
              <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-200">{JSON.stringify(selected.payload, null, 2)}</pre>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
