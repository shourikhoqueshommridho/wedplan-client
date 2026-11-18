import type { LucideIcon } from "lucide-react"

import type { ServiceCategorySlug } from "./service"

export interface ServiceCategory {
  slug: ServiceCategorySlug
  name: string
  description: string
  href: string
  icon: LucideIcon
}
