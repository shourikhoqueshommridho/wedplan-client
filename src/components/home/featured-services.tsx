import Link from "next/link"
import { ArrowRight, Store } from "lucide-react"

import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/home/section-heading"
import { ServiceCard } from "@/components/service/service-card"
import { buttonVariants } from "@/components/ui/button"
import { fetchFeaturedServices } from "@/lib/featured-services"
import { cn } from "@/lib/utils"

const sectionClassName = "bg-cream-50 py-16 sm:py-20"
const containerClassName = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8"
const gridClassName =
  "mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6"

function SectionHeadingBlock() {
  return (
    <SectionHeading
      id="featured-services-title"
      title="Featured Wedding Services"
      description="Explore our top-rated and most popular wedding services."
      action={
        <Link
          href="/services"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "group h-10 rounded-full border-wine-200 px-5 text-xs font-semibold text-wine-800 hover:bg-wine-50",
          )}
        >
          View All Services
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </Link>
      }
    />
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mt-10 rounded-[1.75rem] border border-wine-100 bg-white px-6 py-10 text-center shadow-[0_10px_35px_-28px_rgba(80,16,38,0.55)]">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-wine-50 text-wine-700">
        <Store aria-hidden="true" className="size-6" />
      </span>
      <p className="mt-4 font-heading text-xl font-semibold text-wine-900">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/services"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-10 rounded-full bg-wine-800 px-5 text-cream-50 hover:bg-wine-900",
          )}
        >
          Browse all services
        </Link>
        <Link
          href="/vendor/sign-up"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 rounded-full border-wine-200 bg-white px-5 text-wine-800 hover:bg-wine-50",
          )}
        >
          Become a vendor
        </Link>
      </div>
    </div>
  )
}

/** Streamed fallback so the static home shell can prerender immediately. */
export function FeaturedServicesLoading() {
  return (
    <section aria-labelledby="featured-services-title" aria-busy="true" className={sectionClassName}>
      <div className={containerClassName}>
        <SectionHeadingBlock />
        <ul role="list" className={gridClassName}>
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="min-w-0">
              <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-wine-100/80 bg-white">
                <div className="aspect-[4/3] w-full bg-wine-50" />
                <div className="flex flex-1 flex-col gap-2.5 p-4">
                  <span className="h-2.5 w-20 rounded-full bg-wine-100" />
                  <span className="h-4 w-3/4 rounded-full bg-wine-100" />
                  <span className="h-3 w-1/2 rounded-full bg-wine-50" />
                  <span className="mt-auto h-9 w-full rounded-full bg-wine-50" />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <span className="sr-only">Loading featured services…</span>
      </div>
    </section>
  )
}

export async function FeaturedServices() {
  const result = await fetchFeaturedServices()

  return (
    <section aria-labelledby="featured-services-title" className={sectionClassName}>
      <div className={containerClassName}>
        <SectionHeadingBlock />

        {result.status === "error" ? (
          <EmptyState
            title="Featured services are temporarily unavailable"
            description="We could not reach the WedPlan service directory just now. Please refresh the page in a moment, or browse the full collection."
          />
        ) : result.services.length === 0 ? (
          <EmptyState
            title="Fresh vendor listings are on the way"
            description="Approved vendor services appear here as soon as our admin team reviews them. Vendors can create an account and submit a listing in minutes."
          />
        ) : (
          <ul role="list" className={gridClassName}>
            {result.services.map((service, index) => (
              <li key={service.id} className="min-w-0">
                <Reveal delay={Math.min(index * 0.05, 0.25)} className="h-full">
                  <ServiceCard service={service} />
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
