import type { Metadata } from "next"
import { connection } from "next/server"

import { BookingStatCards } from "@/components/customer/dashboard/booking-stat-cards"
import { BookingsTable } from "@/components/customer/dashboard/bookings-table"
import { DataErrorBanner } from "@/components/customer/dashboard/data-error-banner"
import { ProfileSummary } from "@/components/customer/dashboard/profile-summary"
import { UpcomingEvent } from "@/components/customer/dashboard/upcoming-event"
import { WelcomeBanner } from "@/components/customer/dashboard/welcome-banner"
import { parseBooking, parseList } from "@/lib/account-data"
import { fetchWithSession, requireServerRole } from "@/lib/auth-server"
import { buildBookingStats, findUpcomingBooking } from "@/lib/customer-dashboard"

export const metadata: Metadata = {
  title: "Overview",
  description: "Your WedPlan booking overview, upcoming celebrations and profile summary.",
  robots: { index: false, follow: false },
}

export const instant = false

const RECENT_BOOKING_LIMIT = 5

export default async function CustomerOverviewPage() {
  // `findUpcomingBooking` depends on today's date; render it at request time.
  await connection()
  const session = await requireServerRole("customer", "/dashboard/customer")

  const bookingsResponse = await fetchWithSession("/api/bookings")
  const dataError = !bookingsResponse?.ok
  const bookings = bookingsResponse?.ok
    ? parseList(await bookingsResponse.json(), "bookings", parseBooking)
    : []

  const stats = buildBookingStats(bookings)
  const upcoming = findUpcomingBooking(bookings)
  const recentBookings = bookings.slice(0, RECENT_BOOKING_LIMIT)

  return (
    <div className="space-y-6">
      {dataError ? <DataErrorBanner /> : null}

      <WelcomeBanner name={session.user.name} />

      <BookingStatCards stats={stats} />

      <BookingsTable
        bookings={recentBookings}
        dataError={dataError}
        showViewAll
        description="The latest requests you have sent to WedPlan vendors."
      />

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <UpcomingEvent booking={upcoming} dataError={dataError} />
        <ProfileSummary
          name={session.user.name}
          email={session.user.email}
          image={session.user.image}
          role={session.user.role}
        />
      </div>
    </div>
  )
}
