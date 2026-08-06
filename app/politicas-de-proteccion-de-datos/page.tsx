import type { Metadata } from "next"
import { PolicyLayout } from "@/components/policy-layout"

export const metadata: Metadata = {
  title: "Políticas de Protección de Datos | Pa' Resolver - CAGUAS COOP",
  description: "Conoce las medidas de seguridad que CAGUAS COOP aplica para proteger tus datos.",
}

export default function PoliticasDeProteccionDeDatos() {
  return (
    <PolicyLayout title="Políticas de Protección de Datos">
      <p>
        Caguas Coop protegerá la información personal recopilada durante la campaña “Pa’ Resolver” mediante controles
        administrativos, técnicos y físicos razonables.
      </p>
      <p className="font-extrabold tracking-wide text-brand-blue">INFORMACIÓN DE CONTACTO</p>
      <p>Incluye nombre, teléfono, correo electrónico, municipio y producto de interés.</p>
      <p>
        Podrá ser utilizada por Caguas Coop para contacto, orientación, seguimiento y promoción de sus productos.
      </p>
      <p>
        ALTA Communication podrá utilizar esta información únicamente para ejecutar comunicaciones de mercadeo
        promocional autorizadas por Caguas Coop.
      </p>
      <p className="font-extrabold tracking-wide text-brand-blue">INFORMACIÓN SENSIBLE O CREDITICIA</p>
      <p>
        Incluye Seguro Social, fecha de nacimiento, ingresos, empleo, documentos de identidad, información financiera e
        informes de crédito.
      </p>
      <p>
        Esta información será utilizada exclusivamente por Caguas Coop para verificar identidad, realizar indagaciones
        crediticias autorizadas, evaluar solicitudes, prevenir fraude y cumplir con obligaciones legales.
      </p>
      <p>ALTA Communication no tendrá acceso a información sensible o crediticia.</p>
      <p>
        Los datos solo podrán utilizarse para los fines autorizados. No podrán venderse, transferirse, reutilizarse ni
        incorporarse a bases de datos de terceros.
      </p>
      <p>
        El acceso estará limitado al personal autorizado y la información será eliminada o destruida cuando ya no sea
        necesaria.
      </p>
      <p>Cualquier incidente de seguridad deberá notificarse inmediatamente a Caguas Coop.</p>
      <p>Correo electrónico: info@altacommunication.net</p>
      <p>Fecha de efectividad: 10 de agosto de 2026</p>
    </PolicyLayout>
  )
}
