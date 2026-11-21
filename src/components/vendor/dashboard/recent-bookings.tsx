"use client"

import Link from "next/link"
import { ArrowRight, CalendarDays, CalendarHeart, Loader2 } from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import { BookingDetailsDialog } from "@/components/vendor/dashboard/booking-details-dialog"
import { ConfirmDialog } from "@/components/vendor/dashboard/confirm-dialog"
import { useVendorBookings } from "@/components/vendor/dashboard/use-vendor-bookings"
import { initialsFromName } from "@/lib/customer-dashboard"
import { formatDateOnly } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Booking } from "@/types/booking"

interface RecentBookingsProps {
  bookings: readonly Booking[]
  dataError?: boolean
  limit?: number
}

const AVATAR_TONES = [
  "bg-wine-100 text-wine-700",
  "bg-[#f8e2b8] text-[#8a5a12]",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
] as const

function avatarTone(name: string): string {
  let hash = 0
  for (const character of name) hash = (hash + character.charCodeAt(0)) % AVATAR_TONES.length
  return AVATAR_TONES[hash] ?? AVATAR_TONES[0]
}

function statusLabel(booking: Booking): string | undefined {
  if (booking.status === "declined") return "Rejected"
  return undefined
}

export function RecentBookings({ bookings, dataError = false, limit = 3 }: RecentBookingsProps) {
  const {
    items,
    busyId,
    activeBooking,
    setActiveBooking,
    pendingDecision,
    requestStatusChange,
    confirmPendingDecision,
    cancelPendingDecision,
  } = useVendorBookings(bookings)

  const recent = items.slice(0, limit)

  return (
    <section
      aria-labelledby="recent-bookings-title"
      className="flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-wine-100 bg-white shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-wine-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wine-50 text-wine-700">
            <CalendarDays aria-hidden="true" className="size-[1.05rem]" />
          </span>
          <h2
            id="recent-bookings-title"
            className="font-heading text-xl font-semibold text-wine-900"
          >
            Recent Booking Requests
          </h2>
        </div>

        <Link
          href="/dashboard/vendor/bookings"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-wine-200 bg-white px-3.5 text-[0.7rem] font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
        >
          View All
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      {dataError ? (
        <div
          role="alert"
          className="border-b border-destructive/10 bg-destructive/5 px-5 py-3 text-xs leading-relaxed text-destructive"
        >
          Booking requests could not be loaded. Nothing was changed.
        </div>
      ) : null}

      {recent.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-wine-50 text-wine-600">
            <CalendarHeart aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-3 font-heading text-lg font-semibold text-wine-900">
            {dataError ? "Booking requests are unavailable" : "No booking requests yet"}
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            {dataError
              ? "Refresh the page or sign in again to reload your inbox."
              : "Once a couple requests one of your approved services, it will appear here."}
          </p>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-wine-100">
          {recent.map((booking) => {
            const isBusy = busyId === booking.id

            return (
              <li
                key={booking.id}
                className="flex flex-col gap-3 px-5 py-3.5 transition-colors hover:bg-wine-50/30 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-wine-100 bg-cover bg-center text-[0.68rem] font-bold",
                      avatarTone(booking.customerName),
                    )}
                    style={
                      booking.serviceImage
                        ? {
                            backgroundImage: `url("${booking.serviceImage.replace(/"/g, "%22")}")`,
                          }
                        : undefined
                    }
                  >
                    {booking.serviceImage ? null : initialsFromName(booking.customerName)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-wine-900">
                      {booking.customerName}
                    </p>
                    <p className="truncate text-xs text-foreground/70">{booking.serviceName}</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
                      <CalendarDays aria-hidden="true" className="size-3 text-wine-400" />
                      {formatDateOnly(booking.eventDate)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                  <StatusBadge status={booking.status} label={statusLabel(booking)} />

                  {booking.status === "pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => requestStatusChange(booking, "accepted")}
                        disabled={isBusy}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-burgundy-600 px-3.5 text-[0.7rem] font-semibold text-white transition-colors hover:bg-burgundy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isBusy ? (
                          <Loader2 aria-hidden="true" className="size-3 animate-spin" />
                        ) : null}
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => requestStatusChange(booking, "declined")}
                        disabled={isBusy}
                        className="inline-flex h-8 items-center rounded-lg border border-wine-200 bg-white px-3.5 text-[0.7rem] font-semibold text-wine-800 transition-colors hover:bg-wine-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setActiveBooking(booking)}
                    className="inline-flex h-8 items-center rounded-lg border border-wine-200 bg-white px-3.5 text-[0.7rem] font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                  >
                    View
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <BookingDetailsDialog booking={activeBooking} onClose={() => setActiveBooking(null)} />

      <ConfirmDialog
        open={pendingDecision !== null}
        title="Decline request?"
        description={
          pendingDecision
            ? `Decline ${pendingDecision.booking.customerName}'s request for ${pendingDecision.booking.serviceName}? This cannot be undone.`
            : ""
        }
        confirmLabel="Decline request"
        tone="destructive"
        busy={busyId !== null}
        onConfirm={confirmPendingDecision}
        onCancel={cancelPendingDecision}
      />
    </section>
  )
}
