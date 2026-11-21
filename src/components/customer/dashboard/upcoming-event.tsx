import Link from "next/link"
import { Bell, CalendarDays, CalendarHeart, MapPin, Sparkles } from "lucide-react"

import { weddingImages } from "@/data/images"
import { daysUntilEvent } from "@/lib/customer-dashboard"
import { formatDateOnly } from "@/lib/format"
import type { Booking } from "@/types/booking"

interface UpcomingEventProps {
  booking: Booking | null
  dataError?: boolean
}

function countdownLabel(daysLeft: number): { value: string; caption: string } {
  if (daysLeft === 0) return { value: "Today", caption: "The big day" }
  if (daysLeft === 1) return { value: "1", caption: "Day Left" }
  return { value: String(daysLeft), caption: "Days Left" }
}

export function UpcomingEvent({ booking, dataError = false }: UpcomingEventProps) {
  const daysLeft = booking ? daysUntilEvent(booking.eventDate) : null
  const countdown = daysLeft === null ? null : countdownLabel(Math.max(daysLeft, 0))

  return (
    <section
      aria-labelledby="upcoming-events-title"
      className="flex h-full flex-col rounded-[1.5rem] border border-wine-100 bg-white p-5 shadow-[0_26px_70px_-60px_rgba(112,19,47,0.7)] sm:p-6"
    >
      <div className="flex items-center gap-2.5">
        <Sparkles aria-hidden="true" className="size-5 text-gold-500" />
        <h2 id="upcoming-events-title" className="font-heading text-xl font-semibold text-wine-900">
          Upcoming Events
        </h2>
      </div>

      {!booking ? (
        <div className="flex flex-1 flex-col items-center justify-center px-2 py-10 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-wine-50 text-wine-600">
            <CalendarHeart aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-3 font-heading text-lg font-semibold text-wine-900">
            {dataError ? "Events unavailable right now" : "No upcoming events yet"}
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            {dataError
              ? "We couldn't load your bookings, so the countdown is paused. Refresh the page to try again."
              : "Once a vendor accepts one of your requests, the countdown to your celebration appears here."}
          </p>
          {dataError ? null : (
            <Link
              href="/services"
              className="mt-4 inline-flex h-9 items-center rounded-full border border-wine-200 bg-white px-4 text-xs font-semibold text-wine-800 transition-colors hover:bg-wine-50"
            >
              Find a vendor
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col gap-4 sm:flex-row sm:items-stretch">
          <div
            className="h-32 w-full shrink-0 overflow-hidden rounded-2xl border border-wine-100 bg-wine-50 bg-cover bg-center sm:h-auto sm:w-36"
            style={
              booking.serviceImage
                ? {
                    backgroundImage: `url("${booking.serviceImage.replace(/"/g, "%22")}")`,
                  }
                : undefined
            }
          >
            {booking.serviceImage ? null : (
              <span className="grid h-full w-full place-items-center text-wine-300">
                <CalendarDays aria-hidden="true" className="size-6" />
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="font-heading text-lg font-semibold leading-snug text-wine-900">
              {booking.serviceName}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden="true" className="size-3.5 text-wine-500" />
                {formatDateOnly(booking.eventDate)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-wine-500" />
                <span className="truncate">{booking.eventLocation}</span>
              </span>
            </div>

            <p className="mt-3 flex items-center gap-2 rounded-xl bg-wine-50/80 px-3 py-2 text-[0.72rem] leading-relaxed text-wine-800">
              <Bell aria-hidden="true" className="size-3.5 shrink-0 text-wine-600" />
              Your big day is coming soon! 🎉
            </p>
          </div>

          {countdown ? (
            <div className="relative grid min-h-[6.5rem] shrink-0 place-items-center overflow-hidden rounded-2xl border border-wine-100 px-5 py-4 text-center sm:w-32">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center opacity-45"
                style={{ backgroundImage: `url("${weddingImages.floral.src}")` }}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-white/55" />
              <div className="relative">
                <p className="font-heading text-3xl font-semibold leading-none text-wine-900">
                  {countdown.value}
                </p>
                <p className="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-wine-700">
                  {countdown.caption}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
