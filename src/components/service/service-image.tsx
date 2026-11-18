"use client"

import Image from "next/image"
import { useState } from "react"

interface ServiceImageProps {
  sources: readonly string[]
  alt: string
  sizes: string
  className?: string
  priority?: boolean
}

/**
 * Uses the first working image from a service record. MongoDB records can hold
 * several image URLs, and a remote host may later remove one; trying the next
 * source keeps the card usable without changing the stored data.
 */
export function ServiceImage({ sources, alt, sizes, className, priority }: ServiceImageProps) {
  const [failedSources, setFailedSources] = useState<readonly string[]>([])
  const uniqueSources = [...new Set(sources.filter((source) => source.trim().length > 0))]
  const src = uniqueSources.find((source) => !failedSources.includes(source))

  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#fdf3f6_0%,#fae3ea_100%)]"
      >
        <span aria-hidden="true" className="font-heading text-sm text-wine-300">
          WedPlan
        </span>
      </div>
    )
  }

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => {
        setFailedSources((current) =>
          current.includes(src) ? current : [...current, src],
        )
      }}
    />
  )
}
