import type { Metadata } from "next"
import { AgentForm } from "@/components/agent-form"
import { PolicyLayout } from "@/components/policy-layout"

export const metadata: Metadata = {
  title: "Formulario agente | Pa' Resolver",
  description: "Registro manual de clientes para agentes autorizados.",
}

export default function AgentPage() {
  return (
    <PolicyLayout title="Formulario agente">
      <p className="max-w-2xl font-medium">
        Registra en una sola gestión la información inicial y los datos de pre-calificación suministrados por el cliente.
      </p>
      <AgentForm />
    </PolicyLayout>
  )
}