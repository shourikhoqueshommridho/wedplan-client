"use client"

import Link from "next/link"
import {
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react"

import { RoleBadge } from "@/components/account/role-badge"
import { StatusBadge } from "@/components/account/status-badge"
import { AdminAnalytics } from "@/components/admin/admin-analytics"
import { useAdminServiceReview } from "@/components/admin/use-admin-service-review"
import { weddingImages } from "@/data/images"
import {
  formatTransactionAmount,
  formatTransactionDate,
} from "@/lib/admin-transactions"
import { initialsFromName } from "@/lib/customer-dashboard"
import { formatAmount } from "@/lib/format"
import type { AdminService, AdminTransaction, AdminUser } from "@/types/admin"
import type { Booking } from "@/types/booking"

interface AdminOverviewPanelsProps {
  users: AdminUser[]
  services: AdminService[]
  bookings: Booking[]
  transactions: AdminTransaction[]
  now: string
  dataError: boolean
}

const panelClass =
  "flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-wine-100 bg-white shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]"

const headerClass =
  "flex items-center justify-between gap-3 border-b border-wine-100 px-5 py-3.5"

const viewAllClass =
  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-wine-200 bg-white px-3.5 text-[0.7rem] font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"

function avatarStyle(image: string | null): { backgroundImage: string } | undefined {
  if (!image) return undefined
  return { backgroundImage: `url("${image.replace(/"/g, "%22")}")` }
}

export function AdminOverviewPanels({
  users,
  services,
  bookings,
  transactions,
  now,
  dataError,
}: AdminOverviewPanelsProps) {
  const { busyId, review } = useAdminServiceReview()
  const pendingServices = services.filter((service) => service.status === "pending")
  const nextReview = pendingServices[0] ?? null

  async function handleReview(service: AdminService, status: "approved" | "rejected") {
    await review(service, status)
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Manage users */}
        <section aria-labelledby="admin-users-title" className={panelClass}>
          <div className={headerClass}>
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wine-50 text-wine-700">
                <Users aria-hidden="true" className="size-[1.05rem]" />
              </span>
              <h2 id="admin-users-title" className="font-heading text-xl font-semibold text-wine-900">
                Manage Users
              </h2>
            </div>
            <Link href="/dashboard/admin/users" className={viewAllClass}>
              View All
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>

          {users.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              {dataError ? "Accounts could not be loaded." : "No accounts have been created yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#fdf1f5] text-[0.62rem] uppercase tracking-[0.11em] text-wine-700">
                    <th scope="col" className="px-4 py-2.5 font-bold">Name</th>
                    <th scope="col" className="px-4 py-2.5 font-bold">Email</th>
                    <th scope="col" className="px-4 py-2.5 font-bold">Role</th>
                    <th scope="col" className="px-4 py-2.5 font-bold">Status</th>
                    <th scope="col" className="px-4 py-2.5 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wine-100">
                  {users.slice(0, 4).map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-wine-50/40">
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="grid size-8 shrink-0 place-items-center rounded-full bg-wine-100 bg-cover bg-center text-[0.6rem] font-bold text-wine-800"
                            style={avatarStyle(user.image)}
                          >
                            {user.image ? null : initialsFromName(user.name)}
                          </span>
                          <span className="truncate font-semibold text-wine-900">{user.name}</span>
                        </span>
                      </td>
                      <td className="max-w-[160px] truncate px-4 py-2.5 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-4 py-2.5"><RoleBadge role={user.role} /></td>
                      <td className="px-4 py-2.5">
                        <span
                          className={
                            user.blocked
                              ? "inline-flex items-center rounded-full border border-destructive/20 bg-destructive/5 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-destructive"
                              : "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-emerald-700"
                          }
                        >
                          {user.blocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/dashboard/admin/users?search=${encodeURIComponent(user.email)}`}
                          className="text-xs font-semibold text-wine-700 underline decoration-wine-300 underline-offset-4"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Manage services */}
        <section aria-labelledby="admin-services-title" className={panelClass}>
          <div className={headerClass}>
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wine-50 text-wine-700">
                <ShieldCheck aria-hidden="true" className="size-[1.05rem]" />
              </span>
              <h2 id="admin-services-title" className="font-heading text-xl font-semibold text-wine-900">
                Manage Services
              </h2>
            </div>
            <Link href="/dashboard/admin/services" className={viewAllClass}>
              View All
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>

          {services.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              {dataError ? "Services could not be loaded." : "No services have been submitted yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#fdf1f5] text-[0.62rem] uppercase tracking-[0.11em] text-wine-700">
                    <th scope="col" className="px-4 py-2.5 font-bold">Image</th>
                    <th scope="col" className="px-4 py-2.5 font-bold">Service Name</th>
                    <th scope="col" className="px-4 py-2.5 font-bold">Vendor</th>
                    <th scope="col" className="px-4 py-2.5 font-bold">Category</th>
                    <th scope="col" className="px-4 py-2.5 font-bold">Price</th>
                    <th scope="col" className="px-4 py-2.5 font-bold">Status</th>
                    <th scope="col" className="px-4 py-2.5 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wine-100">
                  {services.slice(0, 4).map((service) => (
                    <tr key={service.id} className="transition-colors hover:bg-wine-50/40">
                      <td className="px-4 py-2.5">
                        <span
                          aria-hidden="true"
                          className="block size-9 rounded-lg border border-wine-100 bg-wine-50 bg-cover bg-center"
                          style={
                            service.images[0]
                              ? { backgroundImage: `url("${service.images[0].replace(/"/g, "%22")}")` }
                              : undefined
                          }
                        />
                      </td>
                      <td className="max-w-[150px] px-4 py-2.5 font-semibold text-wine-900">
                        <span className="line-clamp-2">{service.name}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{service.vendorName}</td>
                      <td className="px-4 py-2.5">
                        <span className="rounded-full bg-wine-50 px-2 py-0.5 text-[0.62rem] font-semibold text-wine-700">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-wine-800">
                        {formatAmount(service.price, "USD")}
                      </td>
                      <td className="px-4 py-2.5"><StatusBadge status={service.status} /></td>
                      <td className="px-4 py-2.5">
                        {service.status === "pending" ? (
                          <span className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => void handleReview(service, "approved")}
                              disabled={busyId === service.id}
                              className="inline-flex h-8 items-center rounded-full bg-burgundy-600 px-3 text-[0.65rem] font-semibold text-white transition-colors hover:bg-burgundy-700 disabled:opacity-50"
                            >
                              {busyId === service.id ? (
                                <Loader2 aria-hidden="true" className="size-3 animate-spin" />
                              ) : (
                                "Approve"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleReview(service, "rejected")}
                              disabled={busyId === service.id}
                              className="inline-flex h-8 items-center rounded-full border border-wine-200 bg-white px-3 text-[0.65rem] font-semibold text-wine-800 transition-colors hover:bg-wine-50 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </span>
                        ) : (
                          <Link
                            href={`/dashboard/admin/services?service=${service.id}`}
                            className="text-xs font-semibold text-wine-700 underline decoration-wine-300 underline-offset-4"
                          >
                            Details
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_1.1fr_0.9fr]">
        {/* Recent transactions from verified Stripe records */}
        <section aria-labelledby="admin-transactions-title" className={panelClass}>
          <div className={headerClass}>
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wine-50 text-wine-700">
                <CreditCard aria-hidden="true" className="size-[1.05rem]" />
              </span>
              <h2 id="admin-transactions-title" className="font-heading text-xl font-semibold text-wine-900">
                Recent Transactions
              </h2>
            </div>
            <Link href="/dashboard/admin/transactions" className={viewAllClass}>
              View All
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-wine-50 text-wine-600">
                <CreditCard aria-hidden="true" className="size-5" />
              </span>
              <p className="mt-3 font-heading text-lg font-semibold text-wine-900">
                {dataError ? "Transactions unavailable" : "No transactions recorded"}
              </p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                {dataError
                  ? "Refresh the page or sign in again."
                  : "Verified Stripe payments will appear here automatically."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-wine-100">
              {transactions.slice(0, 4).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-wine-900">
                      {transaction.vendorName}
                    </p>
                    <p className="text-[0.65rem] text-muted-foreground">
                      {formatTransactionDate(transaction.createdAt)}
                      <span className="mx-1.5">·</span>
                      <span
                        className={
                          transaction.status === "paid"
                            ? "text-emerald-700"
                            : "text-wine-700"
                        }
                      >
                        {transaction.status}
                      </span>
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-wine-800">
                    {formatTransactionAmount(transaction.amount, transaction.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <AdminAnalytics bookings={bookings} now={now} totalBookings={bookings.length} />

        {/* Pending service review */}
        <section
          aria-labelledby="admin-review-title"
          className="relative flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-wine-100 bg-[linear-gradient(135deg,#fff1f6_0%,#fbdce9_100%)] p-5 shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url("${weddingImages.floral.src}")` }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,241,246,0.92)_0%,rgba(255,241,246,0.7)_70%,rgba(255,241,246,0.55)_100%)]"
          />
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/80 text-wine-700">
                <ShieldCheck aria-hidden="true" className="size-[1.05rem]" />
              </span>
              <h2 id="admin-review-title" className="font-heading text-lg font-semibold text-wine-900">
                Pending Service Review
              </h2>
            </div>
            <Link href="/dashboard/admin/services?status=pending" className={viewAllClass}>
              View All
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>

          {nextReview ? (
            <div className="relative mt-5 flex flex-1 flex-col">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="size-16 shrink-0 rounded-xl border border-white/70 bg-white/70 bg-cover bg-center"
                  style={
                    nextReview.images[0]
                      ? { backgroundImage: `url("${nextReview.images[0].replace(/"/g, "%22")}")` }
                      : undefined
                  }
                />
                <div className="min-w-0">
                  <p className="font-heading text-base font-semibold leading-snug text-wine-900">
                    {nextReview.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">by {nextReview.vendorName}</p>
                  <p className="mt-1 font-heading text-lg font-semibold text-wine-800">
                    {formatAmount(nextReview.price, "USD")}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/admin/services?service=${nextReview.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-burgundy-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-burgundy-700"
                >
                  <Check aria-hidden="true" className="size-3.5" />
                  Review
                </Link>
                <button
                  type="button"
                  onClick={() => void handleReview(nextReview, "rejected")}
                  disabled={busyId === nextReview.id}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-wine-200 bg-white px-4 text-xs font-semibold text-wine-800 transition-colors hover:bg-wine-50 disabled:opacity-50"
                >
                  {busyId === nextReview.id ? (
                    <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                  ) : (
                    <X aria-hidden="true" className="size-3.5" />
                  )}
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="relative mt-5 flex flex-1 items-center">
              <p className="text-sm text-wine-900/75">Every submitted service has been reviewed.</p>
            </div>
          )}

          <p className="relative mt-5 font-script text-[1.35rem] leading-snug text-wine-800">
            “Together, we make weddings more special”
          </p>
          <span className="relative mt-1 text-wine-400" aria-hidden="true">
            ♡
          </span>
        </section>
      </div>
    </div>
  )
}
