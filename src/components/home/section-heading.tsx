import { Heart } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  id?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function SectionHeading({ id, title, description, action, className }: SectionHeadingProps) {
  return (
    <div className={cn("relative flex flex-col items-center gap-5", className)}>
      <div className="mx-auto max-w-2xl text-center">
        <div aria-hidden="true" className="flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-wine-300 sm:w-16" />
          <Heart className="size-3.5 fill-wine-600 text-wine-600" />
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-wine-300 sm:w-16" />
        </div>
        <h2
          id={id}
          className="mt-3 font-heading text-3xl font-semibold tracking-tight text-wine-900 sm:text-4xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 justify-center xl:absolute xl:bottom-1 xl:right-0">{action}</div>
      ) : null}
    </div>
  )
}
