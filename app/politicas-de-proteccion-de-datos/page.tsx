import type { Metadata } from "next"
import { PolicyLayout } from "@/components/policy-layout"

export const metadata: Metadata = {
  title: "Políticas de Protección de Datos | Pa' Resolver - CAGUAS COOP",
  description: "Conoce las medidas de seguridad que CAGUAS COOP aplica para proteger tus datos.",
}

const paragraph =
  "En CAGUAS COOP aplicamos medidas de seguridad administrativas, técnicas y físicas para proteger tus datos personales contra accesos no autorizados, pérdida o divulgación indebida. La información se almacena en sistemas cifrados y solo el personal autorizado tiene acceso a ella para los fines para los que fue recopilada. Conservamos tus datos únicamente durante el tiempo necesario para cumplir con los propósitos descritos y con las obligaciones legales aplicables. Tienes derecho a acceder, rectificar y solicitar la eliminación de tu información en cualquier momento."

export default function PoliticasDeProteccionDeDatos() {
  return (
    <PolicyLayout title="Políticas de Protección de Datos">
      <p>{paragraph}</p>
      <p>{paragraph}</p>
      <p>{paragraph}</p>
    </PolicyLayout>
  )
}
