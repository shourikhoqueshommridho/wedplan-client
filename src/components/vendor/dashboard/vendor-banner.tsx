import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Crown } from "lucide-react"

import { weddingImages } from "@/data/images"

interface VendorBannerProps {
  name: string
}

export function VendorBanner({ name }: VendorBannerProps) {
  return (
    <section
      aria-labelledby="vendor-welcome-title"
      className="relative isolate overflow-hidden rounded-[1.25rem] border border-wine-100 bg-[#fff1f5] shadow-[0_18px_45px_-40px_rgba(112,19,47,0.6)]"
    >
      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-full sm:w-[52%] lg:w-[46%]">
        <Image
          src={weddingImages.hero.src}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 620px, (min-width: 640px) 52vw, 100vw"
          className="object-cover object-[center_30%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #fff1f5 0%, rgba(255,241,245,0.94) 30%, rgba(255,241,245,0.38) 58%, rgba(255,241,245,0) 80%)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,241,245,0.55)_0%,rgba(255,241,245,0)_45%,rgba(255,241,245,0.75)_100%)] sm:hidden" />
      </div>

      <div className="relative z-10 max-w-2xl px-6 py-8 sm:px-9 sm:py-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-300/70 bg-white/85 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-wine-800 shadow-sm backdrop-blur-sm">
          <Crown aria-hidden="true" className="size-3.5 text-gold-500" />
          Vendor Dashboard
        </span>

        <h1
          id="vendor-welcome-title"
          className="mt-3 font-heading text-[1.85rem] font-semibold leading-[1.2] text-wine-900 sm:text-[2.4rem]"
        >
          Welcome back, {name}!
        </h1>

        <p className="mt-2.5 max-w-md text-sm leading-relaxed text-wine-900/75">
          Manage your services, bookings and grow your business with WedPlan.
        </p>

        <Link
          href="/dashboard/vendor/settings"
          className="group mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-burgundy-600 px-5 text-sm font-semibold text-white shadow-[0_14px_28px_-14px_rgba(112,19,47,0.8)] transition-colors hover:bg-burgundy-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wine-200"
        >
          View Profile
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  )
}
