import { apiUrl } from "@/lib/api"
import { isRecord, parseServiceListing } from "@/lib/service-listing"
import type { ServiceListing } from "@/types/service"

export type FeaturedServicesResult =
  | { status: "ok"; services: ServiceListing[] }
  | { status: "error" }

/**
 * Loads the services shown on the home page from the Express API. Only
 * approved, active listings are returned by the API, so this never falls back
 * to mock records with IDs that do not exist in MongoDB.
 */
export async function fetchFeaturedServices(limit = 6): Promise<FeaturedServicesResult> {
  try {
    const response = await fetch(apiUrl("/api/services?sort=asc"), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    if (!response.ok) return { status: "error" }

    const payload: unknown = await response.json()

    if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.data)) {
      return { status: "error" }
    }

    const services = payload.data
      .map(parseServiceListing)
      .filter((service): service is ServiceListing => service !== null)
      .slice(0, limit)

    return { status: "ok", services }
  } catch {
    return { status: "error" }
  }
}
