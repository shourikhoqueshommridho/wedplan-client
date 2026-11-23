import Link from "next/link"
import {
  BriefcaseBusiness,
  CircleCheckBig,
  Clock3,
  Crown,
  type LucideIcon,
} from "lucide-react"

import type { VendorStats } from "@/lib/vendor-dashboard"
import { cn } from "@/lib/utils"

interface StatCard {
  key: "totalServices" | "activeServices" | "pendingBookings" | "acceptedBookings"
  label: string
  icon: LucideIcon
  containerClassName: string
  iconClassName: string
}

const cards: readonly StatCard[] = [
  {
    key: "totalServices",
    label: "Total Services",
    icon: BriefcaseBusiness,
    containerClassName: "border-wine-100 bg-[#fdf1f5]",
    iconClassName: "bg-wine-100 text-wine-600",
  },
  {
    key: "activeServices",
    label: "Active Services",
    icon: CircleCheckBig,
    containerClassName: "border-emerald-100 bg-[#f2faf4]",
    iconClassName: "bg-emerald-100 text-emerald-600",
  },
  {
    key: "pendingBookings",
    label: "Pending Bookings",
    icon: Clock3,
    containerClassName: "border-[#f6e3c3] bg-[#fff8ec]",
    iconClassName: "bg-[#fbe6b8] text-[#c98a16]",
  },
  {
    key: "acceptedBookings",
    label: "Accepted Bookings",
    icon: CircleCheckBig,
    containerClassName: "border-[#e6ddf6] bg-[#f6f2fc]",
    iconClassName: "bg-[#e7dcf8] text-[#7c57bd]",
  },
]

interface VendorStatCardsProps {
  stats: VendorStats
  /** Server-confirmed effective plan; a Premium vendor has no upgrade card. */
  isPremium?: boolean
}

export function VendorStatCards({ stats, isPremium = false }: VendorStatCardsProps) {
  return (
    <section aria-label="Vendor statistics">
      <dl
        className={cn(
          "grid grid-cols-1 gap-3.5 sm:grid-cols-2",
          isPremium ? "lg:grid-cols-4" : "lg:grid-cols-5",
        )}
      >
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.key}
              className={cn(
                "flex items-center gap-3 rounded-[1.1rem] border p-4 shadow-[0_14px_35px_-30px_rgba(112,19,47,0.55)]",
                card.containerClassName,
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-full shadow-inner",
                  card.iconClassName,
                )}
              >
                <Icon className="size-[1.35rem]" strokeWidth={2.1} />
              </span>
              <div className="min-w-0">
                <dt className="text-[0.62rem] font-bold uppercase leading-snug tracking-[0.09em] text-wine-900/65">
                  {card.label}
                </dt>
                <dd className="mt-1 font-heading text-[1.75rem] font-semibold leading-none text-wine-900">
                  {stats[card.key]}
                </dd>
              </div>
            </div>
          )
        })}

        {!isPremium ? (
          <div className="flex items-center gap-3 rounded-[1.1rem] border border-wine-100 bg-[linear-gradient(110deg,#fdeef4_0%,#fbe0e9_100%)] p-4 shadow-[0_14px_35px_-30px_rgba(112,19,47,0.55)]">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-white/80 text-gold-500 shadow-inner"
            >
              <Crown className="size-[1.35rem]" strokeWidth={2.1} />
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-[0.62rem] font-bold uppercase leading-snug tracking-[0.09em] text-wine-900/65">
                Current Plan
              </dt>
              <dd className="mt-1 font-heading text-xl font-semibold leading-none text-wine-900">
                Free Plan
              </dd>
            </div>
            <Link
              href="/dashboard/vendor/subscription"
              className="inline-flex h-8 shrink-0 items-center rounded-full border border-wine-200 bg-white px-3 text-[0.7rem] font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
            >
              Upgrade
            </Link>
          </div>
        ) : null}
      </dl>
    </section>
  )
}
