const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()

/**
 * Public API origin. Only NEXT_PUBLIC_* values reach the browser, and the API
 * origin is not a secret. MongoDB credentials stay in the server environment.
 */
export const API_BASE_URL = (configuredApiUrl || "http://localhost:5000").replace(/\/+$/, "")

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
