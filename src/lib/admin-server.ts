import "server-only"

import { cache } from "react"

import {
  parseAdminService,
  parseAdminUser,
  parseBooking,
  parseList,
  parseVendorProfile,
} from "@/lib/account-data"
import { fetchWithSession } from "@/lib/auth-server"
import type { AdminService, AdminUser } from "@/types/admin"
import type { Booking } from "@/types/booking"
import type { VendorProfile } from "@/types/vendor"

export interface AdminLoadResult<T> {
  items: T[]
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

export const loadAdminUsers = cache((): Promise<AdminLoadResult<AdminUser>> =>
  readList("/api/account/admin/users", "users", parseAdminUser),
)

export const loadAdminVendors = cache((): Promise<AdminLoadResult<VendorProfile>> =>
  readList("/api/admin/vendors", "vendors", parseVendorProfile),
)

export const loadAdminServices = cache((): Promise<AdminLoadResult<AdminService>> =>
  readList("/api/admin/services", "services", parseAdminService),
)

export const loadAdminBookings = cache((): Promise<AdminLoadResult<Booking>> =>
  readList("/api/admin/bookings", "bookings", parseBooking),
)
