import Image from "next/image"
import { PaResolverLogo, CaguasCoopLogo } from "@/components/brand-logos"

export function SiteHero() {
  return (
    <section className="relative overflow-hidden bg-brand-blue text-white">
      {/* subtle decorative glow, purposeful depth without filler blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-10 pt-8 lg:grid-cols-2 lg:items-center lg:gap-6 lg:pb-16 lg:pt-12">
        {/* Left column */}
        <div className="relative z-10">
          <div className="flex items-center gap-5 rounded-2xl">
            <div className="animate-float">
              <PaResolverLogo variant="dark" />
            </div>
            <span className="h-10 w-px bg-white/25" />
            <CaguasCoopLogo variant="dark" />
          </div>

          <div className="mt-8 max-w-md rounded-[2rem] bg-brand-mint p-7 text-brand-navy shadow-xl sm:p-9">
            <h1 className="text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl">
              Préstamos Personales{" "}
              <span className="font-medium text-brand-navy/70">desde</span>
            </h1>
            <p className="mt-2 text-5xl font-extrabold text-brand-blue sm:text-6xl">
              $68.41 <span className="text-2xl font-semibold text-brand-navy/70 sm:text-3xl">mensual</span>
            </p>
          </div>

          <a
            href="#solicita"
            className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          >
            Solicitar ahora
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
              →
            </span>
          </a>
        </div>

        {/* Right column - imagery */}
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] rounded-bl-[5rem] shadow-2xl">
            <Image
              src="/images/hero-couple.png"
              alt="Pareja celebrando la aprobación de su préstamo personal en casa"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          {/* Floating finance still-life */}
          <div className="animate-float absolute -bottom-8 left-0 w-36 overflow-hidden rounded-2xl ring-4 ring-brand-mint shadow-2xl sm:w-48 lg:-left-12 lg:w-52">
            <Image
              src="/images/finance-objects.png"
              alt="Bolsa de dinero, casa y calculadora"
              width={320}
              height={320}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
