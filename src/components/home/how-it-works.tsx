import Link from "next/link"
import { ArrowRight, CalendarCheck2, HeartHandshake, Search, type LucideIcon } from "lucide-react"

import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/home/section-heading"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Step {
  title: string
  description: string
  icon: LucideIcon
}

const steps: readonly Step[] = [
  {
    title: "Discover Your Vendors",
    description:
      "Browse six curated categories and compare packages, prices, and verified vendors.",
    icon: Search,
  },
  {
    title: "Request Your Date",
    description:
      "Send a booking request to the vendors you love and keep every conversation in one place.",
    icon: CalendarCheck2,
  },
  {
    title: "Celebrate Together",
    description:
      "Confirm the details, finalise your team, and focus on the day you have been dreaming of.",
    icon: HeartHandshake,
  },
]

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-title"
      className="border-y border-wine-100/70 bg-cream-100 py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="how-it-works-title"
          title="How WedPlan Works"
          description="Three simple steps from first inspiration to your perfect day."
        />

        <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          <div
            aria-hidden="true"
            className="absolute left-[16.6%] right-[16.6%] top-8 hidden border-t border-dashed border-wine-200 md:block"
          />
          {steps.map((step, index) => (
            <li key={step.title} className="relative min-w-0">
              <Reveal delay={index * 0.1} className="h-full">
                <div className="flex h-full flex-col items-center text-center">
                  <span className="relative z-10 grid size-16 place-items-center rounded-full border border-wine-100 bg-white text-wine-700 shadow-[0_16px_35px_-25px_rgba(80,16,38,0.6)]">
                    <step.icon aria-hidden="true" className="size-6" strokeWidth={1.7} />
                    <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-wine-800 text-[0.65rem] font-bold text-cream-50">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-semibold text-wine-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex justify-center">
          <Link
            href="/services"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "group h-11 rounded-full border-wine-200 bg-white px-6 text-xs font-semibold text-wine-800 hover:bg-wine-50",
            )}
          >
            Start Browsing Services
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
