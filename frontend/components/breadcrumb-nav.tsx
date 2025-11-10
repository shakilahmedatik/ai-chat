"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem as UIBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbItem {
  label: string
  href?: string
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }]

  if (segments.length === 0) return breadcrumbs

  let currentPath = ""
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // Format segment for display
    const label = segment
      .replace(/^thread\//, "") // Remove 'thread/' prefix
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())

    if (isLast) {
      breadcrumbs.push({ label })
    } else {
      breadcrumbs.push({ label, href: currentPath })
    }
  })

  return breadcrumbs
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  // Don't show breadcrumb on home page
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <div key={item.href || item.label} className="flex items-center gap-1.5">
            {index > 0 && <BreadcrumbSeparator />}
            <UIBreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </UIBreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
