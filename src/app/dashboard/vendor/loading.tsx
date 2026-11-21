export default function VendorDashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your vendor dashboard…</span>

      <div className="h-52 animate-pulse rounded-[1.75rem] border border-wine-100 bg-blush-100/60 sm:h-60" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {["services", "bookings", "earnings"].map((key) => (
          <div
            key={key}
            className="h-[100px] animate-pulse rounded-[1.35rem] border border-wine-100 bg-white"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="h-80 animate-pulse rounded-[1.5rem] border border-wine-100 bg-white" />
        <div className="h-80 animate-pulse rounded-[1.5rem] border border-wine-100 bg-white" />
      </div>
    </div>
  )
}
