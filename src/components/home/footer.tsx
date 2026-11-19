import Link from "next/link"
import { Heart, Mail, MapPin, Phone } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { SocialLinks } from "@/components/home/social-links"
import { serviceCategories } from "@/data/categories"

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
  { href: "/sign-in", label: "Sign In" },
  { href: "/sign-up", label: "Create an Account" },
] as const

// Cache Components forbids reading the current time during prerendering, so the
// footer year is a static constant that gets updated with the content.
const COPYRIGHT_YEAR = 2026

const contactItems = [
  {
    href: "mailto:hello@wedplan.com",
    label: "hello@wedplan.com",
    icon: Mail,
  },
  {
    href: "tel:+12125550184",
    label: "+1 (212) 555-0184",
    icon: Phone,
  },
] as const

export function Footer() {
  return (
    <footer className="bg-wine-900 text-cream-100">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1.1fr_1fr]">
          <div className="min-w-0">
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-100/65">
              WedPlan brings couples and trusted wedding professionals together, so planning your
              perfect day feels as beautiful as the day itself.
            </p>
            <SocialLinks className="mt-6" />
          </div>

          <div className="min-w-0">
            <h2 className="font-heading text-lg font-semibold text-cream-50">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex rounded text-sm text-cream-100/70 transition-colors hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-100/60 focus-visible:ring-offset-2 focus-visible:ring-offset-wine-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h2 className="font-heading text-lg font-semibold text-cream-50">Categories</h2>
            <ul className="mt-4 space-y-2.5">
              {serviceCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={category.href}
                    className="inline-flex rounded text-sm text-cream-100/70 transition-colors hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-100/60 focus-visible:ring-offset-2 focus-visible:ring-offset-wine-900"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h2 className="font-heading text-lg font-semibold text-cream-50">Get in Touch</h2>
            <ul className="mt-4 space-y-3 text-sm text-cream-100/70">
              {contactItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded transition-colors hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-100/60 focus-visible:ring-offset-2 focus-visible:ring-offset-wine-900"
                  >
                    <item.icon aria-hidden="true" className="size-4 shrink-0 text-wine-300" />
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-300" />
                <span>
                  128 Rosewood Avenue
                  <br />
                  New York, NY 10011
                </span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-cream-100/45">Mon–Fri, 9:00am–6:00pm EST</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-cream-100/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {COPYRIGHT_YEAR} WedPlan. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            Made with
            <Heart aria-hidden="true" className="size-3 fill-wine-300 text-wine-300" />
            for couples everywhere.
          </p>
        </div>
      </div>
    </footer>
  )
}
