"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Tag,
} from "lucide-react"

import { ServiceCard } from "@/components/service/service-card"
import { ServiceCardsSkeleton } from "@/components/service/services-loading"
import { serviceCategories } from "@/data/categories"
import { weddingImages } from "@/data/images"
import { apiUrl } from "@/lib/api"
import { isRecord, parseServiceListing, parseServiceLocations } from "@/lib/service-listing"
import { cn } from "@/lib/utils"
import { isServiceCategorySlug, type ServiceCategorySlug, type ServiceListing } from "@/types/service"

const PAGE_SIZE = 6

type LoadState = "loading" | "ready" | "error"
type PriceRange = "under-10000" | "10000-25000" | "25000-60000" | "over-60000"
type SortOrder = "asc" | "desc"

const priceRanges: { id: PriceRange; label: string }[] = [
  { id: "under-10000", label: "Under ৳10,000" },
  { id: "10000-25000", label: "৳10,000 – ৳25,000" },
  { id: "25000-60000", label: "৳25,000 – ৳60,000" },
  { id: "over-60000", label: "৳60,000 & above" },
]

interface BrowseServicesProps {
  initialCategory?: string
  initialSearch?: string
}

function isPriceInRange(amount: number, range: PriceRange): boolean {
  switch (range) {
    case "under-10000":
      return amount < 10_000
    case "10000-25000":
      return amount >= 10_000 && amount < 25_000
    case "25000-60000":
      return amount >= 25_000 && amount < 60_000
    case "over-60000":
      return amount >= 60_000
  }
}

export function BrowseServices({ initialCategory, initialSearch }: BrowseServicesProps) {
  const normalizedCategory = isServiceCategorySlug(initialCategory)
    ? initialCategory
    : ""
  const [services, setServices] = useState<ServiceListing[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [retryCount, setRetryCount] = useState(0)
  const [searchInput, setSearchInput] = useState(initialSearch ?? "")
  const [search, setSearch] = useState(initialSearch?.trim() ?? "")
  const [category, setCategory] = useState<ServiceCategorySlug | "">(normalizedCategory)
  const [location, setLocation] = useState("")
  const [sort, setSort] = useState<SortOrder>("asc")
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    const controller = new AbortController()

    async function loadServices() {
      setLoadState("loading")

      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (category) params.set("category", category)
      if (location) params.set("location", location)
      params.set("sort", sort)

      try {
        // Approval and activity visibility are enforced by the API against the
        // real MongoDB schema; the client never infers them from mock data.
        const response = await fetch(apiUrl(`/api/services?${params.toString()}`), {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(response.status === 404 ? "missing-endpoint" : "request-failed")
        }

        const payload: unknown = await response.json()
        if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.data)) {
          throw new Error("invalid-response")
        }

        const parsedServices = payload.data.map(parseServiceListing)
        if (parsedServices.some((service) => service === null)) {
          throw new Error("invalid-response")
        }

        setServices(parsedServices.filter((service): service is ServiceListing => service !== null))
        setLocations(parseServiceLocations(payload.meta))
        setLoadState("ready")
      } catch {
        if (controller.signal.aborted) return
        setServices([])
        setLoadState("error")
      }
    }

    void loadServices()
    return () => controller.abort()
  }, [search, category, location, sort, retryCount])

  const filteredServices = useMemo(() => {
    if (selectedPriceRanges.length === 0) return services
    return services.filter((service) =>
      selectedPriceRanges.some((range) => isPriceInRange(service.price.amount, range)),
    )
  }, [services, selectedPriceRanges])

  const pageCount = Math.ceil(filteredServices.length / PAGE_SIZE)
  const visibleServices = filteredServices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const firstVisible = filteredServices.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const lastVisible = Math.min(page * PAGE_SIZE, filteredServices.length)

  const clearFilters = useCallback(() => {
    setSearchInput("")
    setSearch("")
    setCategory("")
    setLocation("")
    setSort("asc")
    setSelectedPriceRanges([])
    setPage(1)
  }, [])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  function togglePriceRange(range: PriceRange) {
    setSelectedPriceRanges((current) =>
      current.includes(range) ? current.filter((item) => item !== range) : [...current, range],
    )
    setPage(1)
  }

  const selectClass =
    "h-10 w-full rounded-xl border border-wine-100 bg-white px-3 text-sm text-foreground outline-none transition focus:border-wine-300 focus:ring-2 focus:ring-wine-100"

  return (
    <>
      <section
        aria-labelledby="browse-services-title"
        className="relative isolate flex min-h-[205px] items-center overflow-hidden border-b border-wine-100 bg-wine-100 sm:min-h-[220px]"
      >
        <Image
          src={weddingImages.venue.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,242,246,0.98)_0%,rgba(255,238,243,0.92)_38%,rgba(255,238,243,0.4)_70%,rgba(255,238,243,0.08)_100%)]" />
        <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-[600px] text-center sm:text-left">
            <h1
              id="browse-services-title"
              className="font-heading text-4xl font-semibold tracking-tight text-wine-800 sm:text-5xl"
            >
              Browse Wedding Services
            </h1>
            <p className="mx-auto mt-2 max-w-[480px] text-sm leading-relaxed text-wine-900/85 sm:mx-0 sm:text-base">
              Discover the best wedding services from top vendors and make your special day
              unforgettable.
            </p>
            <div className="mx-auto mt-4 flex w-52 items-center gap-2 text-wine-500 sm:mx-0">
              <span className="h-px flex-1 bg-wine-300" />
              <span aria-hidden="true" className="text-lg leading-none">♡</span>
              <span className="h-px flex-1 bg-wine-300" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pb-12">
        <div className="grid gap-5 lg:grid-cols-[232px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-wine-100 bg-white p-4 shadow-[0_12px_35px_-28px_rgba(80,16,38,0.55)] lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-wine-100 pb-3">
              <h2 className="font-heading text-xl font-semibold text-wine-900">Filters</h2>
              <SlidersHorizontal aria-hidden="true" className="size-5 text-wine-600" />
            </div>

            <fieldset className="mt-3">
              <legend className="mb-2 text-sm font-bold text-foreground">Category</legend>
              <div className="space-y-2">
                {serviceCategories.map((item) => (
                  <label key={item.slug} className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-foreground/85">
                    <input
                      type="checkbox"
                      checked={category === item.slug}
                      onChange={() => {
                        setCategory((current) => (current === item.slug ? "" : item.slug))
                        setPage(1)
                      }}
                      className="mt-0.5 size-4 shrink-0 accent-wine-700"
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 border-t border-wine-100 pt-3">
              <label htmlFor="sidebar-location" className="mb-2 flex items-center gap-1 text-sm font-bold text-foreground">
                <MapPin aria-hidden="true" className="size-4 text-wine-700" /> Location
              </label>
              <select
                id="sidebar-location"
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value)
                  setPage(1)
                }}
                className={selectClass}
              >
                <option value="">All Locations</option>
                {locations.map((place) => (
                  <option key={place} value={place}>{place}</option>
                ))}
              </select>
            </div>

            <fieldset className="mt-4 border-t border-wine-100 pt-3">
              <legend className="mb-2 flex items-center gap-1 text-sm font-bold text-foreground">
                <Tag aria-hidden="true" className="size-4 fill-wine-600 text-wine-600" /> Price Range
              </legend>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <label key={range.id} className="flex cursor-pointer items-center gap-2 text-xs text-foreground/85">
                    <input
                      type="checkbox"
                      checked={selectedPriceRanges.includes(range.id)}
                      onChange={() => togglePriceRange(range.id)}
                      className="size-4 accent-wine-700"
                    />
                    {range.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-wine-300 text-xs font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300"
            >
              <RefreshCw aria-hidden="true" className="size-3.5" />
              Reset Filters
            </button>
          </aside>

          <div className="min-w-0">
            <div className="grid gap-2.5 xl:grid-cols-[minmax(260px,1.6fr)_minmax(155px,0.8fr)_minmax(155px,0.8fr)_minmax(190px,1fr)]">
              <form onSubmit={handleSearch} role="search" className="flex min-w-0 gap-2">
                <label htmlFor="service-search" className="sr-only">Search services by name</label>
                <div className="relative min-w-0 flex-1">
                  <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-wine-700" />
                  <input
                    id="service-search"
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search for services (e.g. photography, venue...)"
                    className="h-10 w-full rounded-xl border border-wine-100 bg-white pl-9 pr-3 text-xs text-foreground shadow-sm outline-none placeholder:text-muted-foreground/80 focus:border-wine-300 focus:ring-2 focus:ring-wine-100 sm:text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 shrink-0 rounded-xl bg-wine-800 px-4 text-xs font-semibold text-white transition-colors hover:bg-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300 sm:px-6 sm:text-sm"
                >
                  Search
                </button>
              </form>

              <label className="relative">
                <span className="sr-only">Filter by category</span>
                <Grid3X3 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-wine-700" />
                <select
                  value={category}
                  onChange={(event) => {
                    const value = event.target.value
                    setCategory(isServiceCategorySlug(value) ? value : "")
                    setPage(1)
                  }}
                  className={cn(selectClass, "pl-9")}
                >
                  <option value="">All Categories</option>
                  {serviceCategories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                </select>
              </label>

              <label className="relative">
                <span className="sr-only">Filter by location</span>
                <MapPin aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-wine-700" />
                <select
                  value={location}
                  onChange={(event) => {
                    setLocation(event.target.value)
                    setPage(1)
                  }}
                  className={cn(selectClass, "pl-9")}
                >
                  <option value="">All Locations</option>
                  {locations.map((place) => <option key={place} value={place}>{place}</option>)}
                </select>
              </label>

              <label className="relative">
                <span className="sr-only">Sort services by price</span>
                <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg leading-none text-wine-700">↕</span>
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value === "desc" ? "desc" : "asc")
                    setPage(1)
                  }}
                  className={cn(selectClass, "pl-9")}
                >
                  <option value="asc">Sort by: Price Low to High</option>
                  <option value="desc">Sort by: Price High to Low</option>
                </select>
              </label>
            </div>

            <div className="mb-3 mt-4 flex min-h-5 items-center justify-between gap-3">
              <p aria-live="polite" className="text-sm font-semibold text-foreground">
                {loadState === "ready"
                  ? filteredServices.length > 0
                    ? `Showing ${firstVisible}–${lastVisible} of ${filteredServices.length} services`
                    : "Showing 0 services"
                  : "Wedding services"}
              </p>
              {loadState === "ready" && (search || category || location || selectedPriceRanges.length > 0) ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-wine-700 underline decoration-wine-300 underline-offset-4 hover:text-wine-900"
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            {loadState === "loading" ? <ServiceCardsSkeleton /> : null}

            {loadState === "error" ? (
              <div className="grid min-h-72 place-items-center rounded-2xl border border-wine-100 bg-white px-6 py-10 text-center shadow-sm">
                <div className="max-w-md">
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-wine-50 text-wine-700">
                    <AlertCircle aria-hidden="true" className="size-6" />
                  </span>
                  <h2 className="mt-4 font-heading text-2xl font-semibold text-wine-900">Services are unavailable</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    We couldn’t load the service listings. Please try again in a moment.
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetryCount((count) => count + 1)}
                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-wine-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300"
                  >
                    <RefreshCw aria-hidden="true" className="size-4" /> Try Again
                  </button>
                </div>
              </div>
            ) : null}

            {loadState === "ready" && filteredServices.length === 0 ? (
              <div className="grid min-h-72 place-items-center rounded-2xl border border-wine-100 bg-white px-6 py-10 text-center shadow-sm">
                <div className="max-w-md">
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-wine-50 text-wine-700">
                    <Search aria-hidden="true" className="size-5" />
                  </span>
                  <h2 className="mt-4 font-heading text-2xl font-semibold text-wine-900">No services found</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Try changing your search or filters to see more wedding services.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-full border border-wine-300 px-5 py-2 text-sm font-semibold text-wine-800 transition-colors hover:bg-wine-50"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : null}

            {loadState === "ready" && filteredServices.length > 0 ? (
              <>
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleServices.map((service) => (
                    <li key={service.id} className="min-w-0">
                      <ServiceCard service={service} variant="compact" />
                    </li>
                  ))}
                </ul>

                {pageCount > 1 ? (
                  <nav aria-label="Service result pages" className="mt-5 flex justify-center">
                    <div className="inline-flex items-center rounded-full border border-wine-100 bg-white p-1 shadow-sm">
                      <button
                        type="button"
                        aria-label="Previous page"
                        disabled={page === 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        className="grid size-8 place-items-center rounded-full text-wine-800 transition-colors hover:bg-wine-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft aria-hidden="true" className="size-4" />
                      </button>
                      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                        <button
                          key={pageNumber}
                          type="button"
                          aria-current={pageNumber === page ? "page" : undefined}
                          onClick={() => setPage(pageNumber)}
                          className={cn(
                            "grid size-8 place-items-center rounded-full text-sm font-semibold transition-colors",
                            pageNumber === page ? "bg-wine-800 text-white" : "text-wine-900 hover:bg-wine-50",
                          )}
                        >
                          {pageNumber}
                        </button>
                      ))}
                      <button
                        type="button"
                        aria-label="Next page"
                        disabled={page === pageCount}
                        onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                        className="grid size-8 place-items-center rounded-full text-wine-800 transition-colors hover:bg-wine-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  </nav>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </section>
    </>
  )
}
