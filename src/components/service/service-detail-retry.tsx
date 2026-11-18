"use client"

import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { cn } from "@/lib/utils"

interface ServiceDetailRetryProps {
  className?: string
}

export function ServiceDetailRetry({ className }: ServiceDetailRetryProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wine-800 px-6 text-sm font-semibold text-cream-50 transition-colors hover:bg-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300 disabled:cursor-wait disabled:opacity-70",
        className,
      )}
    >
      <RefreshCw aria-hidden="true" className={cn("size-4", isPending && "animate-spin")} />
      {isPending ? "Retrying…" : "Try Again"}
    </button>
  )
}
