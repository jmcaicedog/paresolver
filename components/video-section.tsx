"use client"

import Image from "next/image"
import { useState } from "react"
import { Reveal } from "@/components/reveal"

// Replace with the real campaign video id when available.
const YOUTUBE_ID = "ScMzIvxBSi4"

export function VideoSection() {
  const [playing, setPlaying] = useState(false)

  return (
    <section className="bg-brand-navy py-14 sm:py-20">
      <div className="mx-auto max-w-4xl px-5">
        <Reveal>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-brand-mint shadow-2xl ring-1 ring-white/10">
            {playing ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
                title="Video Pa' Resolver - CAGUAS COOP"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label="Reproducir video"
                className="group absolute inset-0 grid place-items-center"
              >
                <Image
                  src="/images/hero-couple.png"
                  alt="Portada del video de Caguas Coop"
                  fill
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-cover"
                />
                <span className="absolute inset-0 bg-linear-to-b from-brand-navy/25 via-brand-navy/15 to-brand-navy/35" aria-hidden="true" />
                <span className="relative grid h-20 w-20 place-items-center rounded-full bg-brand-blue text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-blue" aria-hidden="true" />
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-1">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="absolute bottom-5 text-sm font-semibold text-white/95">
                  Reproducir video
                </span>
              </button>
            )}
          </div>
        </Reveal>

        <Reveal className="mt-10 flex items-center justify-center gap-4" delay={120}>
          <a
            href="tel:+17874994000"
            className="group flex items-center gap-4 rounded-2xl px-4 py-2 transition-colors hover:bg-white/5"
          >
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-lime text-brand-navy shadow-lg transition-transform duration-300 group-hover:scale-105">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.4 11.4 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
              </svg>
            </span>
            <span className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">787.499.4000</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
