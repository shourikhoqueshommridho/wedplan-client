import Link from "next/link"
import { ArrowRight, CalendarDays, Check, Crown, Sparkles } from "lucide-react"

import { formatRenewalDate, type VendorSubscriptionStatus } from "@/lib/subscription-data"
import {
  currentPlanLabel,
  isPremiumPlan,
  serviceAllowanceLabel,
  shouldShowPremiumBadge,
} from "@/lib/subscription-ui"

interface CurrentPlanCardProps {
  subscription: VendorSubscriptionStatus | null
}

function statusLabel(subscription: VendorSubscriptionStatus | null): string {
  const isPremium = isPremiumPlan(subscription)
  const status = subscription?.status ?? "none"

  if (!isPremium) {
    if (status === "canceled" || status === "expired") return "Expired"
    return "Free"
  }
  if (status === "trialing") return "Trialing"
  if (status === "active") {
    return subscription?.cancelAtPeriodEnd ? "Active — cancels at period end" : "Active"
  }
  return isPremium ? "Premium" : "Free"
}

/** Dashboard overview card. Uses the same server-confirmed state as the Subscription page. */
export function CurrentPlanCard({ subscription }: CurrentPlanCardProps) {
  const isPremium = isPremiumPlan(subscription)

  return (
    <section
      aria-labelledby="vendor-current-plan-title"
      className="rounded-[1.25rem] border border-wine-100 bg-white p-6 shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-wine-500">
            Current plan
          </p>
          <h2
            id="vendor-current-plan-title"
            className="mt-2 flex flex-wrap items-center gap-2 font-heading text-xl font-semibold text-wine-900"
          >
            <Crown aria-hidden="true" className={isPremium ? "size-5 text-gold-500" : "size-5 text-wine-300"} />
            {currentPlanLabel(subscription)}
            {shouldShowPremiumBadge(subscription) ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-gold-300/70 bg-gold-300/25 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800">
                <Sparkles aria-hidden="true" className="size-3" />
                Premium
              </span>
            ) : null}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{statusLabel(subscription)}</p>
        </div>

        <Link
          href="/dashboard/vendor/subscription"
          className="group inline-flex h-9 items-center gap-2 rounded-full border border-wine-200 bg-cream-50 px-4 text-xs font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wine-200"
        >
          Manage subscription
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <div className="mt-5 grid gap-3 border-t border-wine-100 pt-5 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Active services
            </p>
            <p className="mt-0.5 font-medium text-foreground">{serviceAllowanceLabel(subscription)}</p>
          </div>
        </div>
        {isPremium ? (
          <div className="flex items-start gap-2">
            <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Renewal date
              </p>
              <p className="mt-0.5 font-medium text-foreground">
                {formatRenewalDate(subscription?.renewalDate ?? null) ?? "Available on your next invoice"}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
