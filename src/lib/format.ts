import type { ServicePrice } from "@/types/service"

const priceFormatters: Record<ServicePrice["currency"], Intl.NumberFormat> = {
  USD: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }),
  BDT: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }),
}

/**
 * Formats a service price for display. Kept in one place so the API-backed
 * version can reuse the exact same presentation rules.
 */
export function formatServicePrice(price: ServicePrice): string {
  return priceFormatters[price.currency].format(price.amount)
}

/** Formats a bare amount for API records that only store a number. */
export function formatAmount(amount: number, currency: ServicePrice["currency"] = "BDT"): string {
  return priceFormatters[currency].format(amount)
}

/** Formats a `YYYY-MM-DD` booking date without shifting across time zones. */
export function formatDateOnly(value: string): string {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}
