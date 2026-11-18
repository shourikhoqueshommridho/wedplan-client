import { apiUrl } from "@/lib/api"
import { isRecord, parseServiceListing } from "@/lib/service-listing"
import type { ServiceListing } from "@/types/service"

export type ServiceDetailResult =
  | { status: "ok"; service: ServiceListing }
  | { status: "invalid-id" }
  | { status: "not-found" }
  | { status: "error" }

const SERVICE_ID_PATTERN = /^[a-f\d]{24}$/i

function requestOptions(): RequestInit {
  return {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  }
}

/** Fetches one public service from the Express API for the dynamic route. */
export async function fetchServiceById(id: string): Promise<ServiceDetailResult> {
  if (!SERVICE_ID_PATTERN.test(id)) {
    return { status: "invalid-id" }
  }

  try {
    const response = await fetch(apiUrl(`/api/services/${encodeURIComponent(id)}`), requestOptions())

    if (response.status === 400) return { status: "invalid-id" }
    if (response.status === 404) return { status: "not-found" }
    if (!response.ok) return { status: "error" }

    const payload: unknown = await response.json()

    if (!isRecord(payload) || payload.success !== true) {
      return { status: "error" }
    }

    const service = parseServiceListing(payload.data)
    return service ? { status: "ok", service } : { status: "error" }
  } catch {
    return { status: "error" }
  }
}

/**
 * Related services are optional decoration for the page. A failure here must
 * never break the detail view, so this helper degrades to an empty list.
 */
export async function fetchRelatedServices(
  category: string,
  excludeId: string,
): Promise<ServiceListing[]> {
  try {
    const params = new URLSearchParams({ category, sort: "asc" })
    const response = await fetch(apiUrl(`/api/services?${params.toString()}`), requestOptions())

    if (!response.ok) return []

    const payload: unknown = await response.json()

    if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.data)) {
      return []
    }

    return payload.data
      .map(parseServiceListing)
      .filter((service): service is ServiceListing => service !== null && service.id !== excludeId)
      .slice(0, 3)
  } catch {
    return []
  }
}
