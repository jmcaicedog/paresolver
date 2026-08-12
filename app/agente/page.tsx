import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AgentForm } from "@/components/agent-form"
import { PolicyLayout } from "@/components/policy-layout"
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth"
import { getAdminUserById } from "@/lib/db"

export const metadata: Metadata = {
  title: "Formulario agente | Pa' Resolver",
  description: "Registro manual de clientes para agentes autorizados.",
}

export default async function AgentPage() {
  const cookieStore = await cookies()
  const session = verifySession(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  if (!session || !(await getAdminUserById(session.userId))) {
    redirect("/admin/login")
  }

  return (
    <PolicyLayout title="Formulario agente" backHref="/admin" backLabel="Volver al dashboard">
      <p className="max-w-2xl font-medium">
        Registra en una sola gestión la información inicial y los datos de pre-calificación suministrados por el cliente.
      </p>
      <AgentForm />
    </PolicyLayout>
  )
}