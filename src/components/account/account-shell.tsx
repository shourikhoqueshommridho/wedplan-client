import type { ReactNode } from "react"

import { Footer } from "@/components/home/footer"
import { Navbar } from "@/components/home/navbar"

interface AccountShellProps {
  eyebrow: string
  title: string
  description: string
  badge?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function AccountShell({
  eyebrow,
  title,
  description,
  badge,
  actions,
  children,
}: AccountShellProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cream-50">
      <Navbar />

      <main id="main-content" className="flex-1">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <header className="rounded-[2rem] border border-wine-100 bg-white p-6 shadow-[0_30px_80px_-65px_rgba(79,14,37,0.6)] sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-wine-500">
                  {eyebrow}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="font-heading text-3xl font-semibold text-wine-900 sm:text-4xl">
                    {title}
                  </h1>
                  {badge}
                </div>
                <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
              {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
            </div>
          </header>

          <div className="mt-6">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
