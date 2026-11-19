import { Suspense } from "react"

import {
  FeaturedServices,
  FeaturedServicesLoading,
} from "@/components/home/featured-services"
import { Footer } from "@/components/home/footer"
import { Hero } from "@/components/home/hero"
import { HowItWorks } from "@/components/home/how-it-works"
import { Navbar } from "@/components/home/navbar"
import { ServiceCategories } from "@/components/home/service-categories"
import { WhyChoose } from "@/components/home/why-choose"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-wine-800 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-cream-50 focus:outline-none focus:ring-2 focus:ring-wine-300"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1">
        <Hero />
        <Suspense fallback={<FeaturedServicesLoading />}>
          <FeaturedServices />
        </Suspense>
        <ServiceCategories />
        <HowItWorks />
        <WhyChoose />
      </main>

      <Footer />
    </div>
  )
}
