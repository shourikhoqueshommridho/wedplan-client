import type { Metadata } from "next"

import { VendorProfileClient } from "@/components/vendor/dashboard/vendor-profile-client"
import { VendorShell } from "@/components/vendor/dashboard/vendor-shell"
import { requireServerRole } from "@/lib/auth-server"
import { loadVendorBookings, loadVendorProfile } from "@/lib/vendor-server"

export const metadata: Metadata = {
  title: "Profile Settings - Vendor Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function VendorSettingsPage() {
  const session = await requireServerRole("vendor", "/dashboard/vendor/settings")

  const [profileResult, bookingsResult] = await Promise.all([
    loadVendorProfile(),
    loadVendorBookings(),
  ])

  const dataError = !profileResult.ok || !bookingsResult.ok
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
      <VendorProfileClient
        profile={profileResult.profile}
        vendorName={session.user.name}
        vendorEmail={session.user.email}
        dataError={dataError}
      />
    </VendorShell>
  )
}
