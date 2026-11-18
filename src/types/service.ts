export const SERVICE_CATEGORY_SLUGS = [
  "photography-videography",
  "wedding-venues",
  "decoration-florist",
  "catering-services",
  "makeup-styling",
  "wedding-fashion",
] as const

export type ServiceCategorySlug = (typeof SERVICE_CATEGORY_SLUGS)[number]

/**
 * Mirrors the moderation state that the Express API will expose later.
 * The Home Page only renders services where `status` is "approved" and
 * `isActive` is true.
 */
export type ServiceStatus = "pending" | "approved" | "rejected" | "inactive"

export type ServicePriceUnit = "package" | "event" | "person" | "hour"

export type ServiceCurrency = "USD" | "BDT"

export interface ServicePrice {
  amount: number
  currency: ServiceCurrency
  unit: ServicePriceUnit
}

export interface ServiceLocation {
  city: string
  country: string
}

export interface ServiceVendor {
  id: string
  name: string
  initials: string
  isVerified?: boolean
  image?: string
}

export interface ServiceImage {
  src: string
  alt: string
}

export interface WeddingService {
  id: string
  slug: string
  name: string
  category: ServiceCategorySlug
  shortDescription: string
  price: ServicePrice
  location: ServiceLocation
  vendor: ServiceVendor
  image: ServiceImage
  rating: number
  reviewCount: number
  status: ServiceStatus
  isActive: boolean
}

/** Public, presentation-ready service returned by GET /api/services. */
export interface ServiceListing {
  id: string
  name: string
  category: string
  categoryLabel: string
  shortDescription: string
  price: ServicePrice
  location: ServiceLocation
  vendor: ServiceVendor
  image: ServiceImage
  images: string[]
  rating?: number
  reviewCount?: number
}

/**
 * Fields shared by the API-backed listing and the Home Page mock so both can
 * reuse the same card without widening component props to unrelated fields.
 */
export interface ServiceCardData {
  id: string
  name: string
  category: string
  categoryLabel?: string
  price: ServicePrice
  location: ServiceLocation
  vendor: ServiceVendor
  image: ServiceImage
  images?: string[]
  rating?: number
  reviewCount?: number
}

export function isServiceCategorySlug(value: unknown): value is ServiceCategorySlug {
  return (
    typeof value === "string" &&
    SERVICE_CATEGORY_SLUGS.some((categorySlug) => categorySlug === value)
  )
}
