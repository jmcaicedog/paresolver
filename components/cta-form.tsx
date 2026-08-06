"use client"

import Image from "next/image"
import { useState } from "react"
import { Reveal } from "@/components/reveal"

const EMPLOYMENT_TYPES = [
  { value: "regular", label: "Regular" },
  { value: "negocio-propio", label: "Negocio propio" },
] as const

function getAgeFromBirthDate(dateIso: string) {
  const date = new Date(dateIso)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const now = new Date()
  let age = now.getFullYear() - date.getFullYear()
  const monthDiff = now.getMonth() - date.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age -= 1
  }

  return age
}

export function CtaForm() {
  const [submitted, setSubmitted] = useState(false)
  const [showPrequalModal, setShowPrequalModal] = useState(false)
  const [leadStatus, setLeadStatus] = useState<"idle" | "submitting" | "error">("idle")
  const [leadError, setLeadError] = useState("")
  const [prequalStatus, setPrequalStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [prequalError, setPrequalError] = useState("")
  const [values, setValues] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    pueblo: "",
  })
  const [prequalValues, setPrequalValues] = useState({
    tipoEmpleo: "",
    tienePlanillas: "",
    posicionEmpleo: "",
    tiempoEmpleo: "",
    lugarEmpleo: "",
    puestoEmpleo: "",
    ingresoNeto: "",
    fechaNacimiento: "",
    autorizacionCredito: false,
    seguroSocial: "",
    direccionPostal: "",
  })

  async function handleLeadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLeadStatus("submitting")
    setLeadError("")

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null
        setLeadStatus("error")
        setLeadError(data?.message ?? "No pudimos enviar tu registro. Inténtalo nuevamente.")
        return
      }

      setSubmitted(true)
      setLeadStatus("idle")
      setShowPrequalModal(true)
    } catch {
      setLeadStatus("error")
      setLeadError("No pudimos enviar tu registro. Inténtalo nuevamente.")
    }
  }

  async function handlePrequalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPrequalError("")

    const age = getAgeFromBirthDate(prequalValues.fechaNacimiento)
    if (age === null) {
      setPrequalStatus("error")
      setPrequalError("Ingresa una fecha de nacimiento válida.")
      return
    }

    if (age < 18) {
      setPrequalStatus("error")
      setPrequalError("Debes ser mayor de 18 años para completar la pre-calificación.")
      return
    }

    if (!prequalValues.autorizacionCredito) {
      setPrequalStatus("error")
      setPrequalError("Debes autorizar la indagación de crédito para continuar.")
      return
    }

    setPrequalStatus("submitting")

    try {
      const response = await fetch("/api/precalificacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          ...prequalValues,
          tienePlanillas: prequalValues.tipoEmpleo === "negocio-propio" ? prequalValues.tienePlanillas : undefined,
        }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null
        setPrequalStatus("error")
        setPrequalError(data?.message ?? "No pudimos enviar tu pre-calificación.")
        return
      }

      setPrequalStatus("success")
    } catch {
      setPrequalStatus("error")
      setPrequalError("No pudimos enviar tu pre-calificación.")
    }
  }

  const fieldClass =
    "w-full rounded-lg border-2 border-transparent bg-white px-4 py-3.5 text-base font-medium text-brand-navy placeholder:text-brand-navy/60 shadow-sm outline-none transition-colors duration-200 focus:border-brand-blue"

  return (
    <section id="solicita" className="scroll-mt-8 bg-brand-lime py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <h2 className="text-4xl font-extrabold text-brand-navy sm:text-5xl">Solicita ahora</h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-base font-medium text-brand-navy/80">
            Completa tus datos y un representante te contactará para ayudarte a resolver.
          </p>
        </Reveal>

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-[1fr_300px]">
          <Reveal from="up">
            {submitted ? (
              <div
                role="status"
                className="flex min-h-70 flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-lg"
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-lime text-3xl text-brand-navy">
                  ✓
                </div>
                <h3 className="mt-4 text-2xl font-extrabold text-brand-navy">¡Solicitud recibida!</h3>
                <p className="mt-2 max-w-sm text-brand-navy/70">
                  Gracias{values.nombre ? `, ${values.nombre}` : ""}. Pronto te contactaremos para continuar con tu
                  préstamo.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPrequalModal(true)}
                  className="mt-5 rounded-lg bg-brand-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy/90"
                >
                  COMPLETAR PRE-CALIFICACIÓN
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="grid gap-4 sm:grid-cols-2" noValidate={false}>
                <div>
                  <label htmlFor="nombre" className="sr-only">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    required
                    autoComplete="name"
                    placeholder="NOMBRE"
                    value={values.nombre}
                    onChange={(e) => setValues((v) => ({ ...v, nombre: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="correo" className="sr-only">
                    Correo electrónico
                  </label>
                  <input
                    id="correo"
                    name="correo"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="CORREO ELECTRÓNICO"
                    value={values.correo}
                    onChange={(e) => setValues((v) => ({ ...v, correo: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="telefono" className="sr-only">
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="TELÉFONO"
                    value={values.telefono}
                    onChange={(e) => setValues((v) => ({ ...v, telefono: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="pueblo" className="sr-only">
                    Pueblo
                  </label>
                  <input
                    id="pueblo"
                    name="pueblo"
                    required
                    autoComplete="address-level2"
                    placeholder="PUEBLO"
                    value={values.pueblo}
                    onChange={(e) => setValues((v) => ({ ...v, pueblo: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={leadStatus === "submitting"}
                  className="group flex items-center justify-center gap-2 rounded-lg bg-brand-navy px-6 py-3.5 text-base font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-navy/30 sm:col-span-1"
                >
                  {leadStatus === "submitting" ? "ENVIANDO..." : "SOLICITAR AHORA"}
                  <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                    →
                  </span>
                </button>
                {leadStatus === "error" && (
                  <p className="text-sm font-semibold text-red-700 sm:col-span-2" role="alert">
                    {leadError}
                  </p>
                )}
              </form>
            )}
          </Reveal>

          <Reveal from="right" className="mx-auto hidden w-full max-w-75 lg:block">
            <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/mother-daughter.png"
                alt="Madre e hija preparándose para el regreso a clases"
                fill
                sizes="300px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>

      {showPrequalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/70 px-4 py-8">
          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-blue">Registro completado</p>
                <h3 className="mt-1 text-2xl font-extrabold text-brand-navy">
                  Perfecto, hemos recibido tu registro, ahora puedes hacer tu solicitud de pre-calificación
                </h3>
                <p className="mt-2 text-sm text-brand-navy/75">
                  Completar este formulario es opcional y nos permitirá preparar mejor tu evaluación de preaprobación.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrequalModal(false)}
                className="rounded-md border border-brand-navy/20 px-3 py-1.5 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
              >
                Cerrar
              </button>
            </div>

            {prequalStatus === "success" ? (
              <div className="rounded-xl border border-brand-lime/70 bg-brand-lime/20 p-6 text-center">
                <h4 className="text-xl font-extrabold text-brand-navy">Pre-calificación enviada</h4>
                <p className="mt-2 text-sm text-brand-navy/80">
                  Gracias por completar la información adicional. Nuestro equipo evaluará tu solicitud.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPrequalModal(false)}
                  className="mt-4 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-navy/90"
                >
                  Finalizar
                </button>
              </div>
            ) : (
              <form onSubmit={handlePrequalSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
                <div>
                  <label htmlFor="tipoEmpleo" className="sr-only">
                    Tipo de empleo
                  </label>
                  <select
                    id="tipoEmpleo"
                    name="tipoEmpleo"
                    required
                    value={prequalValues.tipoEmpleo}
                    onChange={(e) =>
                      setPrequalValues((v) => ({
                        ...v,
                        tipoEmpleo: e.target.value,
                        tienePlanillas: e.target.value === "negocio-propio" ? v.tienePlanillas : "",
                      }))
                    }
                    className={`${fieldClass} ${prequalValues.tipoEmpleo ? "" : "text-brand-navy/60"}`}
                  >
                    <option value="" disabled>
                      TIPO DE EMPLEO
                    </option>
                    {EMPLOYMENT_TYPES.map((option) => (
                      <option key={option.value} value={option.value} className="text-brand-navy">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {prequalValues.tipoEmpleo === "negocio-propio" && (
                  <div>
                    <label htmlFor="tienePlanillas" className="sr-only">
                      Posee las últimas dos planillas radicadas
                    </label>
                    <select
                      id="tienePlanillas"
                      name="tienePlanillas"
                      required
                      value={prequalValues.tienePlanillas}
                      onChange={(e) => setPrequalValues((v) => ({ ...v, tienePlanillas: e.target.value }))}
                      className={`${fieldClass} ${prequalValues.tienePlanillas ? "" : "text-brand-navy/60"}`}
                    >
                      <option value="" disabled>
                        ¿POSEE LAS ÚLTIMAS DOS PLANILLAS?
                      </option>
                      <option value="si" className="text-brand-navy">
                        Sí
                      </option>
                      <option value="no" className="text-brand-navy">
                        No
                      </option>
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="posicionEmpleo" className="sr-only">
                    Posición de empleo
                  </label>
                  <input
                    id="posicionEmpleo"
                    name="posicionEmpleo"
                    required
                    placeholder="POSICIÓN DE EMPLEO"
                    value={prequalValues.posicionEmpleo}
                    onChange={(e) => setPrequalValues((v) => ({ ...v, posicionEmpleo: e.target.value }))}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="tiempoEmpleo" className="sr-only">
                    Tiempo de empleo
                  </label>
                  <input
                    id="tiempoEmpleo"
                    name="tiempoEmpleo"
                    required
                    placeholder="TIEMPO DE EMPLEO"
                    value={prequalValues.tiempoEmpleo}
                    onChange={(e) => setPrequalValues((v) => ({ ...v, tiempoEmpleo: e.target.value }))}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="lugarEmpleo" className="sr-only">
                    Lugar de empleo
                  </label>
                  <input
                    id="lugarEmpleo"
                    name="lugarEmpleo"
                    required
                    placeholder="LUGAR DE EMPLEO"
                    value={prequalValues.lugarEmpleo}
                    onChange={(e) => setPrequalValues((v) => ({ ...v, lugarEmpleo: e.target.value }))}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="puestoEmpleo" className="sr-only">
                    Puesto de empleo
                  </label>
                  <input
                    id="puestoEmpleo"
                    name="puestoEmpleo"
                    required
                    placeholder="PUESTO DE EMPLEO"
                    value={prequalValues.puestoEmpleo}
                    onChange={(e) => setPrequalValues((v) => ({ ...v, puestoEmpleo: e.target.value }))}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="ingresoNeto" className="sr-only">
                    Ingreso neto
                  </label>
                  <input
                    id="ingresoNeto"
                    name="ingresoNeto"
                    required
                    placeholder="INGRESO NETO"
                    value={prequalValues.ingresoNeto}
                    onChange={(e) => setPrequalValues((v) => ({ ...v, ingresoNeto: e.target.value }))}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="fechaNacimiento" className="text-xs font-semibold uppercase text-brand-navy/70">
                    Fecha de nacimiento
                  </label>
                  <input
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    type="date"
                    required
                    value={prequalValues.fechaNacimiento}
                    onChange={(e) => setPrequalValues((v) => ({ ...v, fechaNacimiento: e.target.value }))}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="seguroSocial" className="sr-only">
                    Seguro social
                  </label>
                  <input
                    id="seguroSocial"
                    name="seguroSocial"
                    required
                    placeholder="SEGURO SOCIAL"
                    value={prequalValues.seguroSocial}
                    onChange={(e) => setPrequalValues((v) => ({ ...v, seguroSocial: e.target.value }))}
                    className={fieldClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="direccionPostal" className="sr-only">
                    Dirección postal
                  </label>
                  <input
                    id="direccionPostal"
                    name="direccionPostal"
                    required
                    placeholder="DIRECCIÓN POSTAL"
                    value={prequalValues.direccionPostal}
                    onChange={(e) => setPrequalValues((v) => ({ ...v, direccionPostal: e.target.value }))}
                    className={fieldClass}
                  />
                </div>

                <label className="sm:col-span-2 flex items-start gap-3 rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-3 text-sm font-medium text-brand-navy">
                  <input
                    type="checkbox"
                    required
                    checked={prequalValues.autorizacionCredito}
                    onChange={(e) => setPrequalValues((v) => ({ ...v, autorizacionCredito: e.target.checked }))}
                    className="mt-1 h-4 w-4 rounded border-brand-blue"
                  />
                  <span>Autorizo la indagación de crédito para fines de evaluación de pre-calificación.</span>
                </label>

                <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={prequalStatus === "submitting"}
                    className="rounded-lg bg-brand-navy px-6 py-3 text-sm font-bold text-white hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {prequalStatus === "submitting" ? "ENVIANDO..." : "ENVIAR PRE-CALIFICACIÓN"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPrequalModal(false)}
                    className="rounded-lg border border-brand-navy/20 px-5 py-3 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
                  >
                    Completar luego
                  </button>
                </div>

                {prequalStatus === "error" && (
                  <p className="sm:col-span-2 text-sm font-semibold text-red-700" role="alert">
                    {prequalError}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
