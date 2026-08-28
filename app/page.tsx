"use client"
import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import AboutUs from "@/components/about-us"
import FeaturesSection from "@/components/features-section"
import MediaStreamsSection from "@/components/media-streams-section"
import Footer from "@/components/footer"
import PartnerTicker from "@/components/partner-ticker"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-14">
      <Navigation />
      <HeroSection />
      <AboutUs />
      {/* <StatsSection /> */}
      <FeaturesSection />
      <MediaStreamsSection />
      <Footer />
      <PartnerTicker />
    </div>
  )
}

