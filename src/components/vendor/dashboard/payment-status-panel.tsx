"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Crown,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  fetchVendorSubscriptionResult,
  type VendorSubscriptionStatus,
} from "@/lib/subscription-data"
import {
  currentPlanLabel,
  isPremiumPlan,
  nextSubscriptionState,
} from "@/lib/subscription-ui"
import { cn } from "@/lib/utils"

interface PaymentStatusPanelProps {
  mode: "success" | "cancel"
  initialSubscription: VendorSubscriptionStatus | null
}

const subscriptionHref = "/dashboard/vendor/subscription"

/**
 * This page never writes subscription state. It only reads the server-owned
 * status, which is updated by the verified Stripe webhook.
 */
export function PaymentStatusPanel({ mode, initialSubscription }: PaymentStatusPanelProps) {
  const [subscription, setSubscription] = useState(initialSubscription)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<boolean> => {
    setIsRefreshing(true)
    setErrorMessage(null)

    try {
      const result = await fetchVendorSubscriptionResult()
      setSubscription((previous) => nextSubscriptionState(previous, result))

      if (!result.ok) {
        setErrorMessage(result.message)
        return false
      }

      return true
    } finally {
      setIsRefreshing(false)
      setHasChecked(true)
    }
  }, [])

  useEffect(() => {
    // Defer the initial check so state updates happen outside the effect body.
    if (mode === "success") queueMicrotask(() => void refresh())
  }, [mode, refresh])

  if (mode === "cancel") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="rounded-[1.25rem] border border-wine-100 bg-white p-7 text-center shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)] sm:p-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-gold-300/70 bg-gold-300/20 text-wine-700">
            <XCircle aria-hidden="true" className="size-7" />
          </div>
          <h1 className="mt-5 font-heading text-2xl font-semibold text-wine-900 sm:text-3xl">
            Payment cancelled
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            You cancelled the checkout before completing payment. No charge was made and your
            subscription plan has not changed.
          </p>

          <div className="mt-6 rounded-2xl border border-wine-100 bg-cream-50 px-5 py-4 text-left text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current plan
            </p>
            <p className="mt-1.5 flex items-center gap-2 font-semibold text-wine-900">
              <Crown aria-hidden="true" className="size-4 text-gold-500" />
              {currentPlanLabel(subscription)}
              {isPremiumPlan(subscription) ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-gold-300/70 bg-gold-300/25 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800">
                  Premium
                </span>
              ) : null}
            </p>
          </div>

          <Link
            href={subscriptionHref}
            className={cn(buttonVariants({ size: "lg" }), "mt-7 h-11 gap-2 rounded-full px-6")}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Return to Subscription
          </Link>
        </section>
      </div>
    )
  }

  const isPremium = isPremiumPlan(subscription)
  const isPending = !isPremium && (subscription?.status === "incomplete" || subscription?.status === "none")
  const isProblem = !isPremium && !isPending && subscription !== null
  const planText =
    subscription === null && errorMessage ? "Status unavailable" : currentPlanLabel(subscription)

  async function handleRefresh() {
    const refreshed = await refresh()
    if (refreshed) toast.info("Status refreshed")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="rounded-[1.25rem] border border-wine-100 bg-white p-7 text-center shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)] sm:p-10">
        <div
          className={cn(
            "mx-auto flex size-14 items-center justify-center rounded-full",
            isPremium
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-gold-300/70 bg-gold-300/20 text-wine-700",
          )}
        >
          {isPremium ? (
            <CheckCircle2 aria-hidden="true" className="size-7" />
          ) : isPending ? (
            <Clock3 aria-hidden="true" className="size-7" />
          ) : (
            <AlertCircle aria-hidden="true" className="size-7" />
          )}
        </div>

        <h1 className="mt-5 font-heading text-2xl font-semibold text-wine-900 sm:text-3xl">
          {isPremium
            ? "Premium is active"
            : isPending
              ? "Payment received — verifying"
              : "Check your subscription status"}
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {isPremium
            ? "Stripe has confirmed your subscription. Your unlimited service allowance is now active."
            : isPending
              ? "Your payment was submitted. We are waiting for Stripe to confirm the subscription; this usually takes a few seconds. You can refresh at any time."
              : isProblem
                ? "We could not confirm an active subscription. Check the status below or return to your subscription page."
                : errorMessage
                  ? "We could not confirm your subscription status. Please try refreshing."
                  : "Checking your subscription status…"}
        </p>

        {!hasChecked && isRefreshing ? (
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Checking with WedPlan…
          </div>
        ) : null}

        {errorMessage ? (
          <div
            role="alert"
            className="mt-6 flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-left text-sm text-destructive"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-wine-100 bg-cream-50 px-5 py-4 text-left text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Server-reported status
            </span>
            <span className="font-semibold capitalize text-wine-900">
              {subscription?.status ?? "unknown"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current plan
            </span>
            <span className="flex items-center gap-2 font-semibold text-wine-900">
              {planText}
              {isPremium ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-gold-300/70 bg-gold-300/25 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800">
                  Premium
                </span>
              ) : null}
            </span>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-11 gap-2 rounded-full px-6"
          >
            {isRefreshing ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <RefreshCw aria-hidden="true" className="size-4" />
            )}
            Refresh status
          </Button>
          <Link
            href={subscriptionHref}
            className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 rounded-full px-6")}
          >
            Go to Subscription
          </Link>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Premium is activated only by the verified Stripe webhook. This page never changes your
          plan itself.
        </p>
      </section>
    </div>
  )
}
