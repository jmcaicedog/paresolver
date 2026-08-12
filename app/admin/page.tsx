'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { ClipboardList, Eye, Globe2, Laptop2, LogOut, MessageCircle, Settings, X } from 'lucide-react'

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-PR', { dateStyle: 'short', timeStyle: 'short' })
}

const formatFormType = (value: string) => {
  if (value === 'lead_nuevo') return 'Lead Nuevo'
  if (value === 'pre_calificacion') return 'Pre-calificación'
  if (value === 'agente') return 'Agente'
  return value
}

const countryNames = new Intl.DisplayNames(['es'], { type: 'region' })

const formatCountry = (value?: string) => {
  if (!value || value.toLowerCase() === 'unknown') return 'No identificado'
  return countryNames.of(value.toUpperCase()) ?? value.toUpperCase()
}

const formatDevice = (value?: string) => {
  const labels: Record<string, string> = { desktop: 'Computadora', mobile: 'Móvil', tablet: 'Tableta', unknown: 'No identificado' }
  return labels[value?.toLowerCase() ?? 'unknown'] ?? value ?? 'No identificado'
}

const fieldLabels: Record<string, string> = {
  pueblo: 'Pueblo',
  producto: 'Producto solicitado',
  tipoEmpleo: 'Tipo de empleo',
  tienePlanillas: 'Últimas dos planillas',
  posicionEmpleo: 'Posición de empleo',
  tiempoEmpleo: 'Tiempo en el empleo',
  lugarEmpleo: 'Lugar de empleo',
  ingresoNeto: 'Ingreso neto',
  fechaNacimiento: 'Fecha de nacimiento',
  autorizacionCredito: 'Autorización de crédito',
  seguroSocial: 'Seguro social',
  direccionPostal: 'Dirección postal',
}

function formatFieldValue(key: string, value: unknown) {
  if (value === null || value === undefined || value === '') return 'No provisto'
  if (key === 'autorizacionCredito') return value ? 'Sí, autorizada' : 'No autorizada'
  if (key === 'tipoEmpleo') return value === 'negocio-propio' ? 'Negocio propio' : 'Empleo regular'
  if (key === 'tienePlanillas') return value === 'si' ? 'Sí' : 'No'
  if (key === 'producto') return value === 'prestamo-auto' ? 'Préstamo de auto' : value === 'prestamo-personal' ? 'Préstamo personal' : String(value)
  if (key === 'fechaNacimiento') return new Date(`${String(value)}T00:00:00`).toLocaleDateString('es-PR', { dateStyle: 'long' })
  if (key === 'seguroSocial') {
    const digits = String(value).replace(/\D/g, '')
    return digits.length >= 4 ? `•••-••-${digits.slice(-4)}` : 'Dato protegido'
  }
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  href,
}: {
  label: string
  value: number
  detail: ReactNode
  icon: typeof Eye
  href: string
}) {
  return (
    <a
      href={href}
      className="group rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm outline-none transition hover:border-sky-500/50 hover:bg-slate-800/80 focus-visible:ring-2 focus-visible:ring-sky-400"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value.toLocaleString('es-PR')}</p>
        </div>
        <div className="grid size-10 place-items-center rounded-lg bg-sky-500/10 text-sky-300 transition group-hover:bg-sky-500/20">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-3 text-sm font-medium leading-5 text-slate-400">{detail}</div>
    </a>
  )
}

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
        <p className="text-sm font-medium text-slate-300">Sin datos reales disponibles.</p>
      ) : (
        data.map((item, index) => {
          const value = Number(item[valueKey] ?? 0)
          const height = Math.max((value / maxValue) * 100, value > 0 ? 14 : 0)

          return (
            <div key={`${String(item[labelKey] ?? 'unknown')}-${index}`} className="space-y-1">
              <div className="flex items-center justify-between text-sm font-medium text-slate-200">
                <span>{String(item[labelKey] ?? 'Unknown')}</span>
                <span>{value}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-linear-to-r from-sky-500 to-cyan-400"
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

function DailyFormsChart({ data }: { data: MetricPoint[] }) {
  const maxValue = Math.max(...data.map((item) => Number(item.total ?? 0)), 1)
  const chartWidth = Math.max(data.length * 64, 640)

  if (data.length === 0) {
    return <div className="grid h-56 place-items-center text-sm font-medium text-slate-300">No hay formularios en este período.</div>
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex h-64 items-end gap-3 border-b border-slate-700 px-2 pt-8" style={{ minWidth: chartWidth }}>
        {data.map((item) => {
          const total = Number(item.total ?? 0)
          const height = Math.max((total / maxValue) * 176, 10)
          const date = item.date ? new Date(`${item.date}T00:00:00`) : null
          const label = date?.toLocaleDateString('es-PR', { day: '2-digit', month: 'short' }) ?? '—'

          return (
            <div key={item.date} className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2">
              <span className="text-sm font-semibold text-slate-100">{total}</span>
              <div
                className="w-full max-w-10 rounded-t bg-sky-500 transition-[height] duration-500"
                style={{ height }}
                title={`${label}: ${total} formulario${total === 1 ? '' : 's'}`}
              />
              <span className="h-7 whitespace-nowrap text-xs font-medium text-slate-400">{label}</span>
            </div>
          )
        })}
      </div>
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
  date?: string
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
    whatsappClicks: 0,
    byCountry: [] as MetricPoint[],
    byDevice: [] as MetricPoint[],
    byOs: [] as MetricPoint[],
    byFormType: [] as MetricPoint[],
    formsByDay: [] as MetricPoint[],
  })
  const [selected, setSelected] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoadError('')
        const [submissionsResponse, metricsResponse] = await Promise.all([
          fetch(`/api/admin/submissions?search=${encodeURIComponent(search)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&type=${encodeURIComponent(type)}`),
          fetch(`/api/admin/metrics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
        ])

        if (submissionsResponse.status === 401 || metricsResponse.status === 401) {
          router.push('/admin/login')
          return
        }

        const submissionsData = await submissionsResponse.json().catch(() => ({}))
        const metricsData = await metricsResponse.json().catch(() => ({}))

        if (!submissionsResponse.ok || !metricsResponse.ok) {
          setLoadError(submissionsData.message ?? metricsData.message ?? 'No se pudieron cargar los datos.')
          return
        }

        setRows(submissionsData.items ?? [])
        setMetrics(metricsData.metrics ?? { totalVisits: 0, totalForms: 0, whatsappClicks: 0, byCountry: [], byDevice: [], byOs: [], byFormType: [], formsByDay: [] })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router, search, from, to, type])

  const topCountries = useMemo(() => metrics.byCountry.slice(0, 5), [metrics.byCountry])
  const topDevices = useMemo(() => metrics.byDevice.slice(0, 5), [metrics.byDevice])
  const topOs = useMemo(() => metrics.byOs.slice(0, 5), [metrics.byOs])
  const identifiedCountries = useMemo(
    () => topCountries.filter((item) => item.country && item.country.toLowerCase() !== 'unknown'),
    [topCountries],
  )
  const selectedFields = useMemo(
    () => selected
      ? Object.entries(selected.payload).filter(([key]) => !['nombre', 'correo', 'telefono', 'puestoEmpleo'].includes(key))
      : [],
    [selected],
  )
  const leadTotal = Number(metrics.byFormType.find((item) => item.form_type === 'lead_nuevo')?.total ?? 0)
  const prequalificationTotal = Number(metrics.byFormType.find((item) => item.form_type === 'pre_calificacion')?.total ?? 0)
  const agentTotal = Number(metrics.byFormType.find((item) => item.form_type === 'agente')?.total ?? 0)

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-medium text-slate-50">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-5 rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Panel de control</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Actividad comercial</h1>
            <p className="mt-2 text-base leading-6 text-slate-300">Seguimiento en tiempo real de visitas y solicitudes.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/agente')}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-200 hover:bg-sky-500/20"
            >
              <ClipboardList className="size-4" aria-hidden="true" />
              Formulario agente
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/users')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-700"
            >
              <Settings className="size-4" aria-hidden="true" />
              Configuración
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-500"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </header>

        {loadError ? (
          <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {loadError}
          </div>
        ) : null}

        <section id="resumen" className="grid scroll-mt-6 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Visitas" value={metrics.totalVisits} detail="Ver origen geográfico" icon={Eye} href="#origen-geografico" />
          <MetricCard
            label="Formularios"
            value={metrics.totalForms}
            detail={(
              <span className="flex flex-wrap gap-x-3 gap-y-1">
                <span><strong className="font-semibold text-slate-300">{leadTotal}</strong> leads nuevos</span>
                <span><strong className="font-semibold text-slate-300">{prequalificationTotal}</strong> precalificaciones</span>
                <span><strong className="font-semibold text-slate-300">{agentTotal}</strong> agentes</span>
              </span>
            )}
            icon={ClipboardList}
            href="#registros"
          />
          <MetricCard
            label="Clics en WhatsApp"
            value={metrics.whatsappClicks}
            detail="Conversaciones iniciadas"
            icon={MessageCircle}
            href="#resumen"
          />
          <MetricCard
            label="Países identificados"
            value={identifiedCountries.length}
            detail={identifiedCountries[0] ? `Principal: ${formatCountry(identifiedCountries[0].country)}` : 'Sin ubicación identificada aún'}
            icon={Globe2}
            href="#origen-geografico"
          />
          <MetricCard
            label="Dispositivos"
            value={topDevices.length}
            detail={topDevices[0] ? `Principal: ${formatDevice(topDevices[0].device_type)}` : 'Sin datos disponibles'}
            icon={Laptop2}
            href="#dispositivos"
          />
        </section>

        <section id="registros" className="grid min-w-0 scroll-mt-6 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <div className="mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Registros</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Solicitudes recibidas</h2>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="grid min-w-0 gap-1.5 text-sm font-semibold text-slate-300">
                  Buscar
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre" className="h-10 min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-sky-500" />
                </label>
                <label className="grid min-w-0 gap-1.5 text-sm font-semibold text-slate-300">
                  Desde
                  <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-10 min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-sky-500" />
                </label>
                <label className="grid min-w-0 gap-1.5 text-sm font-semibold text-slate-300">
                  Hasta
                  <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-10 min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-sky-500" />
                </label>
                <label className="grid min-w-0 gap-1.5 text-sm font-semibold text-slate-300">
                  Tipo
                  <select value={type} onChange={(event) => setType(event.target.value)} className="h-10 min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-sky-500">
                    <option value="all">Todos</option>
                    <option value="lead_nuevo">Lead nuevo</option>
                    <option value="pre_calificacion">Pre-calificación</option>
                    <option value="agente">Agente</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[15px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="py-3 pr-6 font-medium">Nombre</th>
                    <th className="py-3 pr-6 font-medium">Contacto</th>
                    <th className="py-3 pr-6 font-medium">Tipo</th>
                    <th className="py-3 pr-6 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-300">Cargando…</td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-300">No hay registros para los filtros seleccionados.</td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="cursor-pointer border-b border-slate-800 hover:bg-slate-800/60" onClick={() => setSelected(row)}>
                        <td className="py-3 pr-6 font-medium text-white">{row.name}</td>
                        <td className="py-3 pr-6 text-slate-300">{row.email ?? row.phone ?? '—'}</td>
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
            <div id="origen-geografico" className="scroll-mt-6 rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-300">Origen geográfico</p>
              <div className="mt-4">
                <RealBarChart data={topCountries.map((item) => ({ country: formatCountry(item.country), total: item.total ?? 0 }))} labelKey="country" valueKey="total" />
              </div>
            </div>

            <div id="dispositivos" className="scroll-mt-6 rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-300">Dispositivos</p>
              <div className="mt-4">
                <RealBarChart data={topDevices.map((item) => ({ device_type: formatDevice(item.device_type), total: item.total ?? 0 }))} labelKey="device_type" valueKey="total" />
              </div>
            </div>

            <div id="sistema-operativo" className="scroll-mt-6 rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-300">Sistema operativo</p>
              <div className="mt-4">
                <RealBarChart data={topOs.map((item) => ({ os: item.os?.toLowerCase() === 'unknown' ? 'No identificado' : item.os ?? 'No identificado', total: item.total ?? 0 }))} labelKey="os" valueKey="total" />
              </div>
            </div>
          </div>
        </section>

        <section id="tendencia" className="scroll-mt-6 rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Tendencia</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Formularios por día</h2>
            </div>
            <p className="text-sm text-slate-400">
              {from || to ? `Período: ${from || 'inicio'} a ${to || 'hoy'}` : 'Todo el período disponible'}
            </p>
          </div>
          <div className="mt-5">
            <DailyFormsChart data={metrics.formsByDay} />
          </div>
        </section>

      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" onMouseDown={() => setSelected(null)}>
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">{formatFormType(selected.form_type)}</p>
                <h3 className="mt-1 text-2xl font-bold text-white">{selected.name}</h3>
                <p className="mt-1 text-base text-slate-300">Recibido el {formatDate(selected.created_at)}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="grid size-9 place-items-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" aria-label="Cerrar detalle" title="Cerrar">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-7 p-6">
              <section>
                <h4 className="text-base font-bold text-white">Información de contacto</h4>
                <dl className="mt-3 grid gap-x-8 gap-y-4 border-y border-slate-800 py-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-semibold uppercase text-slate-400">Correo electrónico</dt>
                    <dd className="mt-1.5 break-all text-base leading-6 text-slate-100">{selected.email ?? 'No provisto'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold uppercase text-slate-400">Teléfono</dt>
                    <dd className="mt-1.5 text-base leading-6 text-slate-100">{selected.phone ?? 'No provisto'}</dd>
                  </div>
                </dl>
              </section>

              <section>
                <h4 className="text-base font-bold text-white">Información suministrada</h4>
                {selectedFields.length > 0 ? (
                  <dl className="mt-3 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    {selectedFields.map(([key, value]) => (
                      <div key={key} className="border-b border-slate-800 pb-4">
                        <dt className="text-sm font-semibold uppercase text-slate-400">{fieldLabels[key] ?? key}</dt>
                        <dd className="mt-2 wrap-break-word text-base leading-7 text-slate-100">{formatFieldValue(key, value)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3 text-base text-slate-300">No hay campos adicionales.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
