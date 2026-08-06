import { NextResponse } from "next/server"

const resendApiKey = process.env.RESEND_API_KEY
const notificationEmail = "prestamos@caguascoop.com"
const fromEmail = "contacto@paresolver.com"

type LeadPayload = {
  nombre: string
  telefono: string
  pueblo: string
  correo: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function leadEmailTemplate(payload: LeadPayload) {
  const submittedAt = new Date().toLocaleString("es-PR", {
    dateStyle: "full",
    timeStyle: "short",
  })

  return `
  <div style="font-family:Arial,sans-serif;background:#f5f7ff;padding:24px;color:#16266b;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dce4ff;">
      <div style="background:linear-gradient(90deg,#16266b,#0b5fd9);padding:20px 24px;">
        <h1 style="margin:0;color:#fff;font-size:22px;">Nuevo Registro de Lead</h1>
        <p style="margin:8px 0 0;color:#d6e4ff;font-size:13px;">Pa' Resolver - Registro Inicial</p>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">
          Se ha recibido un nuevo formulario de prospecto en la página web.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;width:35%;font-weight:700;">Nombre</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.nombre)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Teléfono</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.telefono)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Pueblo</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.pueblo)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Correo electrónico</td>
            <td style="padding:10px;border:1px solid #e6ebff;">${escapeHtml(payload.correo)}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e6ebff;background:#f8faff;font-weight:700;">Fecha y hora del registro</td>
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

    const body = (await request.json()) as Partial<LeadPayload>

    const payload: LeadPayload = {
      nombre: (body.nombre ?? "").trim(),
      telefono: (body.telefono ?? "").trim(),
      pueblo: (body.pueblo ?? "").trim(),
      correo: (body.correo ?? "").trim(),
    }

    if (!payload.nombre || !payload.telefono || !payload.pueblo || !payload.correo) {
      return NextResponse.json({ message: "Faltan campos obligatorios." }, { status: 400 })
    }

    const subject = `Lead Nuevo | ${payload.nombre} | ${payload.telefono} | Registro Inicial`

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notificationEmail],
        reply_to: payload.correo,
        subject,
        html: leadEmailTemplate(payload),
      }),
    })

    if (!resendResponse.ok) {
      return NextResponse.json({ message: "No se pudo enviar la notificación de registro." }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "No se pudo procesar el registro." }, { status: 500 })
  }
}
