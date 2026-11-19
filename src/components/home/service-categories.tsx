import Link from "next/link"

import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/home/section-heading"
import { serviceCategories } from "@/data/categories"

export function ServiceCategories() {
  return (
    <section
      aria-labelledby="service-categories-title"
      className="relative overflow-hidden bg-white py-16 sm:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/2 size-64 -translate-y-1/2 rounded-full bg-wine-100/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/3 size-64 rounded-full bg-wine-100/40 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="service-categories-title"
          title="Wedding Service Categories"
          description="Find the perfect service for your big day."
        />

        <ul role="list" className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {serviceCategories.map((category, index) => (
            <li key={category.slug} className="min-w-0">
              <Reveal delay={Math.min(index * 0.04, 0.2)} className="h-full">
                <Link
                  href={category.href}
                  className="group flex h-full min-h-[132px] flex-col items-center justify-center gap-3 rounded-2xl border border-wine-100 bg-wine-50/60 px-3 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-wine-200 hover:bg-white hover:shadow-[0_22px_45px_-32px_rgba(80,16,38,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-white text-wine-700 shadow-sm transition-colors duration-300 group-hover:bg-wine-800 group-hover:text-cream-50">
                    <category.icon aria-hidden="true" className="size-5" strokeWidth={1.7} />
                  </span>
                  <span className="max-w-[11rem] text-[0.82rem] font-semibold leading-snug text-wine-900">
                    {category.name}
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
