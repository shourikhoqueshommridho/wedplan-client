"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquare,
  Search,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/account/status-badge"
import { apiFetch, readApiMessage } from "@/lib/client-api"
import { parseBookingResponse } from "@/lib/account-data"
import { formatAmount, formatDateOnly } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Booking } from "@/types/booking"

interface CustomerBookingsProps {
  initialBookings: Booking[]
  dataError: boolean
}

export function CustomerBookings({ initialBookings, dataError }: CustomerBookingsProps) {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [busyBookingId, setBusyBookingId] = useState<string | null>(null)

  async function cancelBooking(booking: Booking) {
    if (busyBookingId) return
    if (!window.confirm(`Cancel your request for "${booking.serviceName}"?`)) return

    setBusyBookingId(booking.id)

    try {
      const response = await apiFetch(`/bookings/${booking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (!response.ok) {
        const message = await readApiMessage(response, "The booking could not be cancelled.")
        toast.error("Booking not cancelled", { description: message })
        return
      }

      const updated = parseBookingResponse(await response.json())
      if (updated) {
        setBookings((current) =>
          current.map((entry) => (entry.id === updated.id ? updated : entry)),
        )
      }

      toast.success("Booking request cancelled", {
        description: "The vendor will no longer see this request as active.",
      })
      router.refresh()
    } catch {
      toast.error("Booking not cancelled", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setBusyBookingId(null)
    }
  }

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-wine-100 bg-white">
      <div className="flex flex-col justify-between gap-3 border-b border-wine-100 px-6 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-wine-900">
            <CalendarDays aria-hidden="true" className="size-4 text-wine-600" />
            Your booking requests
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Track every request you have sent to a vendor. No payment is collected online.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 self-start rounded-full border border-wine-200 px-4 py-2 text-xs font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 sm:self-auto"
        >
          <Search aria-hidden="true" className="size-3.5" />
          Find more services
        </Link>
      </div>

      {dataError ? (
        <p
          role="alert"
          className="border-b border-destructive/10 bg-destructive/5 px-6 py-3 text-xs text-destructive"
        >
          Your booking list could not be loaded. Refresh the page or sign in again.
        </p>
      ) : null}

      {bookings.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-wine-50 text-wine-700">
            <CalendarDays aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-4 font-heading text-xl font-semibold text-wine-900">No requests yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
            When you request a service from a vendor, the booking and its status will appear here.
          </p>
          <Link
            href="/services"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-wine-800 px-5 text-sm font-semibold text-cream-50 transition-colors hover:bg-wine-900"
          >
            Browse services
          </Link>
        </div>
      ) : (
        <ul role="list" className="divide-y divide-wine-100">
          {bookings.map((booking) => {
            const canCancel = booking.status === "pending" || booking.status === "accepted"

            return (
              <li key={booking.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      aria-hidden="true"
                      className="size-16 shrink-0 rounded-2xl border border-wine-100 bg-wine-50 bg-cover bg-center"
                      style={
                        booking.serviceImage
                          ? {
                              backgroundImage: `url("${booking.serviceImage.replace(/"/g, "%22")}")`,
                            }
                          : undefined
                      }
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-semibold text-wine-900">
                          {booking.serviceName}
                        </h3>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        with {booking.vendorName}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays aria-hidden="true" className="size-3.5" />
                          {formatDateOnly(booking.eventDate)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin aria-hidden="true" className="size-3.5" />
                          {booking.eventLocation}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CreditCard aria-hidden="true" className="size-3.5" />
                          {booking.paymentStatus === "not_required"
                            ? "No online payment"
                            : booking.paymentStatus}
                        </span>
                      </div>

                      {booking.message ? (
                        <p className="mt-2 flex max-w-2xl items-start gap-2 whitespace-pre-line rounded-xl bg-wine-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-foreground/70">
                          <MessageSquare
                            aria-hidden="true"
                            className="mt-0.5 size-3.5 shrink-0 text-wine-500"
                          />
                          {booking.message}
                        </p>
                      ) : null}

                      <p className="mt-2 text-sm font-semibold text-wine-800">
                        {formatAmount(booking.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/services/${booking.serviceId}`}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-wine-200 bg-white px-4 text-sm font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                    >
                      View service
                    </Link>
                    {canCancel ? (
                      <button
                        type="button"
                        onClick={() => cancelBooking(booking)}
                        disabled={busyBookingId === booking.id}
                        className={cn(
                          "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-destructive/20 bg-white px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                        )}
                      >
                        {busyBookingId === booking.id ? (
                          <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                        ) : (
                          <X aria-hidden="true" className="size-3.5" />
                        )}
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
