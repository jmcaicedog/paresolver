import type { Metadata } from "next"
import { PolicyLayout } from "@/components/policy-layout"

export const metadata: Metadata = {
  title: "Políticas de Privacidad | Pa' Resolver - CAGUAS COOP",
  description: "Conoce cómo CAGUAS COOP protege y maneja tu información personal.",
}

const paragraph =
  "Recopilamos la información que nos provees al completar el formulario de solicitud, como tu nombre, correo electrónico, teléfono, pueblo y el producto de interés. Utilizamos estos datos exclusivamente para procesar tu solicitud de préstamo, comunicarnos contigo y ofrecerte los productos y servicios de CAGUAS COOP. No compartimos tu información con terceros sin tu consentimiento, salvo cuando sea requerido por ley. Puedes solicitar la actualización o eliminación de tus datos en cualquier momento contactando a nuestro servicio al cliente."

export default function PoliticasDePrivacidad() {
  return (
    <PolicyLayout title="Políticas de Privacidad">
      <p>{paragraph}</p>
      <p>{paragraph}</p>
      <p>{paragraph}</p>
    </PolicyLayout>
  )
}
