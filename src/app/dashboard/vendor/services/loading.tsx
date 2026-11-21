export default function VendorServicesLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading services">
      <section className="rounded-[1.75rem] border border-wine-100 bg-white animate-pulse">
        <div className="border-b border-wine-100 px-6 py-4">
          <div className="h-6 w-[200px] bg-wine-50 rounded" />
          <div className="mt-2 h-4 w-[300px] bg-wine-50 rounded" />
        </div>
        <div className="px-6 py-4">
          <div className="h-10 w-[280px] bg-wine-50 rounded-full" />
          <div className="mt-3 h-10 w-[200px] bg-wine-50 rounded-full" />
          <div className="mt-3 h-10 w-[180px] bg-wine-50 rounded-full" />
        </div>
        <div className="divide-y divide-wine-100">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-6 py-5">
              <div className="flex gap-4">
                <div className="size-14 rounded-2xl bg-wine-50" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-[200px] bg-wine-50 rounded" />
                  <div className="h-3 w-[150px] bg-wine-50 rounded" />
                  <div className="h-4 w-[300px] bg-wine-50 rounded" />
                  <div className="h-4 w-[100px] bg-wine-50 rounded" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-8 w-[80px] bg-wine-50 rounded-full" />
                    <div className="h-8 w-[100px] bg-wine-50 rounded-full" />
                    <div className="h-8 w-[80px] bg-wine-50 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}