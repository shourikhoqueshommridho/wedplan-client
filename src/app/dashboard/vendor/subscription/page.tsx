import type { Metadata } from "next"

import { SubscriptionManager } from "@/components/vendor/dashboard/subscription-manager"
import { VendorShell } from "@/components/vendor/dashboard/vendor-shell"
import { fetchWithSession, requireServerRole } from "@/lib/auth-server"
import { parseVendorSubscriptionResponse } from "@/lib/subscription-data"
import { loadVendorBookings } from "@/lib/vendor-server"

export const metadata: Metadata = {
  title: "Subscription - Vendor Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function VendorSubscriptionPage() {
  const session = await requireServerRole("vendor", "/dashboard/vendor/subscription")
  const [subscriptionResponse, bookingsResult] = await Promise.all([
    fetchWithSession("/api/stripe/subscription"),
    loadVendorBookings(),
  ])

  const subscription = subscriptionResponse?.ok
    ? parseVendorSubscriptionResponse(await subscriptionResponse.json().catch(() => null))
    : null

  const pendingBookings = bookingsResult.items.filter(
    (booking) => booking.status === "pending",
  ).length

  return (
    <VendorShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        role: session.user.role,
      }}
      pendingBookings={pendingBookings}
    >
      <SubscriptionManager initialSubscription={subscription} />
    </VendorShell>
  )
}
