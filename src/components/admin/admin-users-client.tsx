"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  ShieldOff,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { RoleBadge } from "@/components/account/role-badge"
import { ConfirmDialog } from "@/components/vendor/dashboard/confirm-dialog"
import { apiFetch, readApiMessage } from "@/lib/client-api"
import { filterAdminUsers, paginate } from "@/lib/admin-dashboard"
import { initialsFromName } from "@/lib/customer-dashboard"
import { USER_ROLES, type UserRole } from "@/types/auth"
import type { AdminUser } from "@/types/admin"

interface AdminUsersClientProps {
  users: AdminUser[]
  dataError: boolean
  initialSearch: string
  currentUserId: string
}

interface PendingBlock {
  user: AdminUser
  blocked: boolean
}

const PAGE_SIZE = 8

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

function UserDetailsDialog({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!user) return
    closeRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [user, onClose])

  if (!user) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-wine-900/55 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-user-details-title"
        className="relative w-full max-w-md rounded-t-[1.5rem] bg-white p-6 shadow-[0_40px_120px_-30px_rgba(53,19,34,0.7)] sm:rounded-[1.5rem]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close user details"
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-wine-700 hover:bg-wine-50"
        >
          <X aria-hidden="true" className="size-4" />
        </button>

        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-full bg-wine-100 bg-cover bg-center font-heading text-lg font-semibold text-wine-800"
            style={
              user.image
                ? { backgroundImage: `url("${user.image.replace(/"/g, "%22")}")` }
                : undefined
            }
          >
            {user.image ? null : initialsFromName(user.name)}
          </span>
          <div className="min-w-0">
            <h2 id="admin-user-details-title" className="truncate font-heading text-xl font-semibold text-wine-900">
              {user.name}
            </h2>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-wine-100 rounded-xl border border-wine-100">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-xs font-semibold text-muted-foreground">Role</dt>
            <dd><RoleBadge role={user.role} /></dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-xs font-semibold text-muted-foreground">Account status</dt>
            <dd
              className={
                user.blocked
                  ? "text-xs font-semibold text-destructive"
                  : "text-xs font-semibold text-emerald-700"
              }
            >
              {user.blocked ? "Blocked" : "Active"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-xs font-semibold text-muted-foreground">Joined</dt>
            <dd className="text-xs font-semibold text-wine-900">{formatDateTime(user.createdAt)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-xs font-semibold text-muted-foreground">User ID</dt>
            <dd className="max-w-[60%] truncate text-xs text-wine-900" title={user.id}>
              {user.id}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-[0.7rem] leading-relaxed text-muted-foreground">
          Account status and role are managed by the server. No client-supplied role is ever
          trusted.
        </p>
      </div>
    </div>
  )
}

export function AdminUsersClient({
  users,
  dataError,
  initialSearch,
  currentUserId,
}: AdminUsersClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [role, setRole] = useState<UserRole | "all">("all")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [overrides, setOverrides] = useState<Record<string, AdminUser>>({})
  const [pendingBlock, setPendingBlock] = useState<PendingBlock | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const items = users.map((user) => overrides[user.id] ?? user)
  const filtered = filterAdminUsers(items, { search, role })
  const result = paginate(filtered, page, PAGE_SIZE)

  async function confirmBlock() {
    if (!pendingBlock) return
    const { user, blocked } = pendingBlock
    setPendingBlock(null)
    setBusyId(user.id)

    try {
      const response = await apiFetch(
        `/admin/users/${user.id}/${blocked ? "block" : "unblock"}`,
        { method: "PATCH" },
      )

      if (!response.ok) {
        const message = await readApiMessage(response, "The account status could not be updated.")
        toast.error("Status not updated", { description: message })
        return
      }

      setOverrides((current) => ({
        ...current,
        [user.id]: { ...user, blocked },
      }))
      toast.success(blocked ? "User blocked" : "User unblocked", {
        description: `${user.name} is now ${blocked ? "blocked" : "active"}.`,
      })
      router.refresh()
    } catch {
      toast.error("Status not updated", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setBusyId(null)
    }
  }

  function updateSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function clearFilters() {
    setSearch("")
    setRole("all")
    setPage(1)
  }

  return (
    <div className="space-y-5">
      {dataError ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive"
        >
          Accounts could not be loaded. Refresh the page or sign in again.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[1.15rem] border border-wine-100 bg-white shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]">
        <div className="flex flex-col gap-3 border-b border-wine-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-xl font-semibold text-wine-900">Manage Users</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {filtered.length} of {items.length} accounts
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-wine-400"
              />
              <label className="sr-only" htmlFor="admin-users-search">Search users</label>
              <input
                id="admin-users-search"
                type="search"
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search name or email..."
                className="h-10 w-full rounded-full border border-wine-100 bg-white pl-10 pr-4 text-sm outline-none focus:border-wine-300 focus:ring-2 focus:ring-wine-100 sm:w-[260px]"
              />
            </div>
            <label className="sr-only" htmlFor="admin-users-role">Filter by role</label>
            <select
              id="admin-users-role"
              value={role}
              onChange={(event) => {
                setRole(event.target.value as UserRole | "all")
                setPage(1)
              }}
              className="h-10 rounded-full border border-wine-100 bg-white px-4 text-sm text-wine-800 outline-none focus:ring-2 focus:ring-wine-200"
            >
              <option value="all">All roles</option>
              {USER_ROLES.map((item) => (
                <option key={item} value={item}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>
            {search || role !== "all" ? (
              <button
                type="button"
                onClick={clearFilters}
                className="h-10 rounded-full border border-wine-200 bg-white px-4 text-xs font-semibold text-wine-800 hover:bg-wine-50"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {result.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-wine-50 text-wine-600">
              <UserRound aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-3 font-heading text-lg font-semibold text-wine-900">
              {dataError ? "Accounts unavailable" : items.length === 0 ? "No accounts yet" : "No matching users"}
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              {dataError
                ? "Refresh the page or sign in again."
                : items.length === 0
                  ? "Registered accounts will appear here."
                  : "Try a different search or role filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#fdf1f5] text-[0.62rem] uppercase tracking-[0.11em] text-wine-700">
                  <th scope="col" className="px-5 py-2.5 font-bold">Name</th>
                  <th scope="col" className="px-5 py-2.5 font-bold">Email</th>
                  <th scope="col" className="px-5 py-2.5 font-bold">Role</th>
                  <th scope="col" className="px-5 py-2.5 font-bold">Status</th>
                  <th scope="col" className="px-5 py-2.5 font-bold">Joined</th>
                  <th scope="col" className="px-5 py-2.5 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wine-100">
                {result.items.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-wine-50/40">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className="grid size-9 shrink-0 place-items-center rounded-full bg-wine-100 bg-cover bg-center text-[0.65rem] font-bold text-wine-800"
                          style={
                            user.image
                              ? { backgroundImage: `url("${user.image.replace(/"/g, "%22")}")` }
                              : undefined
                          }
                        >
                          {user.image ? null : initialsFromName(user.name)}
                        </span>
                        <span className="font-semibold text-wine-900">{user.name}</span>
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-3 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-5 py-3"><RoleBadge role={user.role} /></td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          user.blocked
                            ? "inline-flex items-center rounded-full border border-destructive/20 bg-destructive/5 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-destructive"
                            : "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-emerald-700"
                        }
                      >
                        {user.blocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(user)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-wine-200 bg-white px-3 text-xs font-semibold text-wine-800 hover:bg-wine-50"
                      >
                        <UserRound aria-hidden="true" className="size-3" />
                        View
                      </button>
                      {user.id !== currentUserId ? (
                        <button
                          type="button"
                          onClick={() => setPendingBlock({ user, blocked: !user.blocked })}
                          disabled={busyId === user.id}
                          className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold disabled:opacity-50 ${
                            user.blocked
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10"
                          }`}
                        >
                          {user.blocked ? (
                            <ShieldCheck aria-hidden="true" className="size-3" />
                          ) : (
                            <ShieldOff aria-hidden="true" className="size-3" />
                          )}
                          {user.blocked ? "Unblock" : "Block"}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result.totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-wine-100 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Page {result.page} of {result.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={result.page === 1}
                className="grid size-9 place-items-center rounded-full border border-wine-200 bg-white text-wine-800 hover:bg-wine-50 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(result.totalPages, current + 1))}
                disabled={result.page === result.totalPages}
                className="grid size-9 place-items-center rounded-full border border-wine-200 bg-white text-wine-800 hover:bg-wine-50 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <UserDetailsDialog user={selected} onClose={() => setSelected(null)} />

      <ConfirmDialog
        open={pendingBlock !== null}
        title={pendingBlock?.blocked ? "Block this user?" : "Unblock this user?"}
        description={
          pendingBlock
            ? pendingBlock.blocked
              ? `"${pendingBlock.user.name}" will lose access to protected WedPlan features until unblocked.`
              : `"${pendingBlock.user.name}" will regain access to protected WedPlan features.`
            : ""
        }
        confirmLabel={pendingBlock?.blocked ? "Block" : "Unblock"}
        tone={pendingBlock?.blocked ? "destructive" : "default"}
        busy={busyId !== null}
        onConfirm={() => void confirmBlock()}
        onCancel={() => setPendingBlock(null)}
      />
    </div>
  )
}
