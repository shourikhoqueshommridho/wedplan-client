import type { Booking } from "@/types/booking"

export interface BookingStats {
  total: number
  pending: number
  accepted: number
  rejected: number
}

const DAY_MS = 86_400_000

/**
 * Counts are derived from the bookings returned by `GET /api/bookings`, which
 * is already scoped to the authenticated customer by the Express API. The
 * vendor rejection status stored by the backend is `declined`.
 */
export function buildBookingStats(bookings: readonly Booking[]): BookingStats {
  const stats: BookingStats = { total: 0, pending: 0, accepted: 0, rejected: 0 }

  for (const booking of bookings) {
    stats.total += 1
    if (booking.status === "pending") stats.pending += 1
    if (booking.status === "accepted") stats.accepted += 1
    if (booking.status === "declined") stats.rejected += 1
  }

  return stats
}

/** Parses the date portion of an ISO string into a UTC midnight timestamp. */
function toUtcDay(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null

  const timestamp = Date.UTC(year, month - 1, day)
  return Number.isNaN(timestamp) ? null : timestamp
}

function todayUtcDay(now: Date): number {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
}

/**
 * Remaining whole days between today (UTC) and the booking date. Returns `0`
 * when the event is today and a negative number when it is in the past.
 */
export function daysUntilEvent(eventDate: string, now: Date = new Date()): number | null {
  const target = toUtcDay(eventDate)
  if (target === null) return null

  return Math.round((target - todayUtcDay(now)) / DAY_MS)
}

/**
 * The soonest accepted booking whose event date has not passed. Bookings are
 * sorted by event date rather than by creation time so the countdown card
 * always shows the next celebration.
 */
export function findUpcomingBooking(
  bookings: readonly Booking[],
  now: Date = new Date(),
): Booking | null {
  const today = todayUtcDay(now)

  const upcoming = bookings
    .filter((booking) => booking.status === "accepted")
    .filter((booking) => {
      const day = toUtcDay(booking.eventDate)
      return day !== null && day >= today
    })
    .sort((left, right) => left.eventDate.localeCompare(right.eventDate))

  return upcoming[0] ?? null
}

export function firstNameFromName(name: string): string {
  const first = name.trim().split(/\s+/).filter(Boolean)[0]
  return first ?? "there"
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "W"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  const first = parts[0].charAt(0)
  const last = parts[parts.length - 1].charAt(0)
  return `${first}${last}`.toUpperCase()
}
