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
