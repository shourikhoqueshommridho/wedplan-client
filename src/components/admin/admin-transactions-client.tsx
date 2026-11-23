"use client"

import { AlertCircle, CreditCard } from "lucide-react"

import {
  formatTransactionAmount,
  formatTransactionDate,
} from "@/lib/admin-transactions"
import type { AdminTransaction } from "@/types/admin"

interface AdminTransactionsClientProps {
  transactions: AdminTransaction[]
  dataError: boolean
}

function statusClasses(status: string): string {
  const normalized = status.toLowerCase()
  if (normalized === "paid") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (normalized === "failed") return "border-destructive/20 bg-destructive/5 text-destructive"
  return "border-gold-300/70 bg-gold-300/25 text-wine-800"
}

export function AdminTransactionsClient({
  transactions,
  dataError,
}: AdminTransactionsClientProps) {
  return (
    <div className="space-y-5">
      {dataError ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>Transactions could not be loaded. Refresh the page or sign in again.</span>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[1.15rem] border border-wine-100 bg-white shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]">
        <div className="border-b border-wine-100 px-5 py-4">
          <h1 className="font-heading text-xl font-semibold text-wine-900">Transactions</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Verified Stripe payment records for the WedPlan platform
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-wine-50 text-wine-600">
              <CreditCard aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-3 font-heading text-lg font-semibold text-wine-900">
              {dataError ? "Transactions unavailable" : "No transactions recorded"}
            </p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
              {dataError
                ? "Refresh the page or sign in again."
                : "Completed Stripe payments will appear here automatically. No sample data is shown."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#fdf1f5] text-[0.62rem] uppercase tracking-[0.11em] text-wine-700">
                  <th scope="col" className="px-4 py-2.5 font-bold">Vendor</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">Plan</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">Amount</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">Payment status</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">Transaction date</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">Stripe reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wine-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="transition-colors hover:bg-wine-50/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-wine-900">{transaction.vendorName}</p>
                      <p className="max-w-[180px] truncate text-[0.65rem] text-muted-foreground" title={transaction.vendorId}>
                        {transaction.vendorId}
                      </p>
                    </td>
                    <td className="px-4 py-3 capitalize text-wine-800">{transaction.plan}</td>
                    <td className="px-4 py-3 font-semibold text-wine-800">
                      {formatTransactionAmount(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] ${statusClasses(transaction.status)}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatTransactionDate(transaction.createdAt)}
                    </td>
                    <td className="max-w-[190px] truncate px-4 py-3 text-[0.65rem] text-muted-foreground" title={transaction.stripeSubscriptionId ?? transaction.stripeSessionId ?? ""}>
                      {transaction.stripeSubscriptionId ?? transaction.stripeSessionId ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Payment records are read-only. Stripe webhooks are the only source of truth for payment
        status; no manual success updates are available.
      </p>
    </div>
  )
}
