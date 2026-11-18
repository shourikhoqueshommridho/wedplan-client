import { Suspense } from "react"

import { Footer } from "@/components/home/footer"
import { Navbar } from "@/components/home/navbar"
import { BrowseServices } from "@/components/service/browse-services"
import { ServicesLoading } from "@/components/service/services-loading"

interface ServicesPageProps {
  searchParams: Promise<{
    category?: string | string[]
    search?: string | string[]
  }>
}

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default function ServicesPage({ searchParams }: ServicesPageProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cream-50">
      <Navbar />
      <Suspense fallback={<ServicesLoading />}>
        <ServicesContent searchParams={searchParams} />
      </Suspense>
      <Footer />
    </div>
  )
}

async function ServicesContent({ searchParams }: ServicesPageProps) {
  const query = await searchParams

  return (
    <main id="main-content" className="flex-1">
      <BrowseServices
        key={`${firstQueryValue(query.category) ?? ""}|${firstQueryValue(query.search) ?? ""}`}
        initialCategory={firstQueryValue(query.category)}
        initialSearch={firstQueryValue(query.search)}
      />
    </main>
  )
}
