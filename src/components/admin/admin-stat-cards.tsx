import {
  CreditCard,
  HeartHandshake,
  LayoutGrid,
  Store,
  Users,
  WandSparkles,
  type LucideIcon,
} from "lucide-react"

import type { AdminStats } from "@/lib/admin-dashboard"
import { cn } from "@/lib/utils"

interface StatCard {
  key: keyof AdminStats
  label: string
  icon: LucideIcon
  containerClassName: string
  iconClassName: string
}

const cards: readonly StatCard[] = [
  {
    key: "totalUsers",
    label: "Total Registered Users",
    icon: Users,
    containerClassName: "border-wine-100 bg-[#fdf1f5]",
    iconClassName: "bg-wine-100 text-wine-600",
  },
  {
    key: "totalVendors",
    label: "Total Vendors",
    icon: Store,
    containerClassName: "border-wine-100 bg-white",
    iconClassName: "bg-wine-100 text-wine-700",
  },
  {
    key: "totalCustomers",
    label: "Total Customers",
    icon: HeartHandshake,
    containerClassName: "border-wine-100 bg-white",
    iconClassName: "bg-wine-100 text-wine-600",
  },
  {
    key: "totalServices",
    label: "Total Services",
    icon: LayoutGrid,
    containerClassName: "border-wine-100 bg-white",
    iconClassName: "bg-wine-100 text-wine-600",
  },
  {
    key: "pendingServices",
    label: "Pending Services",
    icon: WandSparkles,
    containerClassName: "border-[#f6e3c3] bg-[#fff8ec]",
    iconClassName: "bg-[#fbe6b8] text-[#c98a16]",
  },
  {
    key: "totalTransactions",
    label: "Total Transactions",
    icon: CreditCard,
    containerClassName: "border-wine-100 bg-white",
    iconClassName: "bg-wine-100 text-wine-700",
  },
]

export function AdminStatCards({ stats }: { stats: AdminStats }) {
  return (
    <section aria-label="Admin statistics">
      <dl className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon
          const value = stats[card.key]

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
                <Icon className="size-[1.35rem]" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <dt className="text-[0.62rem] font-bold uppercase leading-snug tracking-[0.08em] text-wine-900/65">
                  {card.label}
                </dt>
                <dd className="mt-1 font-heading text-[1.65rem] font-semibold leading-none text-wine-900">
                  {value === null ? (
                    <span title="Transaction data is not available from the current API">—</span>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
