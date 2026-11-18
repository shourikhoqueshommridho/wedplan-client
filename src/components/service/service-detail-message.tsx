import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ServiceDetailMessageProps {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}

/** Branded empty/error panel used for invalid links and failed API requests. */
export function ServiceDetailMessage({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
}: ServiceDetailMessageProps) {
  return (
    <section className="mx-auto flex w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="w-full rounded-[2rem] border border-wine-100 bg-white px-6 py-12 text-center shadow-[0_30px_80px_-55px_rgba(80,16,38,0.55)] sm:px-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-wine-50 text-wine-700">
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-wine-500">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-wine-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {children}
          <Link
            href="/services"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 rounded-full border-wine-200 px-6 text-sm font-semibold text-wine-800 hover:bg-wine-50",
            )}
          >
            Browse Services
          </Link>
        </div>
      </div>
    </section>
  )
}
