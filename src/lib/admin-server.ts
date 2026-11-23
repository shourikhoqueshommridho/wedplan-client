import "server-only"

import { cache } from "react"

import {
  parseAdminService,
  parseAdminUser,
  parseBooking,
  parseList,
  parseVendorProfile,
} from "@/lib/account-data"
import { parseAdminTransactionList } from "@/lib/admin-transactions"
import { parseAdminUsersMeta } from "@/lib/admin-dashboard"
import { fetchWithSession } from "@/lib/auth-server"
import { isRecord } from "@/lib/service-listing"
import type {
  AdminOverview,
  AdminService,
  AdminTransaction,
  AdminUser,
  AdminUsersMeta,
} from "@/types/admin"
import type { Booking } from "@/types/booking"
import type { VendorProfile } from "@/types/vendor"

export interface AdminLoadResult<T> {
  items: T[]
  ok: boolean
}

export interface AdminUsersLoadResult extends AdminLoadResult<AdminUser> {
  meta: AdminUsersMeta | null
}

export interface AdminOverviewResult {
  data: AdminOverview | null
  ok: boolean
}

async function readList<T>(
  path: string,
  key: string,
  parser: (value: unknown) => T | null,
): Promise<AdminLoadResult<T>> {
  const response = await fetchWithSession(path)
  if (!response?.ok) return { items: [], ok: false }

  try {
    return { items: parseList(await response.json(), key, parser), ok: true }
  } catch {
    return { items: [], ok: false }
  }
}

function isAdminOverview(value: unknown): value is AdminOverview {
  if (!isRecord(value)) return false
  const numericKeys: (keyof AdminOverview)[] = [
    "totalUsers",
    "totalCustomers",
    "totalVendors",
    "blockedUsers",
    "totalServices",
    "pendingServices",
    "approvedActiveServices",
    "totalBookings",
    "pendingBookings",
    "completedBookings",
    "totalTransactions",
    "successfulTransactions",
  ]
  return (
    numericKeys.every((key) => typeof value[key] === "number") &&
    Array.isArray(value.revenueByCurrency)
  )
}

const loadUsers = cache(async (query = ""): Promise<AdminUsersLoadResult> => {
  const response = await fetchWithSession(`/api/account/admin/users${query}`)
  if (!response?.ok) return { items: [], ok: false, meta: null }

  try {
    const payload: unknown = await response.json()
    const data = isRecord(payload) && isRecord(payload.data) ? payload.data : null
    return {
      items: parseList(payload, "users", parseAdminUser),
      meta: parseAdminUsersMeta(data?.meta),
      ok: true,
    }
  } catch {
    return { items: [], ok: false, meta: null }
  }
})

export function loadAdminUsers(query = ""): Promise<AdminUsersLoadResult> {
  return loadUsers(query)
}

export const loadAdminVendors = cache((): Promise<AdminLoadResult<VendorProfile>> =>
  readList("/api/admin/vendors", "vendors", parseVendorProfile),
)

export const loadAdminServices = cache((): Promise<AdminLoadResult<AdminService>> =>
  readList("/api/admin/services", "services", parseAdminService),
)

export const loadAdminBookings = cache((): Promise<AdminLoadResult<Booking>> =>
  readList("/api/admin/bookings", "bookings", parseBooking),
)

export const loadAdminOverview = cache(async (): Promise<AdminOverviewResult> => {
  const response = await fetchWithSession("/api/admin/overview")
  if (!response?.ok) return { data: null, ok: false }

  try {
    const payload: unknown = await response.json()
    const data = isRecord(payload) ? payload.data : null
    return isAdminOverview(data) ? { data, ok: true } : { data: null, ok: false }
  } catch {
    return { data: null, ok: false }
  }
})

export const loadAdminTransactions = cache(async (): Promise<AdminLoadResult<AdminTransaction>> => {
  const response = await fetchWithSession("/api/admin/transactions")
  if (!response?.ok) return { items: [], ok: false }

  try {
    return { items: parseAdminTransactionList(await response.json()), ok: true }
  } catch {
    return { items: [], ok: false }
  }
})
