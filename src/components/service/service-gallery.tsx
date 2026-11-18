"use client"

import { useState } from "react"
import { Heart, Images } from "lucide-react"

import { ServiceImage } from "@/components/service/service-image"
import { cn } from "@/lib/utils"

interface ServiceGalleryProps {
  serviceId: string
  name: string
  categoryLabel: string
  image: {
    src: string
    alt: string
  }
  images: string[]
}

export function ServiceGallery({
  serviceId,
  name,
  categoryLabel,
  image,
  images,
}: ServiceGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const sources = [...new Set([image.src, ...images].filter((source) => source.trim().length > 0))]

  if (sources.length === 0) {
    return (
      <section
        aria-label={`${name} gallery`}
        className="grid aspect-[4/3] place-items-center overflow-hidden rounded-[1.75rem] border border-wine-100 bg-[linear-gradient(145deg,#fffdfa_0%,#fdf3f6_55%,#fae3ea_100%)] text-center"
      >
        <div className="max-w-xs px-6">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-white text-wine-500 shadow-sm">
            <Heart aria-hidden="true" className="size-6" />
          </span>
          <p className="mt-4 font-heading text-2xl font-semibold text-wine-900">Photos coming soon</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {name} has not added gallery images yet.
          </p>
        </div>
      </section>
    )
  }

  const safeIndex = Math.min(activeIndex, sources.length - 1)
  const activeSource = sources[safeIndex]
  const orderedSources = [activeSource, ...sources.filter((_, index) => index !== safeIndex)]

  return (
    <section aria-label={`${name} gallery`}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] border border-wine-100/90 bg-wine-50 shadow-[0_28px_70px_-52px_rgba(80,16,38,0.6)] sm:aspect-[16/10]">
        <ServiceImage
          key={`${serviceId}-${safeIndex}`}
          sources={orderedSources}
          alt={`${image.alt}${sources.length > 1 ? ` — view ${safeIndex + 1}` : ""}`}
          sizes="(min-width: 1440px) 900px, (min-width: 1024px) 62vw, 100vw"
          priority
          className="object-cover"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-[linear-gradient(180deg,rgba(31,10,18,0.32)_0%,rgba(31,10,18,0)_100%)] p-4">
          <span className="rounded-full bg-white/92 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-wine-800 shadow-sm backdrop-blur">
            {categoryLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-wine-900/75 px-3 py-1 text-[0.68rem] font-semibold text-cream-50 backdrop-blur">
            <Images aria-hidden="true" className="size-3.5" />
            {safeIndex + 1} / {sources.length}
          </span>
        </div>
      </div>

      {sources.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2.5 sm:mt-4 sm:gap-3">
          {sources.map((source, index) => (
            <button
              key={`${source}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${sources.length}`}
              aria-pressed={safeIndex === index}
              className={cn(
                "group relative aspect-[4/3] overflow-hidden rounded-xl border-2 bg-wine-50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300 focus-visible:ring-offset-2",
                safeIndex === index
                  ? "border-wine-700 shadow-[0_10px_25px_-18px_rgba(80,16,38,0.6)]"
                  : "border-transparent opacity-75 hover:opacity-100",
              )}
            >
              <ServiceImage
                sources={[source, ...sources]}
                alt={`${name} gallery thumbnail ${index + 1}`}
                sizes="(min-width: 1024px) 160px, 22vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {safeIndex === index ? (
                <span className="absolute inset-x-0 bottom-0 h-1 bg-wine-700" aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
