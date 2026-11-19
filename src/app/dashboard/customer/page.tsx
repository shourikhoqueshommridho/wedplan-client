import type { Metadata } from "next"
import Link from "next/link"
import { CalendarHeart, Search, UserRound } from "lucide-react"

import { AccountShell } from "@/components/account/account-shell"
import { RoleBadge } from "@/components/account/role-badge"
import { CustomerBookings } from "@/components/customer/customer-bookings"
import { buttonVariants } from "@/components/ui/button"
import { parseBooking, parseList } from "@/lib/account-data"
import { fetchWithSession, requireServerRole } from "@/lib/auth-server"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Customer Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function CustomerDashboardPage() {
  const session = await requireServerRole("customer", "/dashboard/customer")
  const firstName = session.user.name.trim().split(/\s+/)[0] || "there"

  const bookingsResponse = await fetchWithSession("/api/bookings")
  const bookings = bookingsResponse?.ok
    ? parseList(await bookingsResponse.json(), "bookings", parseBooking)
    : []

  return (
    <AccountShell
      eyebrow="Customer dashboard"
      title={`Welcome, ${firstName}`}
      description="Your wedding planning home. Browse trusted professionals, send booking requests and track every vendor reply."
      badge={<RoleBadge role="customer" />}
      actions={
        <Link
          href="/services"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-10 rounded-full bg-wine-800 px-5 text-cream-50 hover:bg-wine-900",
          )}
        >
          <Search aria-hidden="true" className="size-4" />
          Browse services
        </Link>
      }
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Link
          href="/services"
          className="group rounded-[1.75rem] border border-wine-100 bg-white p-6 transition-colors hover:border-wine-200 hover:bg-wine-50/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wine-100"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-wine-50 text-wine-700">
            <Search aria-hidden="true" className="size-5" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold text-wine-900">Discover vendors</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Explore venues, photographers, florists, catering and more, all in one curated place.
          </p>
          <span className="mt-4 inline-flex text-xs font-semibold text-wine-700 group-hover:underline">
            Browse the collection →
          </span>
        </Link>

        <Link
          href="/profile"
          className="group rounded-[1.75rem] border border-wine-100 bg-white p-6 transition-colors hover:border-wine-200 hover:bg-wine-50/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wine-100"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-wine-50 text-wine-700">
            <UserRound aria-hidden="true" className="size-5" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold text-wine-900">Your profile</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Review the name, email and profile image attached to your verified account.
          </p>
          <span className="mt-4 inline-flex text-xs font-semibold text-wine-700 group-hover:underline">
            View profile →
          </span>
        </Link>

        <div className="rounded-[1.75rem] border border-gold-300/60 bg-cream-50 p-6">
          <span className="grid size-11 place-items-center rounded-2xl bg-gold-300/30 text-wine-700">
            <CalendarHeart aria-hidden="true" className="size-5" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold text-wine-900">Booking requests</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">
            {bookings.length === 0
              ? "You have not requested a service yet. Send your first request from any service page."
              : `You have ${bookings.length} booking request${bookings.length === 1 ? "" : "s"} in your history.`}
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-wine-800">
            {bookings.filter((booking) => booking.status === "pending").length} awaiting vendor reply
          </p>
        </div>
      </div>

      <div className="mt-5">
        <CustomerBookings initialBookings={bookings} dataError={!bookingsResponse?.ok} />
      </div>
    </AccountShell>
  )
}
