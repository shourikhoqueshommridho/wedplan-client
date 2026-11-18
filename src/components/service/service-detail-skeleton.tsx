/**
 * Branded placeholder for the details route. It mirrors the real page's
 * breadcrumb/header/gallery/sidebar rhythm so the transition into loaded
 * content does not shift the layout.
 */
export function ServiceDetailSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading service details
      </p>

      <div aria-hidden="true" className="border-b border-wine-100/80 bg-white/70">
        <div className="mx-auto flex w-full max-w-[1440px] items-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
          <span className="h-3 w-12 animate-pulse rounded bg-wine-100" />
          <span className="size-3 animate-pulse rounded bg-wine-50" />
          <span className="h-3 w-28 animate-pulse rounded bg-wine-100" />
          <span className="size-3 animate-pulse rounded bg-wine-50" />
          <span className="h-3 w-40 animate-pulse rounded bg-wine-100" />
        </div>
      </div>

      <div className="border-b border-wine-100/80 bg-[linear-gradient(120deg,#fff8f0_0%,#fffdfa_55%,#fdf3f6_100%)]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-9 sm:px-6 lg:px-8" aria-hidden="true">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full max-w-2xl space-y-3">
              <div className="h-6 w-40 animate-pulse rounded-full bg-wine-100" />
              <div className="h-11 w-full max-w-xl animate-pulse rounded bg-wine-200/60 sm:h-14" />
              <div className="h-4 w-48 animate-pulse rounded bg-wine-100" />
            </div>
            <div className="h-12 w-full animate-pulse rounded-2xl bg-white/80 sm:w-52" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-9">
          <div className="min-w-0 space-y-6" aria-hidden="true">
            <div>
              <div className="aspect-[4/3] w-full animate-pulse rounded-[1.75rem] border border-wine-100 bg-wine-100/80 sm:aspect-[16/10]" />
              <div className="mt-3 grid grid-cols-4 gap-2.5 sm:mt-4 sm:gap-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="aspect-[4/3] animate-pulse rounded-xl bg-wine-100/70"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-[1.75rem] border border-wine-100 bg-white p-6 sm:p-8">
              <div className="h-3 w-32 animate-pulse rounded bg-wine-100" />
              <div className="h-8 w-56 animate-pulse rounded bg-wine-100" />
              <div className="space-y-2.5">
                <div className="h-3.5 w-full animate-pulse rounded bg-wine-50" />
                <div className="h-3.5 w-full animate-pulse rounded bg-wine-50" />
                <div className="h-3.5 w-4/5 animate-pulse rounded bg-wine-50" />
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] border border-wine-100 bg-white p-6 sm:grid-cols-3 sm:p-7">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="space-y-3">
                  <div className="size-9 animate-pulse rounded-full bg-wine-50" />
                  <div className="h-3 w-20 animate-pulse rounded bg-wine-100" />
                  <div className="h-4 w-28 animate-pulse rounded bg-wine-50" />
                </div>
              ))}
            </div>
          </div>

          <aside aria-hidden="true" className="min-w-0">
            <div className="rounded-[1.75rem] border border-wine-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-wine-100 pb-5">
                <div className="space-y-2">
                  <div className="h-2.5 w-24 animate-pulse rounded bg-wine-100" />
                  <div className="h-6 w-40 animate-pulse rounded bg-wine-100" />
                </div>
                <div className="h-8 w-24 animate-pulse rounded bg-wine-50" />
              </div>
              <div className="mt-5 space-y-4">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-3 w-28 animate-pulse rounded bg-wine-100" />
                    <div className="h-11 animate-pulse rounded-xl bg-wine-50" />
                  </div>
                ))}
                <div className="h-11 animate-pulse rounded-full bg-wine-200/70" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
