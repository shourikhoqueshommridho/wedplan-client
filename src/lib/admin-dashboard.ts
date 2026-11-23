import { isRecord } from "@/lib/service-listing"
import type { AdminOverview, AdminService, AdminUser, AdminUsersMeta } from "@/types/admin"
import type { Booking } from "@/types/booking"
import type { UserRole } from "@/types/auth"

export interface AdminStats {
  totalUsers: number
  totalVendors: number
  totalCustomers: number
  blockedUsers: number
  totalServices: number
  pendingServices: number
  approvedActiveServices: number
  totalBookings: number
  pendingBookings: number
  completedBookings: number
  totalTransactions: number | null
  totalRevenue: number | null
  revenueCurrency: string | null
}

/** Parser shared by the server loader and the users table. */
export function parseAdminUsersMeta(value: unknown): AdminUsersMeta | null {
  if (!isRecord(value)) return null
  const { page, pageSize, total, totalPages } = value
  if (
    typeof page !== "number" ||
    typeof pageSize !== "number" ||
    typeof total !== "number" ||
    typeof totalPages !== "number"
  ) {
    return null
  }
  return { page, pageSize, total, totalPages }
}

/** Prefer server counts; fall back to loaded records only if the API failed. */
export function buildAdminStats(
  users: readonly AdminUser[],
  services: readonly AdminService[],
  bookings: readonly Booking[],
  overview: AdminOverview | null = null,
): AdminStats {
  if (overview) {
    const revenue = overview.revenueByCurrency[0]
    return {
      totalUsers: overview.totalUsers,
      totalVendors: overview.totalVendors,
      totalCustomers: overview.totalCustomers,
      blockedUsers: overview.blockedUsers,
      totalServices: overview.totalServices,
      pendingServices: overview.pendingServices,
      approvedActiveServices: overview.approvedActiveServices,
      totalBookings: overview.totalBookings,
      pendingBookings: overview.pendingBookings,
      completedBookings: overview.completedBookings,
      totalTransactions: overview.totalTransactions,
      totalRevenue: revenue?.amount ?? 0,
      revenueCurrency: revenue?.currency ?? null,
    }
  }

  return {
    totalUsers: users.length,
    totalVendors: users.filter((user) => user.role === "vendor").length,
    totalCustomers: users.filter((user) => user.role === "customer").length,
    blockedUsers: users.filter((user) => user.blocked).length,
    totalServices: services.length,
    pendingServices: services.filter((service) => service.status === "pending").length,
    approvedActiveServices: services.filter(
      (service) => service.status === "approved" && service.isActive,
    ).length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
    completedBookings: bookings.filter((booking) => booking.status === "completed").length,
    totalTransactions: null,
    totalRevenue: null,
    revenueCurrency: null,
  }
}

export interface AdminActivityPoint {
  key: string
  label: string
  count: number
}

const DAY_MS = 86_400_000

/** Booking activity grouped into five real windows across the last 30 days. */
export function buildAdminActivity(
  bookings: readonly Booking[],
  now: Date,
  range: "30d" | "6m" = "30d",
): AdminActivityPoint[] {
  if (range === "6m") {
    const points: AdminActivityPoint[] = []
    for (let offset = 5; offset >= 0; offset -= 1) {
      const from = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1)
      const to = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset + 1, 1)
      points.push({
        key: `${new Date(from).getUTCFullYear()}-${new Date(from).getUTCMonth() + 1}`,
        label: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(
          new Date(from),
        ),
        count: bookings.filter((booking) => {
          if (!booking.createdAt) return false
          const created = new Date(booking.createdAt).getTime()
          return created >= from && created < to
        }).length,
      })
    }
    return points
  }

  const todayEnd = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  const start = todayEnd - 30 * DAY_MS
  const offsets = [0, 7, 14, 21, 29]
  const boundaries = [...offsets.map((offset) => start + offset * DAY_MS), todayEnd]

  return offsets.map((offset, index) => ({
    key: `day-${offset}`,
    label: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(boundaries[index])),
    count: bookings.filter((booking) => {
      if (!booking.createdAt) return false
      const created = new Date(booking.createdAt).getTime()
      return created >= boundaries[index] && created < boundaries[index + 1]
    }).length,
  }))
}

export interface AdminUserFilters {
  search: string
  role: UserRole | "all"
}

export function filterAdminUsers(
  users: readonly AdminUser[],
  filters: AdminUserFilters,
): AdminUser[] {
  const search = filters.search.trim().toLowerCase()

  return users.filter((user) => {
    if (filters.role !== "all" && user.role !== filters.role) return false
    if (!search) return true
    return `${user.name} ${user.email}`.toLowerCase().includes(search)
  })
}

export type AdminServiceFilterStatus = "all" | "pending" | "approved" | "rejected" | "inactive"

export interface AdminServiceFilters {
  search: string
  category: string
  status: AdminServiceFilterStatus
}

export function adminServiceCategories(services: readonly AdminService[]): string[] {
  return [...new Set(services.map((service) => service.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  )
}

function effectiveStatus(service: AdminService): AdminServiceFilterStatus {
  if (service.status === "pending" || service.status === "approved" || service.status === "rejected") {
    return service.status
  }
  if (!service.isActive || service.status === "inactive") return "inactive"
  return "all"
}

export function filterAdminServices(
  services: readonly AdminService[],
  filters: AdminServiceFilters,
): AdminService[] {
  const search = filters.search.trim().toLowerCase()

  return services.filter((service) => {
    if (filters.category !== "all" && service.category !== filters.category) return false
    if (filters.status !== "all" && effectiveStatus(service) !== filters.status) return false
    if (!search) return true
    return `${service.name} ${service.vendorName} ${service.category}`
      .toLowerCase()
      .includes(search)
  })
}

export interface Paginated<T> {
  items: T[]
  page: number
  totalPages: number
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
  }
}
