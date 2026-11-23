export default function AdminTransactionsLoading() {
  return (
    <div className="space-y-5" role="status" aria-live="polite">
      <section className="overflow-hidden rounded-[1.15rem] border border-wine-100 bg-white p-5 shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]">
        <div className="h-5 w-36 animate-pulse rounded bg-wine-100" />
        <div className="mt-2 h-3 w-64 animate-pulse rounded bg-wine-50" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-wine-50" />
          ))}
        </div>
      </section>
      <span className="sr-only">Loading transactions…</span>
    </div>
  )
}
