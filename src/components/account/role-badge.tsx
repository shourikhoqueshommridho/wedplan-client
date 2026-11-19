import type { UserRole } from "@/types/auth"

const roleStyles: Record<UserRole, string> = {
  customer: "bg-wine-50 text-wine-700 border-wine-200",
  vendor: "bg-gold-300/25 text-wine-800 border-gold-300/70",
  admin: "bg-wine-800 text-cream-50 border-wine-800",
}

const roleLabels: Record<UserRole, string> = {
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] ${roleStyles[role]}`}
    >
      {roleLabels[role]}
    </span>
  )
}
