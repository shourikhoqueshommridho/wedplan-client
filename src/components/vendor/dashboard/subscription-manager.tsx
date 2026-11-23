"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertCircle, Check, Crown, Info, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/client-api"
import { isRecord } from "@/lib/service-listing"
import {
  fetchVendorSubscriptionResult,
  formatPaymentAmount,
  formatRenewalDate,
  type VendorSubscriptionStatus,
} from "@/lib/subscription-data"
import {
  currentPlanLabel,
  isPremiumPlan,
  nextSubscriptionState,
  serviceAllowanceLabel,
  shouldShowUpgradeButton,
} from "@/lib/subscription-ui"
import { cn } from "@/lib/utils"

interface SubscriptionManagerProps {
  initialSubscription: VendorSubscriptionStatus | null
}

function statusLabel(status: string): string {
  switch (status) {
    case "active": return "Active"
    case "trialing": return "Trialing"
    case "incomplete": return "Pending activation"
    case "past_due": return "Payment issue"
    case "unpaid": return "Unpaid"
    case "canceled": return "Canceled"
    case "expired": return "Expired"
    default: return "Free"
  }
}

function statusClasses(status: string): string {
  switch (status) {
    case "active":
    case "trialing":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "incomplete":
      return "border-gold-300/70 bg-gold-300/25 text-wine-800"
    case "past_due":
    case "unpaid":
      return "border-destructive/20 bg-destructive/5 text-destructive"
    default:
      return "border-wine-200 bg-white text-muted-foreground"
  }
}

const PREMIUM_BENEFITS = [
  "Unlimited active service listings",
  "Priority placement in search results",
  "Premium vendor badge on your public profile",
  "Detailed booking and earnings insights",
]

/**
 * Subscription UI is read-only except for starting Stripe Checkout. The plan
 * and status always come from the server; the success redirect never activates
 * Premium itself.
 */
export function SubscriptionManager({ initialSubscription }: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState(initialSubscription)
  const [isProcessing, setIsProcessing] = useState(false)
  // Synchronous guard: React state may not update before a second fast click.
  const processingRef = useRef(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // The server is the only source of plan state. Re-read it when the page is
  // mounted so a return from Stripe Checkout never shows stale cached data.
  const refreshSubscription = useCallback(async () => {
    const result = await fetchVendorSubscriptionResult()
    setSubscription((previous) => nextSubscriptionState(previous, result))
    setLoadError(result.ok ? null : result.message)
  }, [])

  useEffect(() => {
    queueMicrotask(() => void refreshSubscription())
  }, [refreshSubscription])

  const isPremium = isPremiumPlan(subscription)
  const showUpgrade = shouldShowUpgradeButton(subscription)
  const planName =
    subscription === null && loadError ? "Status unavailable" : currentPlanLabel(subscription)
  const allowanceLabel = serviceAllowanceLabel(subscription)
  const status = subscription?.status ?? "none"
  const serviceCount = subscription?.activeServiceCount ?? 0

  async function handleUpgrade() {
    // Prevent repeated clicks while a Checkout Session is being created.
    if (processingRef.current || isProcessing) return
    processingRef.current = true

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const response = await apiFetch("/stripe/checkout", { method: "POST" })
      const payload: unknown = await response.json().catch(() => null)

      if (!response.ok) {
        const serverMessage =
          isRecord(payload) && typeof payload.message === "string" && payload.message.trim()
            ? payload.message
            : null
        const message =
          serverMessage ?? `Checkout request failed (HTTP ${response.status}). Please try again.`
        setErrorMessage(message)
        toast.error("Checkout unavailable", { description: message })
        return
      }

      const url = isRecord(payload) && isRecord(payload.data) ? payload.data.url : null
      if (typeof url !== "string" || !url.trim()) {
        throw new Error("The server did not return a Stripe Checkout URL.")
      }

      const redirect = new URL(url)
      if (redirect.protocol !== "https:" && redirect.protocol !== "http:") {
        throw new Error("The returned Checkout URL is invalid.")
      }

      window.location.assign(redirect.toString())
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not start checkout."
      setErrorMessage(message)
      toast.error("Could not start checkout", { description: message })
    } finally {
      processingRef.current = false
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-wine-500">
          Billing
        </p>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-wine-900 sm:text-3xl">
          Subscription
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Manage your WedPlan plan and active service allowance. Plan changes are processed
          securely through Stripe.
        </p>
      </header>

      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {loadError ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold-300/60 bg-cream-50 px-4 py-3 text-sm text-wine-800"
        >
          <span>
            {subscription
              ? "We could not refresh your subscription status. Showing the last confirmed plan."
              : "We could not load your subscription status."}{" "}
            {loadError}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refreshSubscription()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      <section className="rounded-[1.25rem] border border-wine-100 bg-white p-6 shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)] sm:p-7">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-wine-500">
          Current plan
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex flex-wrap items-center gap-2 font-heading text-2xl font-semibold text-wine-900">
              <Crown aria-hidden="true" className={cn("size-5", isPremium ? "text-gold-500" : "text-wine-300")} />
              {planName}
              {isPremium ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-gold-300/70 bg-gold-300/25 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800">
                  <Sparkles aria-hidden="true" className="size-3" />
                  Premium
                </span>
              ) : null}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {isPremium
                ? "All premium features are active on your vendor account."
                : "Publish services for admin review and manage booking requests at no cost."}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
              statusClasses(status),
            )}
          >
            {isPremium ? <Check aria-hidden="true" className="size-3.5" /> : null}
            {statusLabel(status)}
          </span>
        </div>

        {isPremium ? (
          <div className="mt-5 grid gap-3 border-t border-wine-100 pt-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Renewal date
              </p>
              <p className="mt-1 font-medium text-foreground">
                {formatRenewalDate(subscription?.renewalDate ?? null) ?? "Available on your next invoice"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Active services
              </p>
              <p className="mt-1 font-medium text-foreground">Unlimited</p>
            </div>
          </div>
        ) : null}

        {isPremium && subscription?.cancelAtPeriodEnd ? (
          <p className="mt-4 rounded-xl border border-gold-300/60 bg-cream-50 px-4 py-3 text-sm text-wine-800">
            Your subscription is set to cancel at the end of the current billing period.
          </p>
        ) : null}

        {subscription?.lastPayment?.status === "failed" ? (
          <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Your latest payment could not be processed. Please update your payment details in Stripe
            to keep Premium active.
          </p>
        ) : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.15rem] border border-wine-100 bg-white p-6">
          <h3 className="font-heading text-xl font-semibold text-wine-900">
            {isPremium ? "Premium benefits" : "Included with your account"}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-foreground/75">
            {(isPremium
              ? PREMIUM_BENEFITS
              : [
                  "Submit up to 3 active service listings",
                  "Receive and answer booking requests",
                  "Track bookings and estimated earnings",
                  "Maintain a public business profile",
                ]
            ).map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-wine-100 bg-cream-50 px-4 py-3.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-wine-900">Active service allowance</span>
              <span className="font-semibold text-wine-800">
                {isPremium ? "Unlimited" : `${serviceCount} of ${allowanceLabel}`}
              </span>
            </div>
            {!isPremium ? (
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {subscription?.canCreateService === false
                  ? "You have reached the Free Plan limit. Upgrade to Premium to publish more services."
                  : `Free vendors can keep a maximum of ${allowanceLabel} active services.`}
              </p>
            ) : null}
          </div>

          {subscription?.lastPayment && subscription.lastPayment.status === "paid" ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Last payment: {formatPaymentAmount(subscription.lastPayment.amount, subscription.lastPayment.currency)}
            </p>
          ) : null}
        </div>

        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.15rem] border border-wine-100 bg-[linear-gradient(115deg,#fff1f6_0%,#fbdce9_100%)] p-6">
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-white/80 text-wine-700 shadow-sm">
                <Sparkles aria-hidden="true" className="size-6" />
              </div>

              {showUpgrade ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="h-11 gap-2 rounded-full px-6 text-sm font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                      Opening checkout…
                    </>
                  ) : (
                    <>
                      <Crown aria-hidden="true" className="size-4" />
                      Upgrade to Premium
                    </>
                  )}
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-300/70 bg-white/85 px-4 py-2 text-xs font-semibold text-wine-800 shadow-sm">
                  <Sparkles aria-hidden="true" className="size-3.5" />
                  Premium active
                </span>
              )}
            </div>

            <h3 className="mt-5 font-heading text-xl font-semibold text-wine-900">
              {showUpgrade ? "Upgrade to Premium" : "Premium is active"}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-wine-900/75">
              {showUpgrade
                ? "Remove the active service limit, stand out with a Premium badge, and unlock priority placement. Payment is handled securely by Stripe in Test Mode."
                : "Your Premium subscription is active. All benefits below are available on your vendor account."}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-wine-900/80">
              {PREMIUM_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-8">
            <p className="max-w-sm text-xs leading-relaxed text-wine-900/60">
              Premium is activated only after Stripe confirms the subscription. The server updates
              your plan from verified webhook events.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-2xl border border-gold-300/60 bg-cream-50 px-4 py-3.5 text-xs leading-relaxed text-foreground/75">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
        <span>
          Your role and plan are managed by the server. Payment details are never collected in the
          vendor dashboard.
        </span>
      </div>
    </div>
  )
}
