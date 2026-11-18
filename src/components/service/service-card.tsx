import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BadgeCheck, MapPin, Star } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { ServiceImage } from "@/components/service/service-image"
import { getServiceCategoryName } from "@/data/categories"
import { formatServicePrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ServiceCardData } from "@/types/service"

interface ServiceCardProps {
  service: ServiceCardData
  className?: string
  variant?: "default" | "compact"
}

/** Reusable card for home page highlights and API-backed service listings. */
export function ServiceCard({ service, className, variant = "default" }: ServiceCardProps) {
  const isCompact = variant === "compact"
  const serviceHref = `/services/${service.id}`
  const categoryName = service.categoryLabel ?? getServiceCategoryName(service.category)
  const locationName = [service.location.city, service.location.country]
    .filter((part) => part.trim().length > 0)
    .join(", ")
  const rating = service.rating
  const imageSources = [service.image.src, ...(service.images ?? [])]
  const ratingTitle =
    typeof rating === "number"
      ? typeof service.reviewCount === "number"
        ? `${rating} out of 5 from ${service.reviewCount} reviews`
        : `${rating} out of 5`
      : undefined

  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-wine-100/80 bg-white shadow-[0_10px_35px_-28px_rgba(80,16,38,0.55)] transition-all duration-300 hover:-translate-y-1 hover:border-wine-200 hover:shadow-[0_28px_55px_-32px_rgba(80,16,38,0.45)] focus-within:border-wine-300",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-wine-50",
          isCompact ? "aspect-[16/7]" : "aspect-[4/3]",
        )}
      >
        <ServiceImage
          sources={imageSources}
          alt={service.image.alt}
          sizes="(min-width: 1536px) 24vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {typeof rating === "number" ? (
          <span
            title={ratingTitle}
            className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[0.7rem] font-semibold text-wine-900 shadow-sm"
          >
            <Star aria-hidden="true" className="size-3 fill-gold-500 text-gold-500" />
            {rating.toFixed(1)}
            <span className="sr-only">out of 5</span>
          </span>
        ) : null}
      </div>

      <div className={cn("flex flex-1 flex-col gap-2", isCompact ? "p-3" : "p-4")}>
        <p
          className={cn(
            "truncate font-semibold tracking-[0.02em] text-wine-600",
            isCompact
              ? "w-fit rounded-full bg-wine-100 px-2.5 py-1 text-[0.65rem]"
              : "text-[0.68rem]",
          )}
        >
          {categoryName}
        </p>

        <h3
          className={cn(
            "line-clamp-2 font-heading font-semibold leading-snug text-wine-900",
            isCompact ? "text-base" : "text-lg",
          )}
        >
          <Link
            href={serviceHref}
            className="rounded-sm outline-none transition-colors hover:text-wine-700 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
          >
            {service.name}
          </Link>
        </h3>

        {!isCompact ? (
          <p className="text-sm font-bold text-wine-700">
            {formatServicePrice(service.price)}
            <span className="ml-1 text-[0.7rem] font-medium text-muted-foreground">
              / {service.price.unit}
            </span>
          </p>
        ) : null}

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-wine-400" />
          {locationName}
        </p>

        <div
          className={cn(
            "mt-1 flex items-center gap-2 text-xs text-muted-foreground",
            isCompact ? "justify-between" : "border-t border-wine-50 pt-3",
          )}
        >
          {service.vendor.image ? (
            <Image
              src={service.vendor.image}
              alt=""
              width={24}
              height={24}
              className="size-6 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid size-6 shrink-0 place-items-center rounded-full bg-wine-100 text-[0.6rem] font-bold text-wine-800"
            >
              {service.vendor.initials}
            </span>
          )}
          <span className={cn("truncate font-medium text-foreground/80", isCompact && "mr-auto")}>
            {service.vendor.name}
          </span>
          {service.vendor.isVerified ? (
            <span title="Verified vendor" className="shrink-0 text-wine-500">
              <BadgeCheck aria-hidden="true" className="size-3.5" />
              <span className="sr-only">Verified vendor</span>
            </span>
          ) : null}
          {isCompact ? (
            <p className="shrink-0 text-sm font-bold text-wine-700">
              {formatServicePrice(service.price)}
            </p>
          ) : null}
          {isCompact ? (
            <Link
              href={serviceHref}
              aria-label={`View details for ${service.name}`}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-8 rounded-full bg-wine-800 px-3 text-[0.68rem] font-semibold text-cream-50 hover:bg-wine-900",
              )}
            >
              View Details
              <ArrowRight aria-hidden="true" className="size-3" />
            </Link>
          ) : null}
        </div>

        {!isCompact ? (
          <Link
            href={serviceHref}
            aria-label={`View details for ${service.name}`}
            className={cn(
              buttonVariants({ variant: "default" }),
              "mt-auto h-9 w-full rounded-full bg-wine-800 text-xs font-semibold text-cream-50 hover:bg-wine-900",
            )}
          >
            View Details
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        ) : null}
      </div>
    </article>
  )
}
