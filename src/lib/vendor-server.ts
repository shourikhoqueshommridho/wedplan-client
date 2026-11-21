import "server-only"

import { cache } from "react"

import {
  parseBooking,
  parseList,
  parseVendorProfileResponse,
  parseVendorService,
} from "@/lib/account-data"
import { fetchWithSession } from "@/lib/auth-server"
import type { Booking } from "@/types/booking"
import type { VendorProfile, VendorService } from "@/types/vendor"

export interface VendorProfileResult {
  profile: VendorProfile | null
  ok: boolean
}

export interface VendorListResult<T> {
  items: T[]
  ok: boolean
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

/**
 * Request-scoped readers for the protected vendor API. `cache()` dedupes the
 * same call across the dashboard layout and page so a single navigation does
 * not fetch the same collection twice.
 */
export const loadVendorProfile = cache(async (): Promise<VendorProfileResult> => {
  const response = await fetchWithSession("/api/vendor/profile")
  if (!response?.ok) return { profile: null, ok: false }

  return { profile: parseVendorProfileResponse(await readJson(response)), ok: true }
})

export const loadVendorServices = cache(async (): Promise<VendorListResult<VendorService>> => {
  const response = await fetchWithSession("/api/vendor/services")
  if (!response?.ok) return { items: [], ok: false }

  return {
    items: parseList(await readJson(response), "services", parseVendorService),
    ok: true,
  }
})

export const loadVendorBookings = cache(async (): Promise<VendorListResult<Booking>> => {
  const response = await fetchWithSession("/api/bookings")
  if (!response?.ok) return { items: [], ok: false }

  return {
    items: parseList(await readJson(response), "bookings", parseBooking),
    ok: true,
  }
})
