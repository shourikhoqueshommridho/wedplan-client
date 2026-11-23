import { formatAmount } from "@/lib/format"
import type { Booking } from "@/types/booking"
import type { VendorService } from "@/types/vendor"

/** Amounts are presented exactly as specified by the vendor dashboard design. */
export function formatVendorAmount(amount: number): string {
  return formatAmount(amount, "USD")
}

export interface MonthlyEarning {
  key: string
  label: string
  fullLabel: string
  earnings: number
  count: number
}


export function buildMonthlyEarnings(
  bookings: readonly Booking[],
  months = 6,
  now: Date = new Date(),
): MonthlyEarning[] {
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const points: MonthlyEarning[] = []

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(year, month - offset, 1))
    points.push({
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(date),
      fullLabel: new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date),
      earnings: 0,
      count: 0,
    })
  }

  const byKey = new Map(points.map((point) => [point.key, point]))

  for (const booking of bookings) {
    if (!booking.createdAt) continue
    if (booking.status !== "accepted" && booking.status !== "completed") continue

    const created = new Date(booking.createdAt)
    if (Number.isNaN(created.getTime())) continue

    const key = `${created.getUTCFullYear()}-${String(created.getUTCMonth() + 1).padStart(2, "0")}`
    const point = byKey.get(key)
    if (point) {
      point.earnings += booking.price
      point.count += 1
    }
  }

  return points
}

export interface VendorStats {
  totalServices: number
  activeServices: number
  pendingServices: number
  totalBookings: number
  pendingBookings: number
  acceptedBookings: number
}

/**
 * Counts are derived from the vendor-scoped collections returned by the
 * protected API (`GET /api/vendor/services` and `GET /api/bookings`), so no
 * aggregation is trusted from the browser.
 */
export function buildVendorStats(
  services: readonly VendorService[],
  bookings: readonly Booking[],
): VendorStats {
  return {
    totalServices: services.length,
    activeServices: services.filter(
      (service) => service.isActive && service.status === "approved",
    ).length,
    pendingServices: services.filter((service) => service.status === "pending").length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
    acceptedBookings: bookings.filter((booking) => booking.status === "accepted").length,
  }
}

export type ServiceFilterStatus = "all" | "pending" | "approved" | "rejected" | "inactive"

export const SERVICE_STATUS_FILTERS: readonly {
  value: ServiceFilterStatus
  label: string
}[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "inactive", label: "Inactive" },
]

export interface VendorServiceFilters {
  search: string
  category: string
  status: ServiceFilterStatus
}

/** Categories actually present in the vendor's catalogue, in display order. */
export function serviceCategoryOptions(services: readonly VendorService[]): string[] {
  return [...new Set(services.map((service) => service.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  )
}

/** A deactivated listing is "inactive" regardless of the stored moderation status. */
function effectiveStatus(service: VendorService): Exclude<ServiceFilterStatus, "all"> | null {
  if (!service.isActive || service.status === "inactive") return "inactive"
  if (
    service.status === "pending" ||
    service.status === "approved" ||
    service.status === "rejected"
  ) {
    return service.status
  }
  return null
}

export function filterVendorServices(
  services: readonly VendorService[],
  filters: VendorServiceFilters,
): VendorService[] {
  const search = filters.search.trim().toLowerCase()

  return services.filter((service) => {
    if (filters.category !== "all" && service.category !== filters.category) return false
    if (filters.status !== "all" && effectiveStatus(service) !== filters.status) return false
    if (!search) return true

    return [service.name, service.category, service.location, service.description].some((value) =>
      value.toLowerCase().includes(search),
    )
  })
}

/** Short public-availability caption shown next to the moderation badge. */
export function serviceAvailabilityLabel(service: VendorService): string {
  if (!service.isActive || service.status === "inactive") return "Inactive"
  if (service.status === "approved") return "Publicly listed"
  if (service.status === "rejected") return "Not approved"
  return "Not public yet"
}

/** Formats an API timestamp in UTC so server and client markup always match. */
export function formatVendorTimestamp(value: string | null): string {
  if (!value) return "Not available"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not available"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date)
}

export type EarningsRange = "30d" | "6m" | "12m"

export interface EarningsPoint {
  key: string
  label: string
  earnings: number
  count: number
}

export interface EarningsReport {
  points: EarningsPoint[]
  total: number
  previousTotal: number
  trendPercent: number | null
  rangeLabel: string
  comparisonLabel: string
}

const DAY_MS = 86_400_000

function isRevenueBooking(booking: Booking): boolean {
  return booking.status === "accepted" || booking.status === "completed"
}

function sumRevenue(
  bookings: readonly Booking[],
  start: number,
  end: number,
): { earnings: number; count: number } {
  let earnings = 0
  let count = 0

  for (const booking of bookings) {
    if (!booking.createdAt || !isRevenueBooking(booking)) continue
    const created = new Date(booking.createdAt).getTime()
    if (Number.isNaN(created) || created < start || created >= end) continue
    earnings += booking.price
    count += 1
  }

  return { earnings, count }
}

function dayLabel(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(timestamp))
}

function monthLabel(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(
    new Date(timestamp),
  )
}

function withTrend(
  points: EarningsPoint[],
  current: number,
  previous: number,
  rangeLabel: string,
  comparisonLabel: string,
): EarningsReport {
  return {
    points,
    total: current,
    previousTotal: previous,
    trendPercent: previous > 0 ? Math.round(((current - previous) / previous) * 100) : null,
    rangeLabel,
    comparisonLabel,
  }
}

/**
 * Real earnings values for the overview chart. Revenue is recognised when a
 * request becomes accepted or completed, grouped by the selected UTC window.
 * The comparison window is the immediately preceding period of equal length.
 */
export function buildEarningsReport(
  bookings: readonly Booking[],
  range: EarningsRange,
  now: Date,
): EarningsReport {
  const todayEnd = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)

  if (range === "30d") {
    const start = todayEnd - 30 * DAY_MS
    const previousStart = start - 30 * DAY_MS
    const offsets = [0, 7, 14, 21, 29]
    const boundaries = [...offsets.map((offset) => start + offset * DAY_MS), todayEnd]

    const points = offsets.map((offset, index) => ({
      key: `day-${offset}`,
      label: dayLabel(boundaries[index]),
      ...sumRevenue(bookings, boundaries[index], boundaries[index + 1]),
    }))

    return withTrend(
      points,
      sumRevenue(bookings, start, todayEnd).earnings,
      sumRevenue(bookings, previousStart, start).earnings,
      "Last 30 Days",
      "from last month",
    )
  }

  const months = range === "6m" ? 6 : 12
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const points: EarningsPoint[] = []
  let firstStart = 0

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const from = Date.UTC(year, month - offset, 1)
    const to = Date.UTC(year, month - offset + 1, 1)
    if (offset === months - 1) firstStart = from

    points.push({
      key: `${new Date(from).getUTCFullYear()}-${String(new Date(from).getUTCMonth() + 1).padStart(2, "0")}`,
      label: monthLabel(from),
      ...sumRevenue(bookings, from, to),
    })
  }

  const previousStart = Date.UTC(year, month - months * 2 + 1, 1)

  return withTrend(
    points,
    sumRevenue(bookings, firstStart, todayEnd).earnings,
    sumRevenue(bookings, previousStart, firstStart).earnings,
    range === "6m" ? "Last 6 Months" : "Last 12 Months",
    "from previous period",
  )
}
