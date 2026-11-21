"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Search,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/account/status-badge"
import { parseBookingResponse } from "@/lib/account-data"
import { apiFetch, readApiMessage } from "@/lib/client-api"
import { initialsFromName } from "@/lib/customer-dashboard"
import { formatAmount, formatDateOnly } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Booking } from "@/types/booking"

interface BookingsTableProps {
  bookings: readonly Booking[]
  dataError?: boolean
  showViewAll?: boolean
  title?: string
  description?: string
}

const VENDOR_TONES = [
  "bg-wine-100 text-wine-700",
  "bg-[#f8e2b8] text-[#8a5a12]",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
] as const

function vendorTone(name: string): string {
  let hash = 0
  for (const character of name) hash = (hash + character.charCodeAt(0)) % VENDOR_TONES.length
  return VENDOR_TONES[hash] ?? VENDOR_TONES[0]
}

function formatTimestamp(value: string | null): string {
  if (!value) return "Not available"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not available"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function serviceImageStyle(image: string | null): { backgroundImage: string } | undefined {
  if (!image) return undefined
  return { backgroundImage: `url("${image.replace(/"/g, "%22")}")` }
}

/** Customers may only cancel requests the API still allows (pending/accepted). */
function canCancelBooking(booking: Booking): boolean {
  return booking.status === "pending" || booking.status === "accepted"
}

export function BookingsTable({
  bookings,
  dataError = false,
  showViewAll = false,
  title = "My Bookings",
  description,
}: BookingsTableProps) {
  const router = useRouter()
  const [items, setItems] = useState<Booking[]>(() => [...bookings])
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const closeDialogRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!activeBooking) return

    closeDialogRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveBooking(null)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeBooking])

  async function cancelBooking(booking: Booking) {
    if (busyId) return

    setConfirmingId(null)
    setBusyId(booking.id)

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
        setItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)))
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
      setBusyId(null)
    }
  }

  const isEmpty = items.length === 0

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-wine-100 bg-white shadow-[0_26px_70px_-60px_rgba(112,19,47,0.7)]">
      <div className="flex flex-col justify-between gap-3 border-b border-wine-100 px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wine-50 text-wine-700">
            <CalendarDays aria-hidden="true" className="size-[1.05rem]" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-semibold text-wine-900">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>

        {showViewAll ? (
          <Link
            href="/dashboard/customer/bookings"
            className="inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-wine-200 bg-white px-4 text-xs font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 sm:self-auto"
          >
            View All Bookings
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        ) : null}
      </div>

      {isEmpty ? null : (
        <p className="border-b border-wine-100 bg-blush-50/70 px-5 py-2 text-[0.65rem] font-medium text-wine-700/70 xl:hidden">
          Scroll sideways to see every column and action.
        </p>
      )}

      {dataError ? (
        <div
          role="alert"
          className="flex flex-col gap-3 border-b border-destructive/10 bg-destructive/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-xs leading-relaxed text-destructive">
            We couldn&apos;t load your bookings. Your data was not changed.
          </p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex h-8 items-center self-start rounded-full border border-destructive/20 bg-white px-3.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/5"
          >
            Try again
          </button>
        </div>
      ) : null}

      {isEmpty ? (
        <div className="px-6 py-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-wine-50 text-wine-700">
            {dataError ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <CalendarDays aria-hidden="true" className="size-5" />
            )}
          </span>
          <p className="mt-4 font-heading text-xl font-semibold text-wine-900">
            {dataError ? "Your bookings are unavailable" : "No booking requests yet"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
            {dataError
              ? "Refresh the page or sign in again to reload your booking history."
              : "When you request a service from a vendor, the request and its status will appear here."}
          </p>
          {dataError ? null : (
            <Link
              href="/services"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-burgundy-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-burgundy-700"
            >
              <Search aria-hidden="true" className="size-4" />
              Browse services
            </Link>
          )}
        </div>
      ) : (
        <div
          role="region"
          aria-label="Booking requests"
          tabIndex={0}
          className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine-200"
        >
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="bg-wine-50/80 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-wine-800/70">
                <th scope="col" className="px-5 py-3 font-bold">
                  Service Image
                </th>
                <th scope="col" className="px-5 py-3 font-bold">
                  Service Name
                </th>
                <th scope="col" className="px-5 py-3 font-bold">
                  Vendor
                </th>
                <th scope="col" className="px-5 py-3 font-bold">
                  Event Date
                </th>
                <th scope="col" className="px-5 py-3 font-bold">
                  Location
                </th>
                <th scope="col" className="px-5 py-3 font-bold">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 font-bold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wine-100">
              {items.map((booking) => {
                const isBusy = busyId === booking.id
                const isConfirming = confirmingId === booking.id
                const canCancel = canCancelBooking(booking)

                return (
                  <tr key={booking.id} className="transition-colors hover:bg-wine-50/35">
                    <td className="px-5 py-3">
                      <span
                        aria-hidden="true"
                        className="grid h-11 w-16 place-items-center overflow-hidden rounded-lg border border-wine-100 bg-wine-50 bg-cover bg-center text-wine-300"
                        style={serviceImageStyle(booking.serviceImage)}
                      >
                        {booking.serviceImage ? null : <ImageIcon className="size-4" />}
                      </span>
                    </td>
                    <td className="max-w-[220px] px-5 py-3">
                      <p className="truncate text-sm font-semibold text-wine-900">
                        {booking.serviceName}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "grid size-7 shrink-0 place-items-center rounded-full text-[0.58rem] font-bold",
                            vendorTone(booking.vendorName),
                          )}
                        >
                          {initialsFromName(booking.vendorName)}
                        </span>
                        <span className="max-w-[140px] truncate text-sm text-foreground/80">
                          {booking.vendorName}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-foreground/75">
                        <CalendarDays aria-hidden="true" className="size-3.5 text-wine-500" />
                        {formatDateOnly(booking.eventDate)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex max-w-[170px] items-center gap-1.5 text-xs text-foreground/75">
                        <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-wine-500" />
                        <span className="truncate">{booking.eventLocation}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-3">
                      {isConfirming ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void cancelBooking(booking)}
                            disabled={isBusy}
                            aria-label={`Confirm cancellation of ${booking.serviceName}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-destructive px-3 text-[0.7rem] font-semibold text-white transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isBusy ? (
                              <Loader2 aria-hidden="true" className="size-3 animate-spin" />
                            ) : null}
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            disabled={isBusy}
                            className="inline-flex h-8 items-center rounded-lg border border-wine-200 bg-white px-3 text-[0.7rem] font-semibold text-wine-800 transition-colors hover:bg-wine-50 disabled:opacity-60"
                          >
                            Keep
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveBooking(booking)}
                            className="inline-flex h-8 items-center rounded-lg bg-burgundy-600 px-3.5 text-[0.7rem] font-semibold text-white transition-colors hover:bg-burgundy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                          >
                            View Details
                          </button>
                          {canCancel ? (
                            <button
                              type="button"
                              onClick={() => setConfirmingId(booking.id)}
                              disabled={isBusy}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-wine-200 bg-white px-3.5 text-[0.7rem] font-semibold text-wine-800 transition-colors hover:bg-wine-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isBusy ? (
                                <Loader2 aria-hidden="true" className="size-3 animate-spin" />
                              ) : null}
                              Cancel
                            </button>
                          ) : null}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeBooking ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-wine-900/55 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setActiveBooking(null)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-dialog-title"
            className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] bg-white shadow-[0_40px_120px_-30px_rgba(53,19,34,0.7)] sm:rounded-[1.75rem]"
          >
            <div
              className="relative h-40 bg-wine-50 bg-cover bg-center"
              style={serviceImageStyle(activeBooking.serviceImage)}
            >
              {activeBooking.serviceImage ? null : (
                <span className="grid h-full w-full place-items-center text-wine-300">
                  <ImageIcon aria-hidden="true" className="size-8" />
                </span>
              )}
              <button
                ref={closeDialogRef}
                type="button"
                onClick={() => setActiveBooking(null)}
                aria-label="Close booking details"
                className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 text-wine-800 shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  id="booking-dialog-title"
                  className="font-heading text-2xl font-semibold text-wine-900"
                >
                  {activeBooking.serviceName}
                </h3>
                <StatusBadge status={activeBooking.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Requested from {activeBooking.vendorName}
              </p>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5">
                  <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">
                    Event date
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-semibold text-wine-900">
                    <CalendarDays aria-hidden="true" className="size-3.5 text-wine-500" />
                    {formatDateOnly(activeBooking.eventDate)}
                  </dd>
                </div>
                <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5">
                  <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">
                    Location
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-semibold text-wine-900">
                    <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-wine-500" />
                    <span className="truncate">{activeBooking.eventLocation}</span>
                  </dd>
                </div>
                <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5">
                  <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">
                    Package price
                  </dt>
                  <dd className="mt-1 font-semibold text-wine-900">
                    {formatAmount(activeBooking.price)}
                  </dd>
                </div>
                <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5">
                  <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">
                    Payment
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-semibold text-wine-900">
                    <CreditCard aria-hidden="true" className="size-3.5 text-wine-500" />
                    {activeBooking.paymentStatus === "not_required"
                      ? "No online payment"
                      : activeBooking.paymentStatus}
                  </dd>
                </div>
                <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5 sm:col-span-2">
                  <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">
                    Requested on
                  </dt>
                  <dd className="mt-1 font-semibold text-wine-900">
                    {formatTimestamp(activeBooking.createdAt)}
                  </dd>
                </div>
              </dl>

              {activeBooking.message ? (
                <div className="mt-4 rounded-xl border border-wine-100 bg-white px-3.5 py-3">
                  <p className="flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">
                    <MessageSquare aria-hidden="true" className="size-3.5 text-wine-500" />
                    Your message
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                    {activeBooking.message}
                  </p>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/services/${activeBooking.serviceId}`}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-burgundy-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-burgundy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                >
                  View service
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveBooking(null)}
                  className="inline-flex h-10 items-center rounded-full border border-wine-200 bg-white px-5 text-sm font-semibold text-wine-800 transition-colors hover:bg-wine-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
