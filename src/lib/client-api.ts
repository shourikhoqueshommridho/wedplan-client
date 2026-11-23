import { getJwtToken, refreshJwtToken } from "@/lib/jwt-token-store"
import { isRecord } from "@/lib/service-listing"

/**
 * Calls the Express API through the same-origin Next.js proxy. Session cookies
 * remain first-party; when a JWKS-verifiable JWT is available it is attached
 * as a Bearer token as well. A 401 triggers at most one token refresh/retry.
 */
async function performFetch(
  path: string,
  init: RequestInit,
  allowRetry: boolean,
): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const headers = new Headers(init.headers)

  if (!headers.has("accept")) headers.set("accept", "application/json")
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json")
  }

  const token = await getJwtToken().catch(() => null)
  if (token) headers.set("authorization", `Bearer ${token}`)

  const response = await fetch(`/api/backend${normalizedPath}`, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers,
  })

  if (allowRetry && response.status === 401 && token) {
    const refreshed = await refreshJwtToken().catch(() => null)
    // A different token means a real refresh happened; retry exactly once.
    if (refreshed && refreshed !== token) {
      return performFetch(path, init, false)
    }
  }

  return response
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return performFetch(path, init, true)
}

export async function readApiMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload: unknown = await response.json()
    if (isRecord(payload) && typeof payload.message === "string" && payload.message.trim()) {
      return payload.message
    }
  } catch {
    // Ignore malformed or empty bodies.
  }

  return fallback
}

export async function readApiFieldError(
  response: Response,
): Promise<{ field?: string; message: string } | null> {
  try {
    const payload: unknown = await response.json()
    if (!isRecord(payload)) return null

    const message = typeof payload.message === "string" ? payload.message : ""
    const errors = Array.isArray(payload.errors) ? payload.errors : []

    for (const error of errors) {
      if (
        isRecord(error) &&
        typeof error.field === "string" &&
        typeof error.message === "string"
      ) {
        return { field: error.field, message: error.message }
      }
    }

    return message ? { message } : null
  } catch {
    return null
  }
}
