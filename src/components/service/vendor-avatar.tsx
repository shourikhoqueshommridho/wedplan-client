"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface VendorAvatarProps {
  name: string
  initials: string
  image?: string
  className?: string
}

/** Vendor avatar with an initials fallback when the remote image fails. */
export function VendorAvatar({ name, initials, image, className }: VendorAvatarProps) {
  const [failed, setFailed] = useState(false)

  if (!image || failed) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-full bg-wine-100 text-sm font-bold text-wine-800 ring-4 ring-white",
          className,
        )}
      >
        {initials}
      </span>
    )
  }

  return (
    <Image
      src={image}
      alt={`${name} profile`}
      width={56}
      height={56}
      onError={() => setFailed(true)}
      className={cn("size-14 shrink-0 rounded-full object-cover ring-4 ring-white", className)}
    />
  )
}
