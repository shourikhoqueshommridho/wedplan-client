import type { VendorSubscriptionStatus } from "@/lib/subscription-data"

export type EffectivePlan = "free" | "premium"

/**
 * Single source of truth for every subscription UI surface. `active` is the
 * server-confirmed effective plan from GET /api/stripe/subscription; the client
 * never derives Premium from status strings or Checkout redirects.
 */
export function getEffectivePlan(status: VendorSubscriptionStatus | null): EffectivePlan {
  return status?.active === true ? "premium" : "free"
}

export function isPremiumPlan(status: VendorSubscriptionStatus | null): boolean {
  return getEffectivePlan(status) === "premium"
}

export function currentPlanLabel(status: VendorSubscriptionStatus | null): string {
  return isPremiumPlan(status) ? "Premium Plan" : "Free Plan"
}

export function shouldShowUpgradeButton(status: VendorSubscriptionStatus | null): boolean {
  return !isPremiumPlan(status)
}

export function shouldShowPremiumBadge(status: VendorSubscriptionStatus | null): boolean {
  return isPremiumPlan(status)
}

/** Never treat a missing/null serviceLimit as "Unlimited". */
export function serviceAllowanceLabel(status: VendorSubscriptionStatus | null): string {
  if (isPremiumPlan(status)) return "Unlimited"
  return `${status?.serviceLimit ?? 3} services`
}

/**
 * A failed refresh must preserve the last server-confirmed snapshot. It must
 * never replace a known Premium plan with Free.
 */
export function nextSubscriptionState(
  previous: VendorSubscriptionStatus | null,
  result: {
    ok: boolean
    data?: VendorSubscriptionStatus | null
    message?: string
  },
): VendorSubscriptionStatus | null {
  return result.ok && result.data ? result.data : previous
}
