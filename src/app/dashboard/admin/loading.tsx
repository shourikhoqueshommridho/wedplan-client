export default function AdminDashboardLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading admin dashboard…</span>
      <div className="h-52 animate-pulse rounded-[1.25rem] border border-wine-100 bg-blush-100/60 sm:h-60" />
      <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {["users", "vendors", "customers", "services", "pending", "transactions"].map((key) => (
          <div
            key={key}
            className="h-[92px] animate-pulse rounded-[1.1rem] border border-wine-100 bg-white"
          />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-[1.15rem] border border-wine-100 bg-white" />
        <div className="h-80 animate-pulse rounded-[1.15rem] border border-wine-100 bg-white" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_1.1fr_0.9fr]">
        <div className="h-80 animate-pulse rounded-[1.15rem] border border-wine-100 bg-white" />
        <div className="h-80 animate-pulse rounded-[1.15rem] border border-wine-100 bg-white" />
        <div className="h-80 animate-pulse rounded-[1.15rem] border border-wine-100 bg-white" />
      </div>
    </div>
  )
}
