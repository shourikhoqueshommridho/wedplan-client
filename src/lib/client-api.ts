import { isRecord } from "@/lib/service-listing"

/**
 * Calls the Express API through the same-origin Next.js proxy so session
 * cookies are sent without exposing the API origin or any credentials in the
 * browser bundle.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  return fetch(`/api/backend${normalizedPath}`, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
  })
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
