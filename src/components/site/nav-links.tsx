"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface NavItem {
  href: string
  label: string
  /** Also active on sub-paths. */
  prefix?: boolean
}

export function isActive(pathname: string, item: NavItem) {
  const path = item.href.split("#")[0]!
  if (item.href.includes("#")) return false
  return item.prefix ? pathname === path || pathname.startsWith(`${path}/`) : pathname === path
}

export function NavLinks({
  items,
  className,
  itemClassName,
  onNavigate,
}: {
  items: NavItem[]
  className?: string
  itemClassName?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname() ?? ""
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isActive(pathname, item) ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "relative inline-flex h-10 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              "aria-[current=page]:text-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:bottom-1.5 aria-[current=page]:after:h-px aria-[current=page]:after:bg-primary",
              itemClassName
            )}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
