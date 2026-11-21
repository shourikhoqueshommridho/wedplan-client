import type { Metadata } from "next"
import { CreditCard, Info } from "lucide-react"

import { requireServerRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Transactions - Admin Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function AdminTransactionsPage() {
  await requireServerRole("admin", "/dashboard/admin/transactions")

  return (
    <div className="space-y-5">
      <section className="rounded-[1.15rem] border border-wine-100 bg-white p-6 shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-wine-50 text-wine-700">
            <CreditCard aria-hidden="true" className="size-[1.05rem]" />
          </span>
          <div>
            <h1 className="font-heading text-xl font-semibold text-wine-900">Transactions</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Payment records for the WedPlan platform
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center rounded-[1.1rem] border border-dashed border-wine-200 bg-blush-50/60 px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-white text-wine-600 shadow-sm">
            <CreditCard aria-hidden="true" className="size-6" />
          </span>
          <p className="mt-4 font-heading text-xl font-semibold text-wine-900">
            No transactions recorded
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            WedPlan does not yet store transaction records, so there are no IDs, plans, amounts,
            payment statuses or revenue figures to display. This page will populate automatically
            once a transaction API is connected.
          </p>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-gold-300/60 bg-cream-50 px-4 py-3 text-xs leading-relaxed text-foreground/75">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
          <span>
            No sample or estimated payment data is shown. Booking totals remain available in the
            overview analytics, which are derived from real booking records.
          </span>
        </div>
      </section>
    </div>
  )
}
