import {
  Building2,
  Camera,
  Flower2,
  Shirt,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react"

import type { ServiceCategory } from "@/types/category"

/**
 * Static marketplace taxonomy. Category detail pages are not part of this
 * task, so every entry links to the future services listing with its filter.
 */
export const serviceCategories: readonly ServiceCategory[] = [
  {
    slug: "photography-videography",
    name: "Photography & Videography",
    description: "Candid photos, cinematic films, and keepsake albums.",
    href: "/services?category=photography-videography",
    icon: Camera,
  },
  {
    slug: "wedding-venues",
    name: "Wedding Venues",
    description: "Garden estates, ballrooms, and intimate ceremony spaces.",
    href: "/services?category=wedding-venues",
    icon: Building2,
  },
  {
    slug: "decoration-florist",
    name: "Decoration & Florist",
    description: "Floral styling, stage design, and reception décor.",
    href: "/services?category=decoration-florist",
    icon: Flower2,
  },
  {
    slug: "catering-services",
    name: "Catering Services",
    description: "Menus, live stations, and dessert tables for every guest.",
    href: "/services?category=catering-services",
    icon: UtensilsCrossed,
  },
  {
    slug: "makeup-styling",
    name: "Makeup & Styling",
    description: "Bridal makeup, hair styling, and getting-ready looks.",
    href: "/services?category=makeup-styling",
    icon: Sparkles,
  },
  {
    slug: "wedding-fashion",
    name: "Wedding Fashion",
    description: "Bridal gowns, suits, and accessories for the big day.",
    href: "/services?category=wedding-fashion",
    icon: Shirt,
  },
]

export function getServiceCategoryName(slug: string): string {
  return serviceCategories.find((category) => category.slug === slug)?.name ?? slug
}
