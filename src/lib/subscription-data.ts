import { apiFetch, readApiMessage } from "@/lib/client-api"
import { isRecord } from "@/lib/service-listing"

/** Server-owned plan state. The browser never decides whether Premium is active. */
export interface VendorSubscriptionStatus {
  plan: "free" | "premium"
  status: string
  active: boolean
  renewalDate: string | null
  cancelAtPeriodEnd: boolean
  serviceLimit: number | null
  activeServiceCount: number
  canCreateService: boolean
  stripeSessionId: string | null
  stripeSubscriptionId: string | null
  lastPayment: {
    status: string
    amount: number
    currency: string
    createdAt: string | null
  } | null
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function parseLastPayment(value: unknown): VendorSubscriptionStatus["lastPayment"] {
  if (!isRecord(value)) return null
  return {
    status: optionalString(value.status) ?? "unknown",
    amount: typeof value.amount === "number" ? value.amount : 0,
    currency: optionalString(value.currency) ?? "USD",
    createdAt: optionalString(value.createdAt),
  }
}

export function parseVendorSubscription(value: unknown): VendorSubscriptionStatus | null {
  if (!isRecord(value)) return null
  if (value.plan !== "free" && value.plan !== "premium") return null

  return {
    plan: value.plan,
    status: optionalString(value.status) ?? "none",
    active: value.active === true,
    renewalDate: optionalString(value.renewalDate),
    cancelAtPeriodEnd: value.cancelAtPeriodEnd === true,
    serviceLimit: typeof value.serviceLimit === "number" ? value.serviceLimit : null,
    activeServiceCount:
      typeof value.activeServiceCount === "number" ? value.activeServiceCount : 0,
    canCreateService: value.canCreateService === true,
    stripeSessionId: optionalString(value.stripeSessionId),
    stripeSubscriptionId: optionalString(value.stripeSubscriptionId),
    lastPayment: parseLastPayment(value.lastPayment),
  }
}

/**
 * The backend responds with `{ success: true, data: <snapshot> }`. Parsing the
 * envelope directly always returned null, which made the UI show Free Plan
 * with an "Unlimited" allowance at the same time.
 */
export function parseVendorSubscriptionResponse(payload: unknown): VendorSubscriptionStatus | null {
  if (isRecord(payload) && isRecord(payload.data)) {
    return parseVendorSubscription(payload.data)
  }

  return parseVendorSubscription(payload)
}

export type SubscriptionFetchResult =
  | { ok: true; data: VendorSubscriptionStatus }
  | { ok: false; message: string }

/**
 * Reads the current subscription through the same-origin backend proxy.
 * Errors are explicit so a transient failure can never be mistaken for a Free
 * plan or overwrite an already server-confirmed Premium plan.
 */
export async function fetchVendorSubscriptionResult(): Promise<SubscriptionFetchResult> {
  try {
    const response = await apiFetch("/stripe/subscription")
    if (!response.ok) {
      const message = await readApiMessage(
        response,
        `Subscription request failed (HTTP ${response.status}).`,
      )
      return { ok: false, message }
    }

    const data = parseVendorSubscriptionResponse(await response.json().catch(() => null))
    if (!data) {
      return { ok: false, message: "We could not read your subscription status." }
    }

    return { ok: true, data }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not refresh subscription status.",
    }
  }
}

/** Backwards-compatible wrapper for callers that only need the snapshot. */
export async function fetchVendorSubscription(): Promise<VendorSubscriptionStatus | null> {
  const result = await fetchVendorSubscriptionResult()
  return result.ok ? result.data : null
}

export function formatRenewalDate(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function formatPaymentAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`
  }
}
