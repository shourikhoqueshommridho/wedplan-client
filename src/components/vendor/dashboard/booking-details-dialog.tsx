"use client"

import { useEffect, useRef } from "react"
import { CalendarDays, Clock3, Mail, MapPin, MessageSquare, Wallet, X } from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import { initialsFromName } from "@/lib/customer-dashboard"
import { formatDateOnly } from "@/lib/format"
import { formatVendorAmount, formatVendorTimestamp } from "@/lib/vendor-dashboard"
import type { Booking } from "@/types/booking"

interface BookingDetailsDialogProps {
  booking: Booking | null
  onClose: () => void
}

export function BookingDetailsDialog({ booking, onClose }: BookingDetailsDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!booking) return

    closeButtonRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [booking, onClose])

  if (!booking) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-wine-900/55 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vendor-booking-dialog-title"
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] bg-white shadow-[0_40px_120px_-30px_rgba(53,19,34,0.7)] sm:rounded-[1.75rem]"
      >
        <div className="relative h-36 overflow-hidden rounded-t-[1.75rem] bg-wine-50">
          {booking.serviceImage ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url("${booking.serviceImage.replace(/"/g, "%22")}")`,
              }}
            />
          ) : null}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-wine-900/70 via-wine-900/20 to-transparent"
          />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close booking details"
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 text-wine-800 shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
          <div className="absolute inset-x-5 bottom-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800">
              {formatVendorAmount(booking.price)}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <h2
            id="vendor-booking-dialog-title"
            className="font-heading text-2xl font-semibold text-wine-900"
          >
            {booking.serviceName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Request sent {formatVendorTimestamp(booking.createdAt)}
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-wine-100 bg-blush-50/70 px-4 py-3">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-wine-100 font-heading text-sm font-semibold text-wine-800"
            >
              {initialsFromName(booking.customerName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-wine-900">
                {booking.customerName}
              </p>
              {booking.customerEmail ? (
                <a
                  href={`mailto:${booking.customerEmail}`}
                  className="inline-flex max-w-full items-center gap-1.5 truncate text-xs text-wine-700 underline decoration-wine-200 underline-offset-4 hover:text-wine-900"
                >
                  <Mail aria-hidden="true" className="size-3 shrink-0" />
                  <span className="truncate">{booking.customerEmail}</span>
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">No email on record</p>
              )}
            </div>
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5">
              <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">
                Event date
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 font-semibold text-wine-900">
                <CalendarDays aria-hidden="true" className="size-3.5 text-wine-500" />
                {formatDateOnly(booking.eventDate)}
              </dd>
            </div>
            <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5">
              <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">
                Event location
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 font-semibold text-wine-900">
                <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-wine-500" />
                <span className="truncate">{booking.eventLocation}</span>
              </dd>
            </div>
            <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5">
              <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">
                Package price
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 font-semibold text-wine-900">
                <Wallet aria-hidden="true" className="size-3.5 text-wine-500" />
                {formatVendorAmount(booking.price)}
              </dd>
            </div>
            <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5">
              <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">
                Last update
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 font-semibold text-wine-900">
                <Clock3 aria-hidden="true" className="size-3.5 text-wine-500" />
                {formatVendorTimestamp(booking.updatedAt)}
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-wine-800/60">
              Customer message
            </p>
            <p className="mt-1.5 flex items-start gap-2 rounded-xl border border-wine-100 bg-white px-3.5 py-3 text-sm leading-relaxed text-foreground/80">
              <MessageSquare aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
              <span>{booking.message || "No message was included with this request."}</span>
            </p>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center rounded-full border border-wine-200 bg-white px-5 text-sm font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
