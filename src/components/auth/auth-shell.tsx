import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { Heart } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { AuthNavSwitch } from "@/components/auth/auth-nav-switch"
import { weddingImages } from "@/data/images"

interface AuthShellProps {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

/**
 * Split-screen auth chrome based on the WedPlan reference designs: romantic
 * photography and a script tagline on the left, a cream form card on the right.
 */
export function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-wine-100/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] w-full max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav aria-label="Account navigation" className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-wine-50 hover:text-wine-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
            >
              Home
            </Link>
            <Link
              href="/services"
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-wine-50 hover:text-wine-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
            >
              Browse Services
            </Link>
            <AuthNavSwitch />
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        className="relative overflow-hidden bg-cream-50 pb-10 pt-6 sm:pt-10 lg:pb-14"
      >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 size-80 rounded-full bg-wine-100/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 size-72 rounded-full bg-gold-300/25 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-[1320px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-stretch lg:gap-10 lg:px-8">
        <aside className="relative hidden min-h-[760px] overflow-hidden rounded-[2rem] bg-wine-900 lg:block">
          <Image
            src={weddingImages.hero.src}
            alt={weddingImages.hero.alt}
            fill
            priority
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-wine-900/70 via-wine-900/20 to-wine-900/90" />
          <div className="absolute inset-0 bg-wine-900/15" />

          <div className="relative flex h-full flex-col justify-between p-8 xl:p-10">
            <Logo tone="light" />

            <div className="max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-cream-50 backdrop-blur-sm">
                <Heart aria-hidden="true" className="size-3.5 fill-gold-300 text-gold-300" />
                WedPlan
              </span>

              <p className="mt-6 font-script text-[3.2rem] leading-[0.95] text-cream-50 xl:text-[3.75rem]">
                Every love story
                <br />
                deserves a
                <br />
                beautiful beginning.
              </p>

              <div className="mt-6 h-px w-24 bg-gold-300/80" />

              <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-100/80">
                Thoughtfully curated venues, photographers and artists who make your day feel
                effortlessly yours.
              </p>

              <div className="mt-8 flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-cream-100/70">
                <span className="h-px w-8 bg-cream-100/40" />
                Trusted by couples in 40+ cities
              </div>
            </div>
          </div>
        </aside>

        <section className="flex items-start justify-center lg:items-center">
          <div className="w-full max-w-[560px] rounded-[2rem] border border-wine-100/90 bg-white/85 p-6 shadow-[0_35px_80px_-60px_rgba(79,14,37,0.55)] backdrop-blur-sm sm:p-8 lg:p-9">
            <div className="text-center lg:text-left">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-wine-500">
                {eyebrow}
              </p>
              <h1 className="mt-2.5 font-heading text-[2rem] font-semibold leading-tight text-wine-900 sm:text-[2.35rem]">
                {title}
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
            </div>

            <div className="mt-7">{children}</div>

            <div className="mt-7 border-t border-wine-100 pt-5 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          </div>
        </section>
      </div>

      <div className="relative mx-auto mt-8 flex w-full max-w-[1320px] flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p>© 2026 WedPlan. Made with love for beautiful celebrations.</p>
        <div className="flex items-center gap-4">
          <span>Privacy</span>
          <span aria-hidden="true" className="size-1 rounded-full bg-wine-200" />
          <span>Terms</span>
          <span aria-hidden="true" className="size-1 rounded-full bg-wine-200" />
          <span>Help</span>
        </div>
      </div>
      </main>
    </div>
  )
}
