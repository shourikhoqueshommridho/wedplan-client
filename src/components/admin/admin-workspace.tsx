"use client"

import { useState } from "react"
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ClipboardList,
  Loader2,
  ShieldCheck,
  Store,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/account/status-badge"
import { RoleBadge } from "@/components/account/role-badge"
import { apiFetch, readApiMessage } from "@/lib/client-api"
import { formatAmount, formatDateOnly } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { AdminService, AdminUser } from "@/types/admin"
import type { Booking } from "@/types/booking"
import type { VendorProfile } from "@/types/vendor"

interface AdminWorkspaceProps {
  users: AdminUser[]
  vendors: VendorProfile[]
  initialServices: AdminService[]
  initialBookings: Booking[]
  dataError: boolean
}

type AdminTab = "users" | "vendors" | "services" | "bookings"

const tabs: { id: AdminTab; label: string; icon: typeof Users }[] = [
  { id: "users", label: "Users", icon: Users },
  { id: "vendors", label: "Vendors", icon: Store },
  { id: "services", label: "Service approval", icon: ClipboardList },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
]

function formatDateTime(value: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export function AdminWorkspace({
  users,
  vendors,
  initialServices,
  initialBookings,
  dataError,
}: AdminWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("users")
  const [services, setServices] = useState<AdminService[]>(initialServices)
  const [bookings] = useState<Booking[]>(initialBookings)
  const [busyServiceId, setBusyServiceId] = useState<string | null>(null)

  const pendingServiceCount = services.filter((service) => service.status === "pending").length
  const activeBookingCount = bookings.filter(
    (booking) => booking.status === "pending" || booking.status === "accepted",
  ).length

  async function reviewService(service: AdminService, status: "approved" | "rejected") {
    if (busyServiceId) return
    setBusyServiceId(service.id)

    try {
      const response = await apiFetch(`/admin/services/${service.id}/approval`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const message = await readApiMessage(response, "The service status could not be updated.")
        toast.error("Review not saved", { description: message })
        return
      }

      setServices((current) =>
        current.map((entry) =>
          entry.id === service.id
            ? { ...entry, status, isActive: status === "approved" }
            : entry,
        ),
      )
      toast.success(`Service ${status}`, {
        description:
          status === "approved"
            ? `${service.name} is now visible to customers.`
            : `${service.name} was rejected and is not publicly visible.`,
      })
    } catch {
      toast.error("Review not saved", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setBusyServiceId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-wine-100 bg-white p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-wine-500">
            Accounts
          </p>
          <p className="mt-2 font-heading text-3xl font-semibold text-wine-900">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-wine-100 bg-white p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-wine-500">
            Vendor profiles
          </p>
          <p className="mt-2 font-heading text-3xl font-semibold text-wine-900">{vendors.length}</p>
        </div>
        <div className="rounded-2xl border border-gold-300/60 bg-cream-50 p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-wine-700">
            Pending services
          </p>
          <p className="mt-2 font-heading text-3xl font-semibold text-wine-900">
            {pendingServiceCount}
          </p>
        </div>
        <div className="rounded-2xl border border-wine-100 bg-white p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-wine-500">
            Active bookings
          </p>
          <p className="mt-2 font-heading text-3xl font-semibold text-wine-900">
            {activeBookingCount}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-wine-100 bg-white px-5 py-4 text-xs leading-relaxed text-foreground/75">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
        <p>
          This dashboard and its APIs are restricted to the Admin role. Roles are read from the
          verified server session, never from a request parameter.
        </p>
      </div>

      {dataError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive"
        >
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">Some admin data could not be loaded.</p>
            <p className="mt-1 text-xs leading-relaxed">
              One or more protected APIs rejected the request. Refresh the page or sign in again.
            </p>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[1.75rem] border border-wine-100 bg-white">
        <div
          role="tablist"
          aria-label="Admin data"
          className="flex gap-1 overflow-x-auto border-b border-wine-100 bg-wine-50/50 p-2"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const count =
              tab.id === "users"
                ? users.length
                : tab.id === "vendors"
                  ? vendors.length
                  : tab.id === "services"
                    ? services.length
                    : bookings.length

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200",
                  isActive
                    ? "bg-white text-wine-900 shadow-sm"
                    : "text-foreground/70 hover:bg-white/70 hover:text-wine-800",
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                {tab.label}
                <span className="rounded-full bg-wine-50 px-1.5 text-[0.65rem] font-bold text-wine-700">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {activeTab === "users" ? (
          <div>
            <div className="flex items-center gap-2 border-b border-wine-100 px-6 py-4">
              <Users aria-hidden="true" className="size-4 text-wine-600" />
              <h2 className="text-sm font-semibold text-wine-900">Registered accounts</h2>
            </div>
            {users.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                No accounts have been created yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-wine-100 bg-wine-50/60 text-[0.65rem] uppercase tracking-[0.12em] text-wine-600">
                      <th scope="col" className="px-6 py-3 font-semibold">Name</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Email</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Role</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wine-100">
                    {users.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-wine-50/40">
                        <td className="px-6 py-3.5 font-semibold text-wine-900">{user.name}</td>
                        <td className="px-6 py-3.5 text-muted-foreground">{user.email}</td>
                        <td className="px-6 py-3.5"><RoleBadge role={user.role} /></td>
                        <td className="px-6 py-3.5 text-muted-foreground">
                          {formatDateTime(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "vendors" ? (
          <div>
            <div className="flex items-center gap-2 border-b border-wine-100 px-6 py-4">
              <Store aria-hidden="true" className="size-4 text-wine-600" />
              <h2 className="text-sm font-semibold text-wine-900">Vendor business profiles</h2>
            </div>
            {vendors.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                No vendor profiles have been created yet.
              </p>
            ) : (
              <ul role="list" className="divide-y divide-wine-100">
                {vendors.map((vendor) => (
                  <li key={vendor.id} className="px-6 py-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="font-heading text-lg font-semibold text-wine-900">
                          {vendor.businessName}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {vendor.category} · {vendor.location}
                        </p>
                        <p className="mt-1 break-all text-xs text-foreground/70">
                          {vendor.contactEmail} · {vendor.phone}
                        </p>
                        <p className="mt-2 max-w-3xl line-clamp-2 text-sm leading-relaxed text-foreground/70">
                          {vendor.description}
                        </p>
                      </div>
                      <div className="shrink-0 text-right text-xs text-muted-foreground">
                        <p>Joined {formatDateTime(vendor.createdAt)}</p>
                        {vendor.website ? (
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-1 inline-flex font-semibold text-wine-700 underline decoration-wine-300 underline-offset-4"
                          >
                            Website
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {activeTab === "services" ? (
          <div>
            <div className="flex items-center justify-between gap-3 border-b border-wine-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <ClipboardList aria-hidden="true" className="size-4 text-wine-600" />
                <h2 className="text-sm font-semibold text-wine-900">Service listings</h2>
              </div>
              <p className="text-xs text-muted-foreground">{pendingServiceCount} awaiting review</p>
            </div>
            {services.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                No services have been submitted yet.
              </p>
            ) : (
              <ul role="list" className="divide-y divide-wine-100">
                {services.map((service) => (
                  <li
                    key={service.id}
                    className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-start lg:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-semibold text-wine-900">
                          {service.name}
                        </h3>
                        <StatusBadge status={service.status} />
                        {!service.isActive && service.status !== "inactive" ? (
                          <StatusBadge status="inactive" />
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {service.vendorName} · {service.category} · {service.location}
                      </p>
                      <p className="mt-2 max-w-2xl line-clamp-2 text-sm leading-relaxed text-foreground/70">
                        {service.description}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-wine-800">
                        {formatAmount(service.price)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => reviewService(service, "approved")}
                        disabled={busyServiceId === service.id || service.status === "approved"}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-wine-800 px-3.5 text-xs font-semibold text-cream-50 transition-colors hover:bg-wine-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busyServiceId === service.id ? (
                          <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                        ) : (
                          <Check aria-hidden="true" className="size-3.5" />
                        )}
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => reviewService(service, "rejected")}
                        disabled={busyServiceId === service.id || service.status === "rejected"}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-destructive/20 bg-white px-3.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X aria-hidden="true" className="size-3.5" />
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {activeTab === "bookings" ? (
          <div>
            <div className="flex items-center gap-2 border-b border-wine-100 px-6 py-4">
              <CalendarDays aria-hidden="true" className="size-4 text-wine-600" />
              <h2 className="text-sm font-semibold text-wine-900">Booking overview</h2>
            </div>
            {bookings.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                No booking requests have been created yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-wine-100 bg-wine-50/60 text-[0.65rem] uppercase tracking-[0.12em] text-wine-600">
                      <th scope="col" className="px-6 py-3 font-semibold">Service</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Customer</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Vendor</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Event date</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wine-100">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="transition-colors hover:bg-wine-50/40">
                        <td className="px-6 py-3.5 font-semibold text-wine-900">
                          {booking.serviceName}
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground">
                          <span className="block text-foreground/80">{booking.customerName}</span>
                          <span className="text-xs">{booking.customerEmail}</span>
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground">{booking.vendorName}</td>
                        <td className="px-6 py-3.5 text-muted-foreground">
                          {formatDateOnly(booking.eventDate)}
                        </td>
                        <td className="px-6 py-3.5"><StatusBadge status={booking.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
