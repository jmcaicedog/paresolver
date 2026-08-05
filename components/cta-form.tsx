"use client"

import Image from "next/image"
import { useState } from "react"
import { Reveal } from "@/components/reveal"

const PRODUCTS = ["$3,000", "$5,000", "$10,000", "$15,000", "Otro monto"]
const PUEBLOS = [
  "Caguas",
  "San Juan",
  "Bayamón",
  "Carolina",
  "Ponce",
  "Gurabo",
  "Juncos",
  "Cidra",
  "Aguas Buenas",
  "San Lorenzo",
  "Humacao",
  "Otro",
]

export function CtaForm() {
  const [submitted, setSubmitted] = useState(false)
  const [values, setValues] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    pueblo: "",
    producto: "",
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
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
                className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-lg"
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-lime text-3xl text-brand-navy">
                  ✓
                </div>
                <h3 className="mt-4 text-2xl font-extrabold text-brand-navy">¡Solicitud recibida!</h3>
                <p className="mt-2 max-w-sm text-brand-navy/70">
                  Gracias{values.nombre ? `, ${values.nombre}` : ""}. Pronto te contactaremos para continuar con tu
                  préstamo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate={false}>
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
                  <select
                    id="pueblo"
                    name="pueblo"
                    required
                    value={values.pueblo}
                    onChange={(e) => setValues((v) => ({ ...v, pueblo: e.target.value }))}
                    className={`${fieldClass} ${values.pueblo ? "" : "text-brand-navy/60"}`}
                  >
                    <option value="" disabled>
                      PUEBLO
                    </option>
                    {PUEBLOS.map((p) => (
                      <option key={p} value={p} className="text-brand-navy">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="producto" className="sr-only">
                    Selecciona tu producto
                  </label>
                  <select
                    id="producto"
                    name="producto"
                    required
                    value={values.producto}
                    onChange={(e) => setValues((v) => ({ ...v, producto: e.target.value }))}
                    className={`${fieldClass} ${values.producto ? "" : "text-brand-navy/60"}`}
                  >
                    <option value="" disabled>
                      SELECCIONA TU PRODUCTO
                    </option>
                    {PRODUCTS.map((p) => (
                      <option key={p} value={p} className="text-brand-navy">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="group flex items-center justify-center gap-2 rounded-lg bg-brand-navy px-6 py-3.5 text-base font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-navy/30 sm:col-span-1"
                >
                  SOLICITAR AHORA
                  <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                    →
                  </span>
                </button>
              </form>
            )}
          </Reveal>

          <Reveal from="right" className="mx-auto hidden w-full max-w-[300px] lg:block">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-xl">
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
    </section>
  )
}
