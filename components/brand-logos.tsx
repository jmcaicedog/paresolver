import Image from "next/image"
import { cn } from "@/lib/utils"

export function PaResolverLogo({
  className,
}: {
  className?: string
  variant?: "dark" | "light"
}) {
  return (
    <span className={cn("inline-flex items-center", className)} aria-label="Pa' Resolver">
      <Image
        src="/images/logos/logo-pa-resolver.png"
        alt="Pa' Resolver"
        width={160}
        height={60}
        className="h-12 w-auto object-contain"
      />
    </span>
  )
}

export function CaguasCoopLogo({
  className,
}: {
  className?: string
  variant?: "dark" | "light"
}) {
  return (
    <span className={cn("inline-flex items-center", className)} aria-label="Caguas Coop">
      <Image
        src="/images/logos/logo-caguas-coop.png"
        alt="Caguas Coop"
        width={160}
        height={60}
        className="h-12 w-auto object-contain"
      />
    </span>
  )
}

export function CossecLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)} aria-label="COSSEC">
      <Image
        src="/images/logos/logo-cossec.png"
        alt="COSSEC"
        width={160}
        height={60}
        className="h-10 w-auto object-contain"
      />
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
