const SKELETON_COUNT = 6

export function ServiceCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-wine-100 bg-white shadow-sm"
        >
          <div className="aspect-[16/7] animate-pulse bg-wine-100" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-28 animate-pulse rounded-full bg-wine-100" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-wine-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-wine-50" />
            <div className="h-9 animate-pulse rounded-full bg-wine-50" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ServicesLoading() {
  return (
    <main id="main-content" className="flex-1" aria-busy="true">
      <p role="status" className="sr-only">
        Loading wedding services
      </p>

      <section
        aria-hidden="true"
        className="flex min-h-[205px] items-center border-b border-wine-100 bg-[linear-gradient(105deg,#fdf1f4_0%,#fbe7ed_58%,#fdf6f1_100%)] sm:min-h-[220px]"
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-[600px] space-y-3">
            <div className="h-10 w-4/5 animate-pulse rounded bg-wine-200/70 sm:h-12 sm:w-[460px]" />
            <div className="h-4 w-[min(100%,420px)] animate-pulse rounded bg-wine-200/50" />
            <div className="h-4 w-[min(82%,360px)] animate-pulse rounded bg-wine-200/50" />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pb-12">
        <div className="grid gap-5 lg:grid-cols-[232px_minmax(0,1fr)]">
          <aside
            aria-hidden="true"
            className="h-fit rounded-2xl border border-wine-100 bg-white p-4 shadow-sm"
          >
            <div className="mb-4 h-6 w-24 animate-pulse rounded bg-wine-100" />
            <div className="space-y-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="size-4 animate-pulse rounded border border-wine-200 bg-wine-50" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-wine-50" />
                </div>
              ))}
            </div>
            <div className="mt-5 h-10 animate-pulse rounded-full bg-wine-50" />
          </aside>

          <div className="min-w-0">
            <div
              aria-hidden="true"
              className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4"
            >
              <div className="h-10 animate-pulse rounded-xl bg-white shadow-sm sm:col-span-2 xl:col-span-1" />
              <div className="h-10 animate-pulse rounded-xl bg-white shadow-sm" />
              <div className="h-10 animate-pulse rounded-xl bg-white shadow-sm" />
              <div className="h-10 animate-pulse rounded-xl bg-white shadow-sm" />
            </div>
            <p className="mb-3 mt-4 h-5 w-40 animate-pulse rounded bg-wine-100" aria-hidden="true" />
            <ServiceCardsSkeleton />
          </div>
        </div>
      </section>
    </main>
  )
}
