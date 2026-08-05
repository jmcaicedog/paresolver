import Link from "next/link"
import { PaResolverLogo, CaguasCoopLogo } from "@/components/brand-logos"

export function PolicyLayout({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-brand-mint">
      <header className="bg-brand-blue text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6">
          <div className="flex items-center gap-5">
            <PaResolverLogo variant="dark" />
            <span className="hidden h-10 w-px bg-white/25 sm:block" />
            <CaguasCoopLogo variant="dark" className="hidden sm:inline-flex" />
          </div>
          <Link
            href="/"
            className="text-lg font-bold transition-colors hover:text-brand-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Volver al inicio
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
        <h1 className="text-balance text-4xl font-extrabold text-brand-blue sm:text-6xl">{title}</h1>
        <div className="mt-8 space-y-6 text-pretty text-base leading-relaxed text-brand-navy/80 sm:text-lg">
          {children}
        </div>
      </article>
    </main>
  )
}
