import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Crown } from "lucide-react"

import { weddingImages } from "@/data/images"

export function AdminBanner() {
  return (
    <section
      aria-labelledby="admin-welcome-title"
      className="relative isolate overflow-hidden rounded-[1.25rem] border border-wine-100 bg-[#fff1f5] shadow-[0_18px_45px_-40px_rgba(112,19,47,0.6)]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-40 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url("${weddingImages.floral.src}")` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-56 bg-[linear-gradient(90deg,rgba(255,241,245,0.98)_0%,rgba(255,241,245,0.85)_45%,rgba(255,241,245,0)_100%)]"
      />

      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-full sm:w-[56%] lg:w-[52%]">
        <Image
          src={weddingImages.venue.src}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 700px, (min-width: 640px) 56vw, 100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #fff1f5 0%, rgba(255,241,245,0.94) 28%, rgba(255,241,245,0.35) 62%, rgba(255,241,245,0) 85%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl px-6 py-8 sm:px-9 sm:py-9">
        <span className="inline-flex items-center gap-1.5 text-gold-500" aria-hidden="true">
          <Crown className="size-5" strokeWidth={2} />
        </span>
        <h1
          id="admin-welcome-title"
          className="mt-1.5 font-heading text-[1.85rem] font-semibold italic leading-[1.2] text-wine-900 sm:text-[2.35rem]"
        >
          Welcome back, Admin!
        </h1>
        <p className="mt-2.5 max-w-md text-sm leading-relaxed text-wine-900/75">
          Manage your platform, review activities and ensure the best experience for everyone.
        </p>

        <Link
          href="/dashboard/admin/services"
          className="group mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-burgundy-600 px-5 text-sm font-semibold text-white shadow-[0_14px_28px_-14px_rgba(112,19,47,0.8)] transition-colors hover:bg-burgundy-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wine-200"
        >
          Go to Manage Services
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  )
}
