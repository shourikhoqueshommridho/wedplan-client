import type { Metadata } from "next"
import { SearchX } from "lucide-react"

import { ServiceDetailMessage } from "@/components/service/service-detail-message"
import { ServiceDetailShell } from "@/components/service/service-detail-shell"

export const metadata: Metadata = {
  title: "Service Not Found",
  robots: { index: false, follow: true },
}

export default function ServiceDetailsNotFound() {
  return (
    <ServiceDetailShell>
      <ServiceDetailMessage
        icon={SearchX}
        eyebrow="404 — Service not found"
        title="This service is no longer available"
        description="The service you are looking for may have been removed, unpublished, or the link may be incorrect. Explore the collection to discover other trusted wedding professionals."
      />
    </ServiceDetailShell>
  )
}
