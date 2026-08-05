import { cn } from "@/lib/utils"

/**
 * Stylized recreations of the campaign brand marks.
 * These are decorative typographic logos, not the official vector assets.
 */

export function PaResolverLogo({
  className,
  variant = "dark",
}: {
  className?: string
  variant?: "dark" | "light"
}) {
  const coinBg = variant === "light" ? "#16266b" : "#0b5fd9"
  const textColor = variant === "light" ? "#ffffff" : "#16266b"
  return (
    <span className={cn("inline-flex items-center gap-2", className)} aria-label="Pa' Resolver">
      <span
        className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full"
        style={{ backgroundColor: coinBg, boxShadow: "0 0 0 3px #a4d65e" }}
      >
        <span className="text-lg font-extrabold text-[#a4d65e]">$</span>
        <span className="absolute -top-1 left-1 h-1.5 w-1.5 rounded-full bg-[#a4d65e]" />
        <span className="absolute -top-0.5 right-1 h-1 w-1 rounded-full bg-[#a4d65e]" />
      </span>
      <span className="leading-[0.85]">
        <span className="block text-sm font-semibold italic" style={{ color: "#a4d65e" }}>
          Pa&apos;
        </span>
        <span className="block text-xl font-extrabold tracking-tight" style={{ color: textColor }}>
          Resolver
        </span>
      </span>
    </span>
  )
}

export function CaguasCoopLogo({
  className,
  variant = "dark",
}: {
  className?: string
  variant?: "dark" | "light"
}) {
  const textColor = variant === "light" ? "#ffffff" : "#16266b"
  const tagColor = variant === "light" ? "#a4d65e" : "#0b5fd9"
  return (
    <span className={cn("inline-flex items-center gap-2", className)} aria-label="Caguas Coop">
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="shrink-0">
        <path d="M20 3 L37 34 H27 L20 20 L13 34 H3 Z" fill={textColor} />
        <path d="M14.5 26 H25.5 L23 21 H17 Z" fill={tagColor} />
      </svg>
      <span className="leading-[0.82]">
        <span className="block text-lg font-extrabold tracking-tight" style={{ color: textColor }}>
          CAGUAS
        </span>
        <span className="block text-lg font-extrabold tracking-tight" style={{ color: textColor }}>
          COOP
        </span>
        <span className="mt-0.5 block text-[9px] font-medium italic" style={{ color: tagColor }}>
          ¡Mejor servicio, más beneficios!
        </span>
      </span>
    </span>
  )
}

export function CossecLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-brand-navy", className)} aria-label="COSSEC">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 2 L20 6 L26 6 L26 12 L30 16 L26 20 L26 26 L20 26 L16 30 L12 26 L6 26 L6 20 L2 16 L6 12 L6 6 L12 6 Z"
          fill="#0b5fd9"
        />
        <circle cx="16" cy="16" r="6" fill="#ffffff" />
      </svg>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold tracking-tight">COSSEC</span>
        <span className="block text-[7px] font-medium leading-tight text-muted-foreground">
          Corporación Pública para la Supervisión
          <br />y Seguro de Cooperativas de Puerto Rico
        </span>
      </span>
    </span>
  )
}

export function EqualHousingLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-brand-navy", className)} aria-label="Equal Housing Lender">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="2" fill="none" stroke="#16266b" strokeWidth="1.5" />
        <path d="M16 6 L27 14 H24 V25 H8 V14 H5 Z" fill="#16266b" />
        <rect x="13" y="18" width="6" height="7" fill="#ffffff" />
      </svg>
      <span className="text-[9px] font-bold uppercase leading-tight">
        Equal Housing
        <br />
        Lender
      </span>
    </span>
  )
}
