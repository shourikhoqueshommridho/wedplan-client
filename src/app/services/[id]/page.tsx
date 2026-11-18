import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { AlertTriangle, Link2Off } from "lucide-react"

import { ServiceDetailMessage } from "@/components/service/service-detail-message"
import { ServiceDetailRetry } from "@/components/service/service-detail-retry"
import { ServiceDetailShell } from "@/components/service/service-detail-shell"
import { ServiceDetailSkeleton } from "@/components/service/service-detail-skeleton"
import { ServiceDetailsView } from "@/components/service/service-details-view"
import { fetchRelatedServices, fetchServiceById } from "@/lib/service-detail"

interface ServiceDetailsPageProps {
  params: Promise<{ id: string }>
}

/**
 * Service details depend entirely on a runtime MongoDB record and the shared
 * navbar reads `usePathname()`, which cannot resolve while a dynamic param is
 * unknown during prerendering. Allowing this one segment to block keeps the
 * full brand chrome instead of an empty placeholder bar.
 */
export const instant = false

export async function generateMetadata({
  params,
}: ServiceDetailsPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await fetchServiceById(id)

  if (result.status === "invalid-id") {
    return {
      title: "Invalid Service Link",
      robots: { index: false, follow: true },
    }
  }

  if (result.status === "not-found") {
    return {
      title: "Service Not Found",
      robots: { index: false, follow: true },
    }
  }

  if (result.status === "error") {
    return { title: "Service Details" }
  }

  const { service } = result
  const description = service.shortDescription.slice(0, 155)

  return {
    title: service.name,
    description,
    openGraph: {
      title: service.name,
      description,
      type: "website",
      images: [{ url: service.image.src, alt: service.image.alt }],
    },
  }
}

export default function ServiceDetailsPage({ params }: ServiceDetailsPageProps) {
  return (
    <ServiceDetailShell>
      <Suspense fallback={<ServiceDetailSkeleton />}>
        <ServiceDetailsContent params={params} />
      </Suspense>
    </ServiceDetailShell>
  )
}

async function ServiceDetailsContent({ params }: ServiceDetailsPageProps) {
  const { id } = await params
  const result = await fetchServiceById(id)

  if (result.status === "not-found") {
    notFound()
  }

  if (result.status === "invalid-id") {
    return (
      <ServiceDetailMessage
        icon={Link2Off}
        eyebrow="Invalid service link"
        title="This service link is broken"
        description="The address contains a service ID that is not valid. It may have been copied incorrectly. Browse the full collection to find the vendor you are looking for."
      />
    )
  }

  if (result.status === "error") {
    return (
      <ServiceDetailMessage
        icon={AlertTriangle}
        eyebrow="Something went wrong"
        title="We could not load this service"
        description="The service details are temporarily unavailable. Please try again in a moment, or browse other wedding professionals in the meantime."
      >
        <ServiceDetailRetry />
      </ServiceDetailMessage>
    )
  }

  const relatedServices = await fetchRelatedServices(
    result.service.category,
    result.service.id,
  )

  return <ServiceDetailsView service={result.service} relatedServices={relatedServices} />
}
