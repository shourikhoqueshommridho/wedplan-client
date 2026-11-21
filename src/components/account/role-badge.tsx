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

const onDarkStyles: Record<UserRole, string> = {
  customer: "bg-white/10 text-blush-100 border-white/25",
  vendor: "bg-gold-300/20 text-gold-300 border-gold-300/40",
  admin: "bg-white text-burgundy-700 border-white",
}

interface RoleBadgeProps {
  role: UserRole
  /** `onDark` keeps the badge legible on the burgundy dashboard sidebar. */
  tone?: "default" | "onDark"
}

export function RoleBadge({ role, tone = "default" }: RoleBadgeProps) {
  const palette = tone === "onDark" ? onDarkStyles : roleStyles

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] ${palette[role]}`}
    >
      {roleLabels[role]}
    </span>
  )
}
