import { SiteHero } from "@/components/site-hero"
import { PricingSection } from "@/components/pricing-section"
import { CtaForm } from "@/components/cta-form"
import { VideoSection } from "@/components/video-section"
import { SiteFooter } from "@/components/site-footer"
import { WhatsappButton } from "@/components/whatsapp-button"

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-mint">
      <SiteHero />
      <PricingSection />
      <CtaForm />
      <VideoSection />
      <SiteFooter />
      <WhatsappButton />
    </main>
  )
}
