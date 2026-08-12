import { NextResponse } from "next/server"
import { getSiteSetting, saveFormSubmission } from "@/lib/db"
import { NOTIFICATION_EMAILS_SETTING_KEY, parseNotificationEmails } from "@/lib/site-settings"

const resendApiKey = process.env.RESEND_API_KEY
const fromEmail = "contacto@paresolver.com"

type PrecalificacionPayload = {
  nombre: string
  correo: string
  telefono: string
  pueblo: string
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
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

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

function precalificacionEmailTemplate(payload: PrecalificacionPayload) {
  const submittedAt = new Date().toLocaleString("es-PR", {
    dateStyle: "full",
    timeStyle: "short",
  })

  const tipoEmpleoLabel = {
    "": "No informado",
    regular: "Regular",
    "negocio-propio": "Negocio propio",
    pensionado: "Pensionado",
    retirado: "Retirado",
  }[payload.tipoEmpleo]
  const autorizacionLabel = payload.autorizacionCredito ? "Sí, autorizó" : "No autorizó"

  return `
  <div style="font-family:Arial,sans-serif;background:#f5f7ff;padding:24px;color:#16266b;">
    <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dce4ff;">
      <div style="background:linear-gradient(90deg,#16266b,#0b5fd9);padding:20px 24px;">
        <h1 style="margin:0;color:#fff;font-size:22px;">Solicitud de Pre-calificación</h1>
        <p style="margin:8px 0 0;color:#d6e4ff;font-size:13px;">Pa' Resolver - Formulario de Preaprobado</p>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">
          Se recibió un formulario completo para estudio de pre-calificación.
        </p>

        <h2 style="margin:0 0 10px;font-size:16px;color:#0b5fd9;">Datos de contacto</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;width:35%;font-weight:700;">Nombre</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.nombre)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Correo electrónico</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.correo)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Teléfono</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.telefono)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Pueblo</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.pueblo)}</td>
          </tr>
        </table>

        <h2 style="margin:0 0 10px;font-size:16px;color:#0b5fd9;">Información para pre-calificación</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;width:35%;font-weight:700;">Tipo de empleo</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${tipoEmpleoLabel}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Posee últimas dos planillas</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${payload.tipoEmpleo === "negocio-propio" ? (payload.tienePlanillas === "si" ? "Sí" : "No") : "No aplica"}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Posición de empleo</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.posicionEmpleo)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Tiempo de empleo</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.tiempoEmpleo)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Lugar de empleo</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.lugarEmpleo)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Ingreso neto</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.ingresoNeto)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Fecha de nacimiento</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.fechaNacimiento)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Autorización de crédito</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${autorizacionLabel}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Seguro social</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.seguroSocial)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Dirección postal</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.direccionPostal)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Fecha y hora de envío</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(submittedAt)}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
  `
}

export async function POST(request: Request) {
  try {
    if (!resendApiKey) {
      return NextResponse.json({ message: "RESEND_API_KEY no está configurada." }, { status: 500 })
    }

    const body = (await request.json()) as Partial<PrecalificacionPayload>

    const payload: PrecalificacionPayload = {
      nombre: (body.nombre ?? "").trim(),
      correo: (body.correo ?? "").trim(),
      telefono: (body.telefono ?? "").trim(),
      pueblo: (body.pueblo ?? "").trim(),
      tipoEmpleo: ["regular", "negocio-propio", "pensionado", "retirado"].includes(body.tipoEmpleo ?? "")
        ? body.tipoEmpleo as PrecalificacionPayload["tipoEmpleo"]
        : "",
      tienePlanillas: body.tienePlanillas === "si" ? "si" : body.tienePlanillas === "no" ? "no" : undefined,
      posicionEmpleo: (body.posicionEmpleo ?? "").trim(),
      tiempoEmpleo: (body.tiempoEmpleo ?? "").trim(),
      lugarEmpleo: (body.lugarEmpleo ?? "").trim(),
      ingresoNeto: (body.ingresoNeto ?? "").trim(),
      fechaNacimiento: (body.fechaNacimiento ?? "").trim(),
      autorizacionCredito: Boolean(body.autorizacionCredito),
      seguroSocial: (body.seguroSocial ?? "").trim(),
      direccionPostal: (body.direccionPostal ?? "").trim(),
    }

    if (
      !payload.nombre ||
      !payload.telefono ||
      !payload.pueblo ||
      !payload.posicionEmpleo ||
      !payload.tiempoEmpleo ||
      !payload.lugarEmpleo ||
      !payload.ingresoNeto ||
      !payload.fechaNacimiento ||
      !payload.seguroSocial ||
      !payload.direccionPostal
    ) {
      return NextResponse.json({ message: "Faltan campos obligatorios." }, { status: 400 })
    }

    if (payload.tipoEmpleo === "negocio-propio" && !payload.tienePlanillas) {
      return NextResponse.json({ message: "Debe indicar si posee las últimas dos planillas." }, { status: 400 })
    }

    const age = getAgeFromBirthDate(payload.fechaNacimiento)
    if (age === null) {
      return NextResponse.json({ message: "Fecha de nacimiento inválida." }, { status: 400 })
    }

    if (age < 18) {
      return NextResponse.json({ message: "Debe ser mayor de 18 años para continuar." }, { status: 400 })
    }

    if (!payload.autorizacionCredito) {
      return NextResponse.json({ message: "La autorización de crédito es obligatoria." }, { status: 400 })
    }

    const subject = `Pre-calificación | ${payload.nombre} | ${payload.telefono} | ${tipoEmpleoLabel}`
    const notificationEmails = parseNotificationEmails(await getSiteSetting(NOTIFICATION_EMAILS_SETTING_KEY))

    await saveFormSubmission({
      formType: "pre_calificacion",
      name: payload.nombre,
      email: payload.correo,
      phone: payload.telefono,
      payload: { ...payload },
    })

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: notificationEmails,
        ...(payload.correo ? { reply_to: payload.correo } : {}),
        subject,
        html: precalificacionEmailTemplate(payload),
      }),
    })

    if (!resendResponse.ok) {
      return NextResponse.json(
        { message: "No se pudo enviar la notificación de pre-calificación." },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "No se pudo procesar la pre-calificación." }, { status: 500 })
  }
}
