"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { ArrowRight, Diamond, Heart, Star, Store } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { weddingImages } from "@/data/images"
import { EASE_OUT } from "@/lib/motion"
import { cn } from "@/lib/utils"

const heroStats = [
  { value: "10K+", label: "Happy Couples", icon: Diamond },
  { value: "500+", label: "Trusted Vendors", icon: Store },
  { value: "4.9/5", label: "Excellent Rating", icon: Star },
] as const

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

export function Hero() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-[linear-gradient(112deg,#fdf1f4_0%,#fbe7ed_48%,#fdf6f1_100%)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-8 size-72 rounded-full bg-wine-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-gold-300/25 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.02fr_1.3fr] lg:gap-8 lg:px-8 lg:py-16">
        <motion.div
          variants={containerVariants}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="show"
          className="flex flex-col justify-center"
        >
          <motion.p
            variants={itemVariants}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-wine-100 bg-white/80 px-4 py-1.5 text-xs font-semibold text-wine-700 shadow-[0_10px_25px_-20px_rgba(80,16,38,0.6)]"
          >
            <Heart aria-hidden="true" className="size-3 fill-wine-600 text-wine-600" />
            Your Dream Wedding Partner
          </motion.p>

          <motion.h1
            id="hero-title"
            variants={itemVariants}
            className="mt-5 font-heading text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-wine-900 sm:text-5xl xl:text-6xl"
          >
            Your Dream Wedding,
            <span className="mt-1 block italic text-wine-700">
              Our Priority{" "}
              <Heart
                aria-hidden="true"
                className="mb-1 inline size-6 fill-wine-600 text-wine-600 sm:size-8"
              />
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-md text-base leading-relaxed text-foreground/70 sm:text-lg"
          >
            Discover amazing wedding services from the best vendors, and make your special day
            truly unforgettable.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8">
            <Link
              href="/services"
              className={cn(
                buttonVariants({ variant: "default" }),
                "group h-12 rounded-full bg-wine-800 px-6 text-sm font-semibold text-cream-50 shadow-[0_18px_35px_-22px_rgba(80,16,38,0.9)] hover:bg-wine-900",
              )}
            >
              Explore Wedding Services
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>

          <motion.p variants={itemVariants} className="mt-6 text-xs text-muted-foreground">
            Free to browse · Verified vendors · Secure booking
          </motion.p>
        </motion.div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-2 hidden rounded-[2rem] border border-wine-200/60 lg:block"
          />
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-wine-100 shadow-[0_35px_70px_-45px_rgba(80,16,38,0.7)] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[560px]">
            <Image
              src={weddingImages.hero.src}
              alt={weddingImages.hero.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 56vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-tr from-wine-900/25 via-transparent to-transparent"
            />
          </div>

          <ul className="relative z-10 mx-4 -mt-14 grid grid-cols-3 gap-1 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-[0_24px_55px_-35px_rgba(80,16,38,0.6)] backdrop-blur-md sm:mx-8 lg:absolute lg:bottom-6 lg:right-6 lg:mx-0 lg:mt-0 lg:w-60 lg:grid-cols-1 lg:gap-3 lg:p-4">
            {heroStats.map((stat) => (
              <li
                key={stat.label}
                className="flex flex-col items-center gap-1 text-center lg:flex-row lg:gap-3 lg:text-left"
              >
                <span className="grid size-9 place-items-center rounded-full bg-wine-50 text-wine-700">
                  <stat.icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight text-wine-900">
                    {stat.value}
                  </span>
                  <span className="block text-[0.62rem] leading-tight text-muted-foreground sm:text-[0.7rem]">
                    {stat.label}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
