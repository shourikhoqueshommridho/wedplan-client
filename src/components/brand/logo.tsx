import Link from "next/link"
import { Heart } from "lucide-react"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  tone?: "default" | "light"
}

export function Logo({ className, tone = "default" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="WedPlan — home"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-full transition-transform duration-300 group-hover:-rotate-6",
          tone === "light" ? "bg-white/10 text-wine-100" : "bg-wine-50 text-wine-700",
        )}
      >
        <Heart aria-hidden="true" className="size-5" strokeWidth={2} />
      </span>
      <span
        className={cn(
          "font-script text-[1.9rem] leading-none",
          tone === "light" ? "text-cream-50" : "text-wine-800",
        )}
      >
        WedPlan
      </span>
    </Link>
  )
}
