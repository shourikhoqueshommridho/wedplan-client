import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronRight,
  Heart,
  MapPin,
  Sparkles,
  Tag,
} from "lucide-react"

import { Reveal } from "@/components/motion/reveal"
import { BookingPanel } from "@/components/service/booking-panel"
import { ServiceCard } from "@/components/service/service-card"
import { ServiceGallery } from "@/components/service/service-gallery"
import { VendorAvatar } from "@/components/service/vendor-avatar"
import { buttonVariants } from "@/components/ui/button"
import { formatServicePrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ServiceListing } from "@/types/service"

interface ServiceDetailsViewProps {
  service: ServiceListing
  relatedServices: ServiceListing[]
}

export function ServiceDetailsView({ service, relatedServices }: ServiceDetailsViewProps) {
  const locationName = [service.location.city, service.location.country]
    .filter((part) => part.trim().length > 0)
    .join(", ")

  return (
    <>
      <div className="border-b border-wine-100/80 bg-white/70">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-3.5 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
              <li className="shrink-0">
                <Link
                  href="/"
                  className="rounded transition-colors hover:text-wine-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="shrink-0 text-wine-300">
                <ChevronRight className="size-3.5" />
              </li>
              <li className="shrink-0">
                <Link
                  href="/services"
                  className="rounded transition-colors hover:text-wine-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300"
                >
                  Browse Services
                </Link>
              </li>
              <li aria-hidden="true" className="shrink-0 text-wine-300">
                <ChevronRight className="size-3.5" />
              </li>
              <li className="min-w-0" aria-current="page">
                <span className="block truncate font-medium text-foreground/80">{service.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <header className="relative overflow-hidden border-b border-wine-100/80 bg-[radial-gradient(circle_at_15%_0%,#fff8f0_0%,#fffdfa_42%,#fdf3f6_100%)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full border border-gold-300/30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/3 size-64 rounded-full bg-wine-100/40 blur-3xl"
        />

        <div className="relative mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/services?category=${encodeURIComponent(service.category)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-wine-200/80 bg-white/90 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-wine-700 transition-colors hover:border-wine-300 hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300"
                >
                  <Sparkles aria-hidden="true" className="size-3.5" />
                  {service.categoryLabel}
                </Link>
                {service.vendor.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-wine-800 px-3 py-1 text-[0.68rem] font-semibold text-cream-50">
                    <BadgeCheck aria-hidden="true" className="size-3.5" />
                    Verified vendor
                  </span>
                ) : null}
              </div>

              <h1 className="mt-3 font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-wine-900 sm:text-5xl lg:text-[3.4rem]">
                {service.name}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-sm text-foreground/70 sm:text-base">
                <MapPin aria-hidden="true" className="size-4 shrink-0 text-wine-500" />
                {locationName}
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:flex-col lg:items-end">
              <div className="rounded-2xl border border-wine-100 bg-white/90 px-4 py-3 text-left shadow-sm sm:min-w-44 sm:text-right">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Listed price
                </p>
                <p className="mt-0.5 font-heading text-2xl font-semibold text-wine-800">
                  {formatServicePrice(service.price)}
                </p>
              </div>
              <a
                href="#booking"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-11 rounded-full bg-wine-800 px-6 text-sm font-semibold text-cream-50 hover:bg-wine-900",
                )}
              >
                Book This Service
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-9">
          <div className="min-w-0 space-y-6">
            <Reveal>
              <ServiceGallery
                key={service.id}
                serviceId={service.id}
                name={service.name}
                categoryLabel={service.categoryLabel}
                image={service.image}
                images={service.images}
              />
            </Reveal>

            <Reveal delay={0.05}>
              <section
                aria-labelledby="service-overview-title"
                className="rounded-[1.75rem] border border-wine-100 bg-white p-6 shadow-[0_20px_55px_-48px_rgba(80,16,38,0.55)] sm:p-8"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-px w-8 bg-wine-300" aria-hidden="true" />
                  <Heart aria-hidden="true" className="size-3.5 fill-wine-600 text-wine-600" />
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-wine-500">
                    About this service
                  </p>
                </div>
                <h2
                  id="service-overview-title"
                  className="mt-3 font-heading text-3xl font-semibold tracking-tight text-wine-900"
                >
                  Service overview
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-foreground/75 sm:text-base">
                  {service.shortDescription}
                </p>
              </section>
            </Reveal>

            <Reveal delay={0.08}>
              <section
                aria-labelledby="service-details-title"
                className="grid gap-4 rounded-[1.75rem] border border-wine-100 bg-white p-6 shadow-[0_20px_55px_-48px_rgba(80,16,38,0.55)] sm:grid-cols-3 sm:p-7"
              >
                <h2 id="service-details-title" className="sr-only">
                  Service details
                </h2>
                <div>
                  <span className="grid size-9 place-items-center rounded-full bg-wine-50 text-wine-700">
                    <Tag aria-hidden="true" className="size-4" />
                  </span>
                  <p className="mt-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Category
                  </p>
                  <p className="mt-1 text-sm font-semibold text-wine-900">{service.categoryLabel}</p>
                </div>
                <div>
                  <span className="grid size-9 place-items-center rounded-full bg-wine-50 text-wine-700">
                    <MapPin aria-hidden="true" className="size-4" />
                  </span>
                  <p className="mt-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Location
                  </p>
                  <p className="mt-1 text-sm font-semibold text-wine-900">{locationName}</p>
                </div>
                <div>
                  <span className="grid size-9 place-items-center rounded-full bg-wine-50 text-wine-700">
                    <Building2 aria-hidden="true" className="size-4" />
                  </span>
                  <p className="mt-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Vendor
                  </p>
                  <p className="mt-1 text-sm font-semibold text-wine-900">{service.vendor.name}</p>
                </div>
              </section>
            </Reveal>

            <Reveal delay={0.1}>
              <section
                aria-labelledby="vendor-card-title"
                className="overflow-hidden rounded-[1.75rem] border border-wine-100 bg-white shadow-[0_20px_55px_-48px_rgba(80,16,38,0.55)]"
              >
                <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                  <div className="flex min-w-0 items-center gap-4">
                    <VendorAvatar
                      name={service.vendor.name}
                      initials={service.vendor.initials}
                      image={service.vendor.image}
                    />
                    <div className="min-w-0">
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-wine-500">
                        Your vendor
                      </p>
                      <h2
                        id="vendor-card-title"
                        className="mt-1 flex items-center gap-1.5 font-heading text-2xl font-semibold text-wine-900"
                      >
                        <span className="truncate">{service.vendor.name}</span>
                        {service.vendor.isVerified ? (
                          <BadgeCheck
                            aria-label="Verified vendor"
                            className="size-4 shrink-0 text-wine-500"
                          />
                        ) : null}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-wine-400" />
                        {locationName}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-cream-50 px-4 py-3 text-sm text-foreground/75">
                    <p className="font-semibold text-wine-900">{service.categoryLabel}</p>
                    <p className="mt-0.5 text-xs">Service provider on WedPlan</p>
                  </div>
                </div>
              </section>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-wine-100 bg-white/70 px-5 py-4">
                <p className="text-sm text-muted-foreground">
                  Ready to explore more wedding professionals?
                </p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-wine-800 underline decoration-wine-300 underline-offset-4 transition-colors hover:text-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300"
                >
                  <ArrowLeft aria-hidden="true" className="size-3.5" />
                  Back to Browse Services
                </Link>
              </div>
            </Reveal>
          </div>

          <aside className="min-w-0">
            <div className="lg:sticky lg:top-24">
              <BookingPanel service={service} />
            </div>
          </aside>
        </div>
      </section>

      {relatedServices.length > 0 ? (
        <section className="border-t border-wine-100 bg-white py-14 sm:py-16">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-wine-500">
                  Keep exploring
                </p>
                <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-wine-900 sm:text-4xl">
                  More {service.categoryLabel.toLowerCase()}
                </h2>
              </div>
              <Link
                href={`/services?category=${encodeURIComponent(service.category)}`}
                className="inline-flex items-center gap-1.5 self-start rounded-full border border-wine-200 px-4 py-2 text-xs font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300 sm:self-auto"
              >
                View category
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>

            <ul role="list" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((related, index) => (
                <li key={related.id} className="min-w-0">
                  <Reveal delay={Math.min(index * 0.05, 0.15)} className="h-full">
                    <ServiceCard service={related} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  )
}
