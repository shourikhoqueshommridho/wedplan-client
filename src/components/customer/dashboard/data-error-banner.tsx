"use client"

import { useRouter } from "next/navigation"
import { AlertTriangle, RefreshCw } from "lucide-react"

/** Honest, non-destructive error notice when the bookings API cannot be read. */
export function DataErrorBanner() {
  const router = useRouter()

  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-[#f3d3d6] bg-[#fdf3f4] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2.5 text-xs leading-relaxed text-[#8f2b33]">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          We couldn&apos;t load your booking data, so the figures below may be incomplete. Nothing
          was changed.
        </span>
      </p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-full border border-[#e9bfc4] bg-white px-3.5 text-xs font-semibold text-[#8f2b33] transition-colors hover:bg-white/70 sm:self-auto"
      >
        <RefreshCw aria-hidden="true" className="size-3.5" />
        Try again
      </button>
    </div>
  )
}
