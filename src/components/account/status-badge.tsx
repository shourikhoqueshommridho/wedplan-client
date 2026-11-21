const statusStyles: Record<string, string> = {
  pending: "border-gold-300/70 bg-gold-300/25 text-wine-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed: "border-wine-200 bg-wine-50 text-wine-700",
  rejected: "border-destructive/20 bg-destructive/5 text-destructive",
  declined: "border-destructive/20 bg-destructive/5 text-destructive",
  cancelled: "border-wine-200 bg-white text-muted-foreground",
  inactive: "border-wine-200 bg-white text-muted-foreground",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  accepted: "Accepted",
  completed: "Completed",
  rejected: "Rejected",
  declined: "Declined",
  cancelled: "Cancelled",
  inactive: "Inactive",
}

interface StatusBadgeProps {
  status: string
  /** Optional display override (e.g. "Active" for an approved service). */
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const normalized = status.trim().toLowerCase()

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] ${
        statusStyles[normalized] ?? statusStyles.pending
      }`}
    >
      {label ?? statusLabels[normalized] ?? status}
    </span>
  )
}
