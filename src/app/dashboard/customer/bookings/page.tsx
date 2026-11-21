import type { Metadata } from "next"
import Link from "next/link"
import { Search } from "lucide-react"

import { BookingsTable } from "@/components/customer/dashboard/bookings-table"
import { DataErrorBanner } from "@/components/customer/dashboard/data-error-banner"
import { parseBooking, parseList } from "@/lib/account-data"
import { fetchWithSession, requireServerRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "My Bookings",
  description: "Every booking request you have sent to WedPlan vendors.",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function CustomerBookingsPage() {
  await requireServerRole("customer", "/dashboard/customer/bookings")

  const bookingsResponse = await fetchWithSession("/api/bookings")
  const dataError = !bookingsResponse?.ok
  const bookings = bookingsResponse?.ok
    ? parseList(await bookingsResponse.json(), "bookings", parseBooking)
    : []

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 rounded-[1.5rem] border border-wine-100 bg-white p-6 shadow-[0_26px_70px_-60px_rgba(112,19,47,0.7)] sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-wine-500">
            Bookings
          </p>
          <h1 className="mt-1.5 font-heading text-3xl font-semibold text-wine-900">
            My Bookings
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {dataError
              ? "Your booking history could not be loaded right now."
              : bookings.length === 0
                ? "You have not sent a booking request yet."
                : `${bookings.length} booking request${bookings.length === 1 ? "" : "s"} in your history, newest first.`}
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-burgundy-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-burgundy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 sm:self-auto"
        >
          <Search aria-hidden="true" className="size-4" />
          Browse services
        </Link>
      </header>

      {dataError ? <DataErrorBanner /> : null}

      <BookingsTable
        bookings={bookings}
        dataError={dataError}
        title="All booking requests"
        description="Track every vendor reply and the details of each request."
      />
    </div>
  )
}
