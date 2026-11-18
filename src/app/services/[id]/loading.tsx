import { ServiceDetailShell } from "@/components/service/service-detail-shell"
import { ServiceDetailSkeleton } from "@/components/service/service-detail-skeleton"

export default function ServiceDetailsLoading() {
  return (
    <ServiceDetailShell>
      <ServiceDetailSkeleton />
    </ServiceDetailShell>
  )
}
