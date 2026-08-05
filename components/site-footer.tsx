import Link from "next/link"
import { CossecLogo, EqualHousingLogo } from "@/components/brand-logos"

export function SiteFooter() {
  return (
    <footer className="bg-brand-mint">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-4 text-[11px] leading-relaxed text-muted-foreground">
            <p>
              Préstamo de Autos Nuevos. Sujeto a aprobación de crédito. Ciertas restricciones y condiciones aplican.
              Financiamiento de auto nuevo desde 2.99% APR hasta 48 meses para pagar, 0 pronto con póliza GAP. Empírica
              de 760 o más y crédito excelente (1.0.0). La oferta es válida del 1 de agosto de 2026 al 30 de septiembre
              de 2026. Acciones y depósitos asegurados hasta $250,000 por COSSEC, no por el Gobierno Federal. Más
              detalles en las sucursales.
            </p>
            <p>
              Sujeto a aprobación de crédito. Ciertas restricciones y condiciones aplican. (1) Pago de $3,000 con interés
              al 4.50% a 48 meses. (2) Pago de $5,000 con interés al 5.95% a 60 meses. (3) Pago de $10,000 con interés al
              6.95% a 72 meses. (4) Pago de $15,000 con interés al 7.95% a 84 meses. Empírica de 750 o más y crédito
              excelente (1.0.0). La oferta es válida del 1 de agosto de 2026 al 30 de septiembre de 2026. Se requiere el
              10% del monto del préstamo para las acciones. Acciones y depósitos asegurados hasta $250,000 por COSSEC,
              no por el Gobierno Federal. Más detalles en las sucursales.
            </p>
          </div>

          <div className="flex items-center gap-6 md:flex-col md:items-end md:gap-5">
            <CossecLogo />
            <EqualHousingLogo />
          </div>
        </div>

        <div className="mt-10 border-t border-brand-navy/10 pt-5">
          <nav aria-label="Políticas" className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-brand-blue">
            <Link href="/politicas-de-privacidad" className="transition-colors hover:text-brand-navy hover:underline">
              Políticas de Privacidad
            </Link>
            <Link
              href="/politicas-de-proteccion-de-datos"
              className="transition-colors hover:text-brand-navy hover:underline"
            >
              Políticas de Protección de Datos
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
