"use client"

import { useState } from "react"
import { CalendarDays, CalendarHeart, MapPin } from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import { BookingDetailsDialog } from "@/components/vendor/dashboard/booking-details-dialog"
import { ConfirmDialog } from "@/components/vendor/dashboard/confirm-dialog"
import { useVendorBookings } from "@/components/vendor/dashboard/use-vendor-bookings"
import { initialsFromName } from "@/lib/customer-dashboard"
import { formatDateOnly } from "@/lib/format"
import { formatVendorAmount } from "@/lib/vendor-dashboard"
import { cn } from "@/lib/utils"
import type { Booking, BookingStatus } from "@/types/booking"

interface VendorBookingsClientProps {
  bookings: Booking[]
  dataError: boolean
}

type BookingFilter = "all" | BookingStatus

const FILTERS: readonly { value: BookingFilter; label: string }[] = [
  { value: "all", label: "All requests" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined" },
  { value: "cancelled", label: "Cancelled" },
]

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

export function VendorBookingsClient({ bookings, dataError }: VendorBookingsClientProps) {
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

  const [filter, setFilter] = useState<BookingFilter>("all")

  const counts = {
    total: items.length,
    pending: items.filter((booking) => booking.status === "pending").length,
    accepted: items.filter((booking) => booking.status === "accepted").length,
    completed: items.filter((booking) => booking.status === "completed").length,
    declined: items.filter((booking) => booking.status === "declined").length,
  }

  const visible = filter === "all" ? items : items.filter((booking) => booking.status === filter)

  return (
    <div className="space-y-6">
      {dataError ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive"
        >
          <p className="font-semibold">Booking requests could not be loaded.</p>
          <p className="mt-1 text-xs leading-relaxed">
            The protected API rejected part of this request. Refresh the page or sign in again.
          </p>
        </div>
      ) : null}

      <section
        aria-label="Booking request statistics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { key: "total", label: "Total requests", value: counts.total },
          { key: "pending", label: "Awaiting reply", value: counts.pending },
          { key: "accepted", label: "Accepted", value: counts.accepted },
          { key: "completed", label: "Completed", value: counts.completed },
        ].map((stat) => (
          <div key={stat.key} className="rounded-[1.35rem] border border-wine-100 bg-white p-5">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.1em] text-wine-900/60">
              {stat.label}
            </p>
            <p className="mt-1 font-heading text-3xl font-semibold leading-none text-wine-900">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section
        aria-labelledby="vendor-bookings-title"
        className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-wine-100 bg-white shadow-[0_26px_70px_-60px_rgba(112,19,47,0.7)]"
      >
        <div className="flex flex-col justify-between gap-3 border-b border-wine-100 px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wine-50 text-wine-700">
              <CalendarDays aria-hidden="true" className="size-[1.05rem]" />
            </span>
            <div>
              <h2
                id="vendor-bookings-title"
                className="font-heading text-xl font-semibold text-wine-900"
              >
                Booking Requests
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Accept or decline requests, then mark the booking completed once the event is done.
              </p>
            </div>
          </div>

          <label className="sr-only" htmlFor="vendor-bookings-filter">
            Filter booking requests by status
          </label>
          <select
            id="vendor-bookings-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value as BookingFilter)}
            className="h-9 self-start rounded-full border border-wine-200 bg-white px-4 text-xs font-semibold text-wine-800 outline-none focus:ring-2 focus:ring-wine-200 sm:self-auto"
          >
            {FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-wine-50 text-wine-600">
              <CalendarHeart aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-3 font-heading text-lg font-semibold text-wine-900">
              {dataError
                ? "Booking requests are unavailable"
                : filter === "all"
                  ? "No booking requests yet"
                  : "No requests with this status"}
            </p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              {dataError
                ? "Refresh the page or sign in again to reload your inbox."
                : "Requests for your approved services appear here as soon as couples send them."}
            </p>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-wine-100">
            {visible.map((booking) => {
              const isBusy = busyId === booking.id

              return (
                <li key={booking.id} className="px-5 py-5 transition-colors hover:bg-wine-50/30">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-11 shrink-0 place-items-center rounded-full text-[0.68rem] font-bold",
                          avatarTone(booking.customerName),
                        )}
                      >
                        {initialsFromName(booking.customerName)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading text-lg font-semibold text-wine-900">
                            {booking.serviceName}
                          </h3>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays aria-hidden="true" className="size-3.5" />
                            {formatDateOnly(booking.eventDate)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin aria-hidden="true" className="size-3.5" />
                            {booking.eventLocation}
                          </span>
                        </p>
                        <p className="mt-1.5 text-sm text-foreground/75">
                          <span className="font-semibold text-wine-900">{booking.customerName}</span>
                          {booking.customerEmail ? ` · ${booking.customerEmail}` : ""}
                        </p>
                        {booking.message ? (
                          <p className="mt-2 max-w-2xl whitespace-pre-line rounded-xl bg-wine-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-foreground/70">
                            {booking.message}
                          </p>
                        ) : null}
                        <p className="mt-2 text-sm font-semibold text-wine-800">
                          {formatVendorAmount(booking.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {booking.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => requestStatusChange(booking, "accepted")}
                            disabled={isBusy}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-burgundy-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-burgundy-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => requestStatusChange(booking, "declined")}
                            disabled={isBusy}
                            className="inline-flex h-9 items-center rounded-full border border-destructive/20 bg-white px-4 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </>
                      ) : null}

                      {booking.status === "accepted" ? (
                        <button
                          type="button"
                          onClick={() => requestStatusChange(booking, "completed")}
                          disabled={isBusy}
                          className="inline-flex h-9 items-center rounded-full border border-wine-200 bg-white px-4 text-xs font-semibold text-wine-800 transition-colors hover:bg-wine-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark completed
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => setActiveBooking(booking)}
                        className="inline-flex h-9 items-center rounded-full border border-wine-200 bg-white px-4 text-xs font-semibold text-wine-800 transition-colors hover:bg-wine-50"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <BookingDetailsDialog booking={activeBooking} onClose={() => setActiveBooking(null)} />

      <ConfirmDialog
        open={pendingDecision !== null}
        title={pendingDecision?.status === "completed" ? "Mark as completed?" : "Decline request?"}
        description={
          pendingDecision?.status === "completed"
            ? `Confirm that ${pendingDecision.booking.customerName}'s event has taken place. Completed bookings can no longer change status.`
            : pendingDecision
              ? `Decline ${pendingDecision.booking.customerName}'s request for ${pendingDecision.booking.serviceName}? This cannot be undone.`
              : ""
        }
        confirmLabel={
          pendingDecision?.status === "completed" ? "Mark completed" : "Decline request"
        }
        tone={pendingDecision?.status === "completed" ? "default" : "destructive"}
        busy={busyId !== null}
        onConfirm={confirmPendingDecision}
        onCancel={cancelPendingDecision}
      />
    </div>
  )
}
