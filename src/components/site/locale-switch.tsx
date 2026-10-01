"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { locales, switchLocalePath, type Locale } from "@/i18n/config"
import { cn } from "@/lib/utils"

const NAMES: Record<Locale, string> = { en: "English", fr: "Français" }

/** Compact EN/FR switch that keeps the current page. */
export function LocaleSwitch({ locale, label, className }: { locale: Locale; label: string; className?: string }) {
  const pathname = usePathname() ?? `/${locale}`
  return (
    <nav aria-label={label} className={cn("flex items-center rounded-md border bg-card p-0.5 font-mono", className)}>
      {locales.map((l) => {
        const active = l === locale
        return (
          <Link
            key={l}
            href={switchLocalePath(pathname, l)}
            hrefLang={l}
            lang={l}
            aria-current={active ? "true" : undefined}
            aria-label={NAMES[l]}
            prefetch={false}
            className={cn(
              "inline-flex h-8 min-w-9 items-center justify-center rounded-sm px-2 text-xs font-medium uppercase tracking-wider transition-colors",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {l}
          </Link>
        )
      })}
    </nav>
  )
}
