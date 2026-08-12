import { NextResponse } from "next/server"
import { getSiteSetting, saveFormSubmission } from "@/lib/db"
import { AGENT_NOTIFICATION_EMAILS_SETTING_KEY, parseNotificationEmails } from "@/lib/site-settings"

const fromEmail = "contacto@paresolver.com"

type AgentPayload = {
  nombre: string
  correo: string
  telefono: string
  pueblo: string
  producto: string
  tipoEmpleo: "" | "regular" | "negocio-propio" | "pensionado" | "retirado"
  tienePlanillas?: "si" | "no"
  posicionEmpleo: string
  tiempoEmpleo: string
  lugarEmpleo: string
  ingresoNeto: string
  fechaNacimiento: string
  autorizacionCredito: boolean
  seguroSocial: string
  direccionPostal: string
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;")
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

function tableRow(label: string, value: string) {
  return `<tr><td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;width:35%;font-weight:700;">${escapeHtml(label)}</td><td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(value)}</td></tr>`
}

function agentEmailTemplate(payload: AgentPayload) {
  const tipoEmpleoLabel = {
    "": "No informado",
    regular: "Regular",
    "negocio-propio": "Negocio propio",
    pensionado: "Pensionado",
    retirado: "Retirado",
  }[payload.tipoEmpleo]
  const contactRows = [
    ["Nombre", payload.nombre],
    ["Correo electrónico", payload.correo],
    ["Teléfono", payload.telefono],
    ["Pueblo", payload.pueblo],
    ["Dirección postal", payload.direccionPostal],
    ["Producto solicitado", payload.producto],
  ]
  const evaluationRows = [
    ["Tipo de empleo", tipoEmpleoLabel],
    ["Posee últimas dos planillas", payload.tipoEmpleo === "negocio-propio" ? (payload.tienePlanillas === "si" ? "Sí" : "No") : "No aplica"],
    ["Posición de empleo", payload.posicionEmpleo],
    ["Tiempo de empleo", payload.tiempoEmpleo],
    ["Lugar de empleo", payload.lugarEmpleo],
    ["Ingreso neto", payload.ingresoNeto],
    ["Fecha de nacimiento", payload.fechaNacimiento],
    ["Autorización de crédito", payload.autorizacionCredito ? "Sí, autorizó" : "No autorizó"],
    ["Seguro social", payload.seguroSocial],
    ["Fecha y hora de envío", new Date().toLocaleString("es-PR", { dateStyle: "full", timeStyle: "short" })],
  ]

  return `
    <div style="font-family:Arial,sans-serif;background:#f5f7ff;padding:24px;color:#16266b;">
      <div style="max-width:760px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dce4ff;">
        <div style="background:linear-gradient(90deg,#16266b,#0b5fd9);padding:20px 24px;">
          <h1 style="margin:0;color:#fff;font-size:22px;">Registro de Agente</h1>
          <p style="margin:8px 0 0;color:#d6e4ff;font-size:13px;">Pa' Resolver - Registro manual de cliente</p>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Un agente registró un cliente con su información de pre-calificación.</p>
          <h2 style="margin:0 0 10px;font-size:16px;color:#0b5fd9;">Datos del cliente</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:18px;">${contactRows.map(([label, value]) => tableRow(label, value)).join("")}</table>
          <h2 style="margin:0 0 10px;font-size:16px;color:#0b5fd9;">Información para evaluación</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">${evaluationRows.map(([label, value]) => tableRow(label, value)).join("")}</table>
        </div>
      </div>
    </div>
  `
}

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ message: "RESEND_API_KEY no está configurada." }, { status: 500 })
    }

    const body = (await request.json()) as Partial<AgentPayload>
    if (body.tipoEmpleo && !["regular", "negocio-propio", "pensionado", "retirado"].includes(body.tipoEmpleo)) {
      return NextResponse.json({ message: "Selecciona un tipo de empleo válido." }, { status: 400 })
    }

    const payload: AgentPayload = {
      nombre: (body.nombre ?? "").trim(),
      correo: (body.correo ?? "").trim(),
      telefono: (body.telefono ?? "").trim(),
      pueblo: (body.pueblo ?? "").trim(),
      producto: (body.producto ?? "").trim(),
      tipoEmpleo: (body.tipoEmpleo ?? "") as AgentPayload["tipoEmpleo"],
      tienePlanillas: body.tienePlanillas === "si" ? "si" : body.tienePlanillas === "no" ? "no" : undefined,
      posicionEmpleo: (body.posicionEmpleo ?? "").trim(),
      tiempoEmpleo: (body.tiempoEmpleo ?? "").trim(),
      lugarEmpleo: (body.lugarEmpleo ?? "").trim(),
      ingresoNeto: (body.ingresoNeto ?? "").trim(),
      fechaNacimiento: (body.fechaNacimiento ?? "").trim(),
      autorizacionCredito: body.autorizacionCredito === true,
      seguroSocial: (body.seguroSocial ?? "").trim(),
      direccionPostal: (body.direccionPostal ?? "").trim(),
    }

    const hasAnyValue = Object.entries(payload).some(([key, value]) =>
      key === "autorizacionCredito" ? value === true : typeof value === "string" && value.length > 0,
    )
    if (!hasAnyValue) {
      return NextResponse.json({ message: "Completa al menos un campo antes de registrar al cliente." }, { status: 400 })
    }

    if (payload.fechaNacimiento) {
      const age = getAgeFromBirthDate(payload.fechaNacimiento)
      if (age === null || age < 18) {
        return NextResponse.json({ message: age === null ? "Fecha de nacimiento inválida." : "El cliente debe ser mayor de 18 años." }, { status: 400 })
      }
    }

    const notificationEmails = parseNotificationEmails(await getSiteSetting(AGENT_NOTIFICATION_EMAILS_SETTING_KEY))

    await saveFormSubmission({
      formType: "agente",
      name: payload.nombre,
      email: payload.correo,
      phone: payload.telefono,
      payload: { ...payload },
      source: "call-center",
    })

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromEmail,
        to: notificationEmails,
        ...(payload.correo ? { reply_to: payload.correo } : {}),
        subject: `Agente | ${payload.nombre} | ${payload.telefono} | ${payload.producto}`,
        html: agentEmailTemplate(payload),
      }),
    })

    if (!resendResponse.ok) {
      return NextResponse.json({ message: "El registro se guardó, pero no se pudo enviar la notificación." }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error processing agent submission:", error)
    return NextResponse.json({ message: "No se pudo procesar el registro del agente." }, { status: 500 })
  }
}