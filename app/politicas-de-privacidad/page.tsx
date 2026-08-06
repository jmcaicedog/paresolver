import type { Metadata } from "next"
import { PolicyLayout } from "@/components/policy-layout"

export const metadata: Metadata = {
  title: "Políticas de Privacidad | Pa' Resolver - CAGUAS COOP",
  description: "Conoce cómo CAGUAS COOP protege y maneja tu información personal.",
}

export default function PoliticasDePrivacidad() {
  return (
    <PolicyLayout title="Políticas de Privacidad">
      <p>
        Caguas Coop recopila información personal a través de sus formularios y canales digitales para atender
        consultas, orientar a los interesados y procesar solicitudes de productos financieros.
      </p>
      <p>
        La información de contacto, como nombre, teléfono y correo electrónico, podrá ser utilizada por Caguas Coop
        para comunicarse con la persona solicitante, dar seguimiento a su solicitud y ofrecer información sobre sus
        productos y servicios.
      </p>
      <p>
        ALTA Communication podrá utilizar exclusivamente la información de contacto autorizada para realizar
        comunicaciones promocionales relacionadas con Caguas Coop y la campaña “Pa’ Resolver”.
      </p>
      <p>
        ALTA Communication no podrá vender, compartir, reutilizar ni utilizar esta información para otros clientes o
        campañas.
      </p>
      <p>
        La información sensible o crediticia, incluyendo Seguro Social, fecha de nacimiento, ingresos, empleo,
        documentos de identidad e informes de crédito, será utilizada únicamente por Caguas Coop para verificar la
        identidad, realizar una indagación crediticia autorizada, evaluar y procesar la solicitud, prevenir fraude y
        cumplir con requisitos legales y regulatorios.
      </p>
      <p>
        La información sensible o crediticia no será utilizada para publicidad o mercadeo y no será compartida con
        ALTA Communication.
      </p>
      <p>
        Caguas Coop aplicará medidas razonables de seguridad para proteger la información y la conservará solamente
        durante el tiempo necesario o requerido por ley.
      </p>
      <p>
        La persona podrá solicitar la corrección de su información o dejar de recibir comunicaciones promocionales
        comunicándose con:
      </p>
      <p>
        CAGUAS COOP
        <br />
        Teléfono: (787) 499-4000
        <br />
        Correo electrónico: info@altacommunication.net
      </p>
      <p>Fecha de efectividad: 10 de agosto de 2026</p>
    </PolicyLayout>
  )
}
