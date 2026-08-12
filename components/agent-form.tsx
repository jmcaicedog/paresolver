"use client"

import { useState } from "react"

const initialValues = {
  nombre: "",
  correo: "",
  telefono: "",
  pueblo: "",
  producto: "",
  tipoEmpleo: "",
  tienePlanillas: "",
  posicionEmpleo: "",
  tiempoEmpleo: "",
  lugarEmpleo: "",
  ingresoNeto: "",
  fechaNacimiento: "",
  autorizacionCredito: false,
  seguroSocial: "",
  direccionPostal: "",
}

function getAgeFromBirthDate(dateIso: string) {
  const date = new Date(`${dateIso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null

  const now = new Date()
  let age = now.getFullYear() - date.getFullYear()
  const monthDiff = now.getMonth() - date.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) age -= 1
  return age
}

export function AgentForm() {
  const [values, setValues] = useState(initialValues)
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState("")

  const fieldClass =
    "w-full rounded-lg border border-brand-blue/20 bg-white px-4 py-3 text-base font-medium text-brand-navy shadow-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
  const labelClass = "mb-1.5 block text-sm font-bold text-brand-navy"

  function updateValue(field: keyof typeof initialValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const age = getAgeFromBirthDate(values.fechaNacimiento)
    if (age === null || age < 18) {
      setStatus("error")
      setError(age === null ? "Ingresa una fecha de nacimiento válida." : "El cliente debe ser mayor de 18 años.")
      return
    }

    if (!values.autorizacionCredito) {
      setStatus("error")
      setError("El cliente debe autorizar la indagación de crédito.")
      return
    }

    setStatus("submitting")

    try {
      const response = await fetch("/api/agente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          tienePlanillas: values.tipoEmpleo === "negocio-propio" ? values.tienePlanillas : undefined,
        }),
      })
      const data = (await response.json().catch(() => null)) as { message?: string } | null

      if (!response.ok) {
        setStatus("error")
        setError(data?.message ?? "No se pudo registrar al cliente.")
        return
      }

      setStatus("success")
    } catch {
      setStatus("error")
      setError("No se pudo registrar al cliente. Verifica la conexión e inténtalo nuevamente.")
    }
  }

  function resetForm() {
    setValues(initialValues)
    setStatus("idle")
    setError("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-lg border border-brand-blue/20 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-lime text-2xl font-extrabold text-brand-navy">✓</div>
        <h2 className="mt-4 text-2xl font-extrabold text-brand-navy">Cliente registrado</h2>
        <p className="mt-2 text-base text-brand-navy/75">La información se guardó y la notificación fue enviada correctamente.</p>
        <button type="button" onClick={resetForm} className="mt-6 rounded-lg bg-brand-navy px-6 py-3 text-sm font-bold text-white hover:bg-brand-navy/90">
          Registrar otro cliente
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate={false}>
      <fieldset className="grid gap-5 rounded-lg border border-brand-blue/15 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7">
        <legend className="px-2 text-xl font-extrabold text-brand-blue">Datos del cliente</legend>
        <Field label="Nombre completo" id="nombre" value={values.nombre} onChange={(value) => updateValue("nombre", value)} autoComplete="name" />
        <Field label="Correo electrónico" id="correo" type="email" value={values.correo} onChange={(value) => updateValue("correo", value)} autoComplete="email" />
        <Field label="Teléfono" id="telefono" type="tel" value={values.telefono} onChange={(value) => updateValue("telefono", value)} autoComplete="tel" />
        <Field label="Pueblo" id="pueblo" value={values.pueblo} onChange={(value) => updateValue("pueblo", value)} autoComplete="address-level2" />
        <div className="sm:col-span-2">
          <label htmlFor="direccionPostal" className={labelClass}>Dirección postal</label>
          <input id="direccionPostal" required autoComplete="street-address" value={values.direccionPostal} onChange={(event) => updateValue("direccionPostal", event.target.value)} className={fieldClass} />
        </div>
      </fieldset>

      <fieldset className="grid gap-5 rounded-lg border border-brand-blue/15 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7">
        <legend className="px-2 text-xl font-extrabold text-brand-blue">Producto e información laboral</legend>
        <SelectField label="Producto solicitado" id="producto" value={values.producto} onChange={(value) => updateValue("producto", value)} options={[["Préstamo Personal", "Préstamo Personal"], ["Préstamo de Auto", "Préstamo de Auto"]]} />
        <SelectField label="Tipo de empleo" id="tipoEmpleo" value={values.tipoEmpleo} onChange={(value) => { updateValue("tipoEmpleo", value); if (value !== "negocio-propio") updateValue("tienePlanillas", "") }} options={[["regular", "Regular"], ["negocio-propio", "Negocio propio"]]} />
        {values.tipoEmpleo === "negocio-propio" && (
          <SelectField label="¿Posee las últimas dos planillas radicadas?" id="tienePlanillas" value={values.tienePlanillas} onChange={(value) => updateValue("tienePlanillas", value)} options={[["si", "Sí"], ["no", "No"]]} />
        )}
        <Field label="Posición de empleo" id="posicionEmpleo" value={values.posicionEmpleo} onChange={(value) => updateValue("posicionEmpleo", value)} />
        <Field label="Tiempo en el empleo" id="tiempoEmpleo" value={values.tiempoEmpleo} onChange={(value) => updateValue("tiempoEmpleo", value)} />
        <Field label="Lugar de empleo" id="lugarEmpleo" value={values.lugarEmpleo} onChange={(value) => updateValue("lugarEmpleo", value)} />
        <Field label="Ingreso neto" id="ingresoNeto" value={values.ingresoNeto} onChange={(value) => updateValue("ingresoNeto", value)} inputMode="decimal" />
      </fieldset>

      <fieldset className="grid gap-5 rounded-lg border border-brand-blue/15 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7">
        <legend className="px-2 text-xl font-extrabold text-brand-blue">Información para evaluación</legend>
        <Field label="Fecha de nacimiento" id="fechaNacimiento" type="date" value={values.fechaNacimiento} onChange={(value) => updateValue("fechaNacimiento", value)} />
        <Field label="Seguro social" id="seguroSocial" value={values.seguroSocial} onChange={(value) => updateValue("seguroSocial", value)} inputMode="numeric" autoComplete="off" />
        <label className="flex items-start gap-3 rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-4 text-sm font-semibold text-brand-navy sm:col-span-2">
          <input type="checkbox" required checked={values.autorizacionCredito} onChange={(event) => updateValue("autorizacionCredito", event.target.checked)} className="mt-0.5 size-5 accent-brand-blue" />
          <span>El cliente autoriza la indagación de crédito para fines de evaluación de pre-calificación.</span>
        </label>
      </fieldset>

      {status === "error" && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}

      <button type="submit" disabled={status === "submitting"} className="w-full rounded-lg bg-brand-navy px-6 py-4 text-base font-bold text-white shadow-md hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-65 sm:w-auto">
        {status === "submitting" ? "REGISTRANDO..." : "REGISTRAR CLIENTE"}
      </button>
    </form>
  )
}

type FieldProps = {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  inputMode?: "decimal" | "numeric"
}

function Field({ label, id, value, onChange, type = "text", autoComplete, inputMode }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-brand-navy">{label}</label>
      <input id={id} name={id} type={type} required value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} inputMode={inputMode} className="w-full rounded-lg border border-brand-blue/20 bg-white px-4 py-3 text-base font-medium text-brand-navy shadow-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15" />
    </div>
  )
}

function SelectField({ label, id, value, onChange, options }: { label: string; id: string; value: string; onChange: (value: string) => void; options: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-brand-navy">{label}</label>
      <select id={id} name={id} required value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-brand-blue/20 bg-white px-4 py-3 text-base font-medium text-brand-navy shadow-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15">
        <option value="" disabled>Selecciona una opción</option>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </div>
  )
}