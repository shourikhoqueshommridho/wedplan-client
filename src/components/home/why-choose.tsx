import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { Reveal } from "@/components/motion/reveal"
import { buttonVariants } from "@/components/ui/button"
import { weddingImages } from "@/data/images"
import { cn } from "@/lib/utils"

const benefits = [
  {
    title: "Trusted & Verified Vendors",
    description: "Every partner is reviewed before going live.",
  },
  {
    title: "Secure & Easy Booking",
    description: "Request dates and manage details online.",
  },
  {
    title: "Premium Support",
    description: "A real team is here whenever you need us.",
  },
  {
    title: "Best Price Guarantee",
    description: "Clear packages with no hidden surprises.",
  },
] as const

export function WhyChoose() {
  return (
    <section aria-labelledby="why-choose-title" className="bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-wine-100 bg-[linear-gradient(105deg,#fbe9ee_0%,#fdf4f2_55%,#f7dfe4_100%)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-white/40 blur-3xl"
            />

            <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.05fr_1.2fr_0.85fr] lg:items-center lg:gap-10 lg:p-12">
              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-wine-600">
                  Our Promise
                </p>
                <h2
                  id="why-choose-title"
                  className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-tight text-wine-900 sm:text-4xl"
                >
                  Why Choose <span className="italic text-wine-700">WedPlan?</span>
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-foreground/65 sm:text-base">
                  Your trusted partner for the perfect wedding, from the first idea to the final
                  dance.
                </p>
              </div>

              <div className="min-w-0">
                <ul role="list" className="grid gap-2.5 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <li
                      key={benefit.title}
                      className="flex items-start gap-2.5 rounded-xl bg-white/60 p-3 ring-1 ring-white/70"
                    >
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-wine-800 text-cream-50">
                        <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold leading-snug text-wine-900">
                          {benefit.title}
                        </span>
                        <span className="mt-0.5 block text-[0.7rem] leading-snug text-foreground/60">
                          {benefit.description}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/services"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "group mt-5 h-11 w-full rounded-full bg-wine-800 px-5 text-xs font-semibold text-cream-50 hover:bg-wine-900 sm:w-auto",
                  )}
                >
                  Start Planning Today
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              <div className="relative h-56 w-full overflow-hidden rounded-2xl sm:h-72 lg:h-[320px]">
                <Image
                  src={weddingImages.rings.src}
                  alt={weddingImages.rings.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 28vw"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-wine-900/20 via-transparent to-transparent"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
