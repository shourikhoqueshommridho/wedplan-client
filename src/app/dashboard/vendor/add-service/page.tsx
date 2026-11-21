import type { Metadata } from "next"

import { VendorShell } from "@/components/vendor/dashboard/vendor-shell"
import { VendorServicesClient } from "@/app/dashboard/vendor/services/vendor-services-client"
import { requireServerRole } from "@/lib/auth-server"
import { loadVendorBookings, loadVendorServices } from "@/lib/vendor-server"

export const metadata: Metadata = {
  title: "Add Service - Vendor Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

/**
 * Own route for the sidebar's "Add Service" item. It reuses the existing
 * service form in create mode instead of redirecting to My Services, so the
 * sidebar highlights the route the vendor actually clicked.
 */
export default async function VendorAddServicePage() {
  const session = await requireServerRole("vendor", "/dashboard/vendor/add-service")

  const [servicesResult, bookingsResult] = await Promise.all([
    loadVendorServices(),
    loadVendorBookings(),
  ])

  return (
    <VendorShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        role: session.user.role,
      }}
      pendingBookings={bookingsResult.items.filter((booking) => booking.status === "pending").length}
    >
      <VendorServicesClient
        key="create"
        initialServices={servicesResult.items}
        dataError={!servicesResult.ok}
        initialEditId={null}
        initialCreate
        searchParams={{}}
      />
    </VendorShell>
  )
}
