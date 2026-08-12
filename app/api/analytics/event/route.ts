import { NextResponse } from "next/server"
import { saveAnalyticsEvent } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { eventName?: string; path?: string }

    if (body.eventName !== "whatsapp_click") {
      return NextResponse.json({ message: "Evento no válido." }, { status: 400 })
    }

    await saveAnalyticsEvent({
      eventName: body.eventName,
      path: body.path?.startsWith("/") ? body.path : "/",
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "No se pudo guardar el evento." }, { status: 500 })
  }
}