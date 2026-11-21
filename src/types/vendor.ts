export const VENDOR_BUSINESS_CATEGORIES = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
] as const

export type VendorBusinessCategory = (typeof VENDOR_BUSINESS_CATEGORIES)[number]

export function isVendorBusinessCategory(value: unknown): value is VendorBusinessCategory {
  return (
    typeof value === "string" &&
    (VENDOR_BUSINESS_CATEGORIES as readonly string[]).includes(value)
  )
}

export interface VendorProfile {
  id: string
  userId: string
  businessName: string
  category: VendorBusinessCategory
  phone: string
  location: string
  website: string | null
  description: string
  contactEmail: string
  createdAt: string | null
  updatedAt: string | null
}

export type VendorServiceStatus = "pending" | "approved" | "rejected" | "inactive"

export interface VendorService {
  id: string
  name: string
  category: string
  description: string
  price: number
  location: string
  images: string[]
  status: VendorServiceStatus | string
  isActive: boolean
  /**
   * Not stored by the current API. Read when present so an admin note can be
   * surfaced without a schema change; the UI stays honest when it is absent.
   */
  rejectionReason: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface VendorServiceFormValues {
  serviceName: string
  category: VendorBusinessCategory
  description: string
  price: string
  location: string
  images: string
}
