import type { Metadata } from "next"
import { Check, Crown, Info, Sparkles } from "lucide-react"

import { VendorShell } from "@/components/vendor/dashboard/vendor-shell"
import { requireServerRole } from "@/lib/auth-server"
import { loadVendorBookings } from "@/lib/vendor-server"

export const metadata: Metadata = {
  title: "Subscription - Vendor Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function VendorSubscriptionPage() {
  const session = await requireServerRole("vendor", "/dashboard/vendor/subscription")
  const bookingsResult = await loadVendorBookings()
  const pendingBookings = bookingsResult.items.filter(
    (booking) => booking.status === "pending",
  ).length

  return (
    <VendorShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        role: session.user.role,
      }}
      pendingBookings={pendingBookings}
    >
      <div className="space-y-5">
        <section className="rounded-[1.25rem] border border-wine-100 bg-white p-6 shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)] sm:p-7">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-wine-500">
            Current plan
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 font-heading text-2xl font-semibold text-wine-900">
                <Crown aria-hidden="true" className="size-5 text-gold-500" />
                Free Plan
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                You can publish services for admin review and manage booking requests from your
                dashboard at no cost.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <Check aria-hidden="true" className="size-3.5" />
              Active
            </span>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.15rem] border border-wine-100 bg-white p-6">
            <h3 className="font-heading text-xl font-semibold text-wine-900">
              Included with your account
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-foreground/75">
              {[
                "Submit and manage service listings",
                "Receive and answer booking requests",
                "Track bookings and estimated earnings",
                "Maintain a public business profile",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.15rem] border border-wine-100 bg-[linear-gradient(115deg,#fff1f6_0%,#fbdce9_100%)] p-6">
            <div className="relative">
              <div className="flex size-12 items-center justify-center rounded-xl bg-white/80 text-wine-700 shadow-sm">
                <Sparkles aria-hidden="true" className="size-6" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-semibold text-wine-900">Premium</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-wine-900/75">
                Premium subscriptions are not enabled on WedPlan yet. Your free account keeps all
                current vendor features until an upgrade option is available.
              </p>
            </div>
            <span className="relative mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-5 py-3 text-sm font-semibold text-wine-800">
              Coming soon
            </span>
          </div>
        </section>

        <div className="flex items-start gap-2 rounded-2xl border border-gold-300/60 bg-cream-50 px-4 py-3.5 text-xs leading-relaxed text-foreground/75">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
          <span>
            Your role and plan are managed by the server. No payment details are collected in the
            vendor dashboard.
          </span>
        </div>
      </div>
    </VendorShell>
  )
}
