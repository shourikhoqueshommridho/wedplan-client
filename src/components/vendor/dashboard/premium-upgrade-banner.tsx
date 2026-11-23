import Link from "next/link"
import { ArrowRight, Crown } from "lucide-react"

import { weddingImages } from "@/data/images"

interface PremiumUpgradeBannerProps {
  isPremium?: boolean
}

export function PremiumUpgradeBanner({ isPremium = false }: PremiumUpgradeBannerProps) {
  return (
    <section className="relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-[1.15rem] border border-wine-100 bg-[linear-gradient(115deg,#fff1f6_0%,#fbdce9_58%,#f7c8d9_100%)] p-6 shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-[58%] bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url("${weddingImages.floral.src}")` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-[72%] bg-[linear-gradient(90deg,#fff1f6_0%,rgba(255,241,246,0.85)_38%,rgba(255,241,246,0)_100%)]"
      />

      <div aria-hidden="true" className="pointer-events-none absolute bottom-3 right-8 hidden sm:block">
        <div className="relative grid size-28 place-items-center">
          <span className="absolute bottom-0 h-8 w-24 rounded-[50%] bg-burgundy-700 shadow-[0_16px_24px_-12px_rgba(80,16,38,0.7)]" />
          <Crown
            className="relative size-20 text-[#e6bf72] drop-shadow-[0_10px_14px_rgba(120,70,20,0.4)]"
            strokeWidth={1.6}
            fill="#f0d49b"
          />
        </div>
      </div>

      <div className="relative max-w-[62%] sm:max-w-[58%]">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white/80 text-wine-700 shadow-sm">
          <Crown aria-hidden="true" className="size-5" />
        </span>

        <h2 className="mt-4 font-heading text-2xl font-semibold italic leading-tight text-wine-900">
          {isPremium ? "Premium is active" : "Upgrade to Premium"}
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-wine-900/75">
          {isPremium
            ? "Unlimited active services and your Premium badge are enabled on your account."
            : "Publish unlimited services and get more visibility on WedPlan."}
        </p>
        {isPremium ? (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold-300/70 bg-white/85 px-3 py-1 text-xs font-semibold text-wine-800">
            Premium
          </span>
        ) : null}
      </div>

      <div className="relative mt-6">
        {isPremium ? (
          <Link
            href="/dashboard/vendor/subscription"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-wine-200 bg-white/85 px-6 text-sm font-semibold text-wine-800 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wine-200"
          >
            View subscription
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        ) : (
          <Link
            href="/dashboard/vendor/subscription"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-burgundy-600 px-6 text-sm font-semibold text-white shadow-[0_16px_30px_-16px_rgba(112,19,47,0.85)] transition-colors hover:bg-burgundy-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wine-200"
          >
            Go Premium
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        )}
      </div>
    </section>
  )
}
