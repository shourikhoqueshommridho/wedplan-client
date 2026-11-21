import type { Metadata } from "next"

import { VendorBookingsClient } from "@/components/vendor/dashboard/vendor-bookings-client"
import { VendorShell } from "@/components/vendor/dashboard/vendor-shell"
import { parseBooking, parseList } from "@/lib/account-data"
import { fetchWithSession, requireServerRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Booking Requests - Vendor Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function VendorBookingsPage() {
  const session = await requireServerRole("vendor", "/dashboard/vendor/bookings")

  // The Express API already scopes `/api/bookings` to the authenticated vendor.
  const bookingsResponse = await fetchWithSession("/api/bookings")
  const dataError = !bookingsResponse?.ok
  const bookings = bookingsResponse?.ok
    ? parseList(await bookingsResponse.json(), "bookings", parseBooking)
    : []

  return (
    <VendorShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        role: session.user.role,
      }}
      pendingBookings={bookings.filter((booking) => booking.status === "pending").length}
    >
      <VendorBookingsClient bookings={bookings} dataError={dataError} />
    </VendorShell>
  )
}
