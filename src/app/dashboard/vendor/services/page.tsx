import type { Metadata } from "next"

import { VendorShell } from "@/components/vendor/dashboard/vendor-shell"
import { VendorServicesClient } from "./vendor-services-client"
import {
  parseBooking,
  parseList,
  parseVendorService,
} from "@/lib/account-data"
import { fetchWithSession, requireServerRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "My Services - Vendor Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

interface ServicesPageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    status?: string
    edit?: string
    add?: string
  }>
}

export default async function VendorServicesPage({ searchParams }: ServicesPageProps) {
  const session = await requireServerRole("vendor", "/dashboard/vendor")

  const { search, category, status, edit, add } = await searchParams

  const queryParams = new URLSearchParams()
  if (search) queryParams.set("search", search)
  if (category) queryParams.set("category", category)
  if (status) queryParams.set("status", status)

  const servicesResponse = await fetchWithSession(
    `/api/vendor/services?${queryParams.toString()}`,
  )

  const services = servicesResponse?.ok
    ? parseList(await servicesResponse.json(), "services", parseVendorService)
    : []

  const dataError = !servicesResponse?.ok

  const pendingBookingsResponse = await fetchWithSession("/api/bookings")
  const pendingBookings =
    pendingBookingsResponse?.ok
      ? parseList(await pendingBookingsResponse.json(), "bookings", parseBooking).filter(
          (booking) => booking.status === "pending",
        ).length
      : 0

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
      <VendorServicesClient
        key={`${edit ?? ""}:${add ?? ""}`}
        initialServices={services}
        dataError={dataError}
        initialEditId={edit || null}
        initialCreate={add === "1"}
        searchParams={{ search, category, status }}
      />
    </VendorShell>
  )
}
