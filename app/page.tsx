import { SiteHero } from "@/components/site-hero"
import { PricingSection } from "@/components/pricing-section"
import { CtaForm } from "@/components/cta-form"
import { VideoSection } from "@/components/video-section"
import { SiteFooter } from "@/components/site-footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { getSiteSetting } from "@/lib/db"
import { DEFAULT_HOME_VIDEO_URL, HOME_VIDEO_SETTING_KEY } from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export default async function Home() {
  const videoUrl = (await getSiteSetting(HOME_VIDEO_SETTING_KEY)) ?? DEFAULT_HOME_VIDEO_URL

  return (
    <main className="min-h-screen bg-brand-mint">
      <SiteHero />
      <PricingSection />
      <CtaForm />
      <VideoSection videoUrl={videoUrl} />
      <SiteFooter />
      <WhatsappButton />
    </main>
  )
}
