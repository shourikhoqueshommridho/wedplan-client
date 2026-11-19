export const USER_ROLES = ["customer", "vendor", "admin"] as const

export type UserRole = (typeof USER_ROLES)[number]

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value)
}

/** Unknown/missing roles are treated as the least-privileged role. */
export function normalizeUserRole(value: unknown): UserRole {
  return isUserRole(value) ? value : "customer"
}

export interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: UserRole
  createdAt: string | null
}

export interface AuthSession {
  id: string
  expiresAt: string | null
  createdAt: string | null
}

export interface AuthSessionData {
  user: AuthUser
  session: AuthSession
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

/**
 * Validates the JSON returned by Better Auth before any server component
 * trusts it. Unknown shapes yield `null`, never a partially-trusted user.
 */
export function parseAuthSession(value: unknown): AuthSessionData | null {
  if (!isRecord(value)) return null

  const user = value.user
  const session = value.session
  if (!isRecord(user) || !isRecord(session)) return null

  const id = readString(user.id)
  const email = readString(user.email)
  const name = readString(user.name)

  if (!id || !email || !name) return null

  return {
    user: {
      id,
      name,
      email,
      emailVerified: user.emailVerified === true,
      image: readString(user.image),
      role: normalizeUserRole(user.role),
      createdAt: readString(user.createdAt),
    },
    session: {
      id: readString(session.id) ?? "",
      expiresAt: readString(session.expiresAt),
      createdAt: readString(session.createdAt),
    },
  }
}
