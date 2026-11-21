import {
  CalendarRange,
  CircleCheckBig,
  CircleX,
  Clock3,
  type LucideIcon,
} from "lucide-react"

import type { BookingStats } from "@/lib/customer-dashboard"
import { cn } from "@/lib/utils"

interface StatCard {
  key: keyof BookingStats
  label: string
  icon: LucideIcon
  containerClassName: string
  iconClassName: string
}

const cards: readonly StatCard[] = [
  {
    key: "total",
    label: "Total Booking Requests",
    icon: CalendarRange,
    containerClassName: "border-wine-100 bg-[#fdf1f5]",
    iconClassName: "bg-wine-100 text-wine-700",
  },
  {
    key: "pending",
    label: "Pending Bookings",
    icon: Clock3,
    containerClassName: "border-[#f6e3c3] bg-[#fff8ec]",
    iconClassName: "bg-[#f8e2b8] text-[#a9772a]",
  },
  {
    key: "accepted",
    label: "Accepted Bookings",
    icon: CircleCheckBig,
    containerClassName: "border-emerald-100 bg-[#f1faf3]",
    iconClassName: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "rejected",
    label: "Rejected Bookings",
    icon: CircleX,
    containerClassName: "border-rose-100 bg-[#fdf1f2]",
    iconClassName: "bg-rose-100 text-rose-600",
  },
]

interface BookingStatCardsProps {
  stats: BookingStats
}

export function BookingStatCards({ stats }: BookingStatCardsProps) {
  return (
    <section aria-label="Booking statistics">
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          const value = stats[card.key]

          return (
            <div
              key={card.key}
              className={cn(
                "flex items-center gap-4 rounded-[1.35rem] border p-5 shadow-[0_20px_50px_-42px_rgba(112,19,47,0.65)]",
                card.containerClassName,
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-full shadow-inner",
                  card.iconClassName,
                )}
              >
                <Icon className="size-6" strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <dt className="text-[0.66rem] font-bold uppercase leading-snug tracking-[0.1em] text-wine-900/60">
                  {card.label}
                </dt>
                <dd className="mt-1 font-heading text-3xl font-semibold leading-none text-wine-900">
                  {value}
                </dd>
              </div>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
