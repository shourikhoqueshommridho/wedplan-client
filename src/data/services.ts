import type { WeddingService } from "@/types/service"

import { weddingImages } from "./images"

/**
 * TEMPORARY HOME PAGE MOCK DATA — not a MongoDB response.
 *
 * Only approved and active entries are included, matching the visibility rule
 * the Express API must enforce. Replace this module with a data-access function
 * that calls the API when the marketplace endpoints are available; the
 * `WeddingService` shape and the components consuming it stay unchanged.
 */
export const services: readonly WeddingService[] = [
  {
    id: "mock-service-photography",
    slug: "wedding-photography",
    name: "Wedding Photography",
    category: "photography-videography",
    shortDescription:
      "Full-day coverage with a lead photographer, second shooter, and edited gallery.",
    price: { amount: 800, currency: "USD", unit: "package" },
    location: { city: "New York", country: "United States" },
    vendor: {
      id: "mock-vendor-dream-click-studio",
      name: "Dream Click Studio",
      initials: "DC",
      isVerified: true,
    },
    image: weddingImages.photography,
    rating: 4.9,
    reviewCount: 128,
    status: "approved",
    isActive: true,
  },
  {
    id: "mock-service-venue",
    slug: "luxury-wedding-venue",
    name: "Luxury Wedding Venue",
    category: "wedding-venues",
    shortDescription:
      "Ballroom ceremony and reception with chandelier lighting and catering access.",
    price: { amount: 2500, currency: "USD", unit: "event" },
    location: { city: "New York", country: "United States" },
    vendor: {
      id: "mock-vendor-grand-events",
      name: "Grand Events",
      initials: "GE",
      isVerified: true,
    },
    image: weddingImages.venue,
    rating: 4.8,
    reviewCount: 96,
    status: "approved",
    isActive: true,
  },
  {
    id: "mock-service-floral",
    slug: "floral-decoration",
    name: "Floral Decoration",
    category: "decoration-florist",
    shortDescription:
      "Ceremony arch, aisle florals, and table centerpieces designed around your palette.",
    price: { amount: 450, currency: "USD", unit: "package" },
    location: { city: "New York", country: "United States" },
    vendor: {
      id: "mock-vendor-bloom-decor",
      name: "Bloom Decor",
      initials: "BD",
      isVerified: true,
    },
    image: weddingImages.floral,
    rating: 4.8,
    reviewCount: 74,
    status: "approved",
    isActive: true,
  },
  {
    id: "mock-service-catering",
    slug: "catering-service",
    name: "Catering Service",
    category: "catering-services",
    shortDescription:
      "Seasonal plated menus, live stations, and a dedicated service team.",
    price: { amount: 1200, currency: "USD", unit: "event" },
    location: { city: "New York", country: "United States" },
    vendor: {
      id: "mock-vendor-tasty-bites",
      name: "Tasty Bites",
      initials: "TB",
      isVerified: true,
    },
    image: weddingImages.catering,
    rating: 4.9,
    reviewCount: 152,
    status: "approved",
    isActive: true,
  },
  {
    id: "mock-service-makeup",
    slug: "makeup-styling",
    name: "Makeup & Styling",
    category: "makeup-styling",
    shortDescription:
      "Trial session, bridal makeup, and touch-up kit for the full celebration.",
    price: { amount: 350, currency: "USD", unit: "package" },
    location: { city: "New York", country: "United States" },
    vendor: {
      id: "mock-vendor-glam-studio",
      name: "Glam Studio",
      initials: "GS",
      isVerified: true,
    },
    image: weddingImages.makeup,
    rating: 4.9,
    reviewCount: 88,
    status: "approved",
    isActive: true,
  },
  {
    id: "mock-service-fashion",
    slug: "wedding-fashion",
    name: "Wedding Fashion",
    category: "wedding-fashion",
    shortDescription:
      "Curated bridal gowns and tailoring appointments in a private showroom.",
    price: { amount: 700, currency: "USD", unit: "package" },
    location: { city: "New York", country: "United States" },
    vendor: {
      id: "mock-vendor-bridal-couture",
      name: "Bridal Couture",
      initials: "BC",
      isVerified: true,
    },
    image: weddingImages.fashion,
    rating: 4.7,
    reviewCount: 61,
    status: "approved",
    isActive: true,
  },
]
