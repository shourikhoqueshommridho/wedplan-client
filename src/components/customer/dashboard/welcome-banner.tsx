import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Heart } from "lucide-react"

import { weddingImages } from "@/data/images"
import { firstNameFromName } from "@/lib/customer-dashboard"

interface WelcomeBannerProps {
  name: string
}

export function WelcomeBanner({ name }: WelcomeBannerProps) {
  const firstName = firstNameFromName(name)

  return (
    <section
      aria-labelledby="welcome-title"
      className="relative isolate overflow-hidden rounded-[1.75rem] border border-wine-100 bg-[#fff1f5] shadow-[0_26px_70px_-55px_rgba(112,19,47,0.6)]"
    >
      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-full sm:w-[58%] lg:w-[54%]">
        <Image
          src={weddingImages.hero.src}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 760px, (min-width: 640px) 58vw, 100vw"
          className="object-cover object-[center_30%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #fff1f5 0%, rgba(255,241,245,0.94) 32%, rgba(255,241,245,0.38) 58%, rgba(255,241,245,0) 78%)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,241,245,0.55)_0%,rgba(255,241,245,0)_45%,rgba(255,241,245,0.75)_100%)] sm:hidden" />
      </div>

      <div className="relative z-10 max-w-2xl px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.3em] text-wine-600">
          Your wedding dashboard
        </p>

        <h1
          id="welcome-title"
          className="mt-3 font-heading text-[2rem] font-semibold leading-[1.2] text-wine-900 sm:text-[2.75rem]"
        >
          Welcome back, {firstName}!{" "}
          <Heart
            aria-hidden="true"
            className="mb-1.5 inline-block size-7 shrink-0 text-wine-500 sm:size-9"
            strokeWidth={1.4}
          />
        </h1>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-wine-900/75 sm:text-base">
          Let&apos;s make your dream wedding a reality with WedPlan.
        </p>

        <Link
          href="/services"
          className="group mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-burgundy-600 px-6 text-sm font-semibold text-white shadow-[0_18px_36px_-18px_rgba(112,19,47,0.8)] transition-colors hover:bg-burgundy-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wine-200"
        >
          Explore Services
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  )
}
