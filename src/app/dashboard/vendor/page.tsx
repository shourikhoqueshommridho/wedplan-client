import type { Metadata } from "next"
import { connection } from "next/server"

import { VendorBanner } from "@/components/vendor/dashboard/vendor-banner"
import { VendorShell } from "@/components/vendor/dashboard/vendor-shell"
import { VendorStatCards } from "@/components/vendor/dashboard/vendor-stat-cards"
import { ServicesPreview } from "@/components/vendor/dashboard/services-preview"
import { RecentBookings } from "@/components/vendor/dashboard/recent-bookings"
import { EarningsOverview } from "@/components/vendor/dashboard/earnings-overview"
import { PremiumUpgradeBanner } from "@/components/vendor/dashboard/premium-upgrade-banner"
import { buildVendorStats } from "@/lib/vendor-dashboard"
import { parseBooking, parseList, parseVendorService } from "@/lib/account-data"
import { fetchWithSession, requireServerRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function VendorDashboardPage() {
  // The earnings chart needs the current date; keep it out of the static shell.
  await connection()
  const session = await requireServerRole("vendor", "/dashboard/vendor")

  const [profileResponse, servicesResponse, bookingsResponse] = await Promise.all([
    fetchWithSession("/api/vendor/profile"),
    fetchWithSession("/api/vendor/services"),
    fetchWithSession("/api/bookings"),
  ])

  // The profile is managed on the settings page. Its response is still checked
  // here so a failing protected endpoint is surfaced as a dashboard data error.
  const services = servicesResponse?.ok
    ? parseList(await servicesResponse.json(), "services", parseVendorService)
    : []
  const bookings = bookingsResponse?.ok
    ? parseList(await bookingsResponse.json(), "bookings", parseBooking)
    : []

  const dataError = !profileResponse?.ok || !servicesResponse?.ok || !bookingsResponse?.ok
  const stats = buildVendorStats(services, bookings)

  return (
    <VendorShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        role: session.user.role,
      }}
      pendingBookings={stats.pendingBookings}
    >
      <div className="space-y-5">
        {dataError ? (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive"
          >
            <p className="font-semibold">Some vendor data could not be loaded.</p>
            <p className="mt-1 text-xs leading-relaxed">
              The protected API rejected part of this request. Refresh the page or sign in again.
            </p>
          </div>
        ) : null}

        <VendorBanner name={session.user.name} />

        <VendorStatCards stats={stats} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.18fr_1fr]">
          <ServicesPreview services={services} dataError={dataError} />
          <RecentBookings bookings={bookings} dataError={dataError} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.18fr_1fr]">
          <EarningsOverview bookings={bookings} now={new Date().toISOString()} />
          <PremiumUpgradeBanner />
        </div>
      </div>
    </VendorShell>
  )
}
