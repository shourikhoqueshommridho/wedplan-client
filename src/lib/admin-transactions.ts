import { isRecord } from "@/lib/service-listing"
import type { AdminTransaction } from "@/types/admin"

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

export function parseAdminTransaction(value: unknown): AdminTransaction | null {
  if (!isRecord(value)) return null

  const id = text(value.id)
  const vendorId = text(value.vendorId)
  if (!id || !vendorId) return null

  const plan = value.plan === "premium" ? "premium" : "free"

  return {
    id,
    vendorId,
    vendorName: text(value.vendorName) ?? vendorId,
    plan,
    amount: typeof value.amount === "number" && Number.isFinite(value.amount) ? value.amount : 0,
    currency: text(value.currency) ?? "USD",
    status: text(value.status) ?? "unknown",
    stripeSessionId: text(value.stripeSessionId),
    stripeSubscriptionId: text(value.stripeSubscriptionId),
    createdAt: text(value.createdAt),
  }
}

/** Unwraps `{ success, data: { transactions } }` from the protected API. */
export function parseAdminTransactionList(payload: unknown): AdminTransaction[] {
  if (!isRecord(payload)) return []
  const data = isRecord(payload.data) ? payload.data : payload
  const list = data.transactions
  if (!Array.isArray(list)) return []

  return list
    .map(parseAdminTransaction)
    .filter((item): item is AdminTransaction => item !== null)
}

export function formatTransactionAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`
  }
}

export function formatTransactionDate(value: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}
