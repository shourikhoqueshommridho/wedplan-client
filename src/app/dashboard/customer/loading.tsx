export default function CustomerDashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your dashboard…</span>

      <div className="h-56 animate-pulse rounded-[1.75rem] border border-wine-100 bg-blush-100/60 sm:h-64" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["total", "pending", "accepted", "rejected"].map((key) => (
          <div
            key={key}
            className="h-[100px] animate-pulse rounded-[1.35rem] border border-wine-100 bg-white"
          />
        ))}
      </div>

      <div className="h-80 animate-pulse rounded-[1.5rem] border border-wine-100 bg-white" />

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="h-52 animate-pulse rounded-[1.5rem] border border-wine-100 bg-white" />
        <div className="h-52 animate-pulse rounded-[1.5rem] border border-wine-100 bg-white" />
      </div>
    </div>
  )
}
