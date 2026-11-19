import type { UserRole } from "@/types/auth"

export const DEFAULT_AUTH_DESTINATION = "/dashboard"
const SAFE_REDIRECT_ORIGIN = "http://wedplan.local"

/**
 * Only allows internal, same-origin paths. Rejects protocol-relative URLs,
 * backslash tricks, control characters and auth/API endpoints to avoid open
 * redirects and loops.
 */
export function sanitizeNextPath(value: string | string[] | null | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value

  if (!raw) return DEFAULT_AUTH_DESTINATION

  const candidate = raw.trim()

  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return DEFAULT_AUTH_DESTINATION
  }

  if (candidate.length > 512 || /[\u0000-\u001f\u007f]/.test(candidate)) {
    return DEFAULT_AUTH_DESTINATION
  }

  try {
    const url = new URL(candidate, SAFE_REDIRECT_ORIGIN)

    if (url.origin !== SAFE_REDIRECT_ORIGIN) return DEFAULT_AUTH_DESTINATION
    if (url.pathname.startsWith("/api/")) return DEFAULT_AUTH_DESTINATION
    if (url.pathname === "/sign-in" || url.pathname === "/sign-up") {
      return DEFAULT_AUTH_DESTINATION
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return DEFAULT_AUTH_DESTINATION
  }
}

export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin"
    case "vendor":
      return "/dashboard/vendor"
    default:
      return "/dashboard/customer"
  }
}
