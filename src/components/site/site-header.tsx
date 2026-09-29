import Link from "next/link"

import { Button } from "@/components/ui/button"
import { href, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { LocaleSwitch } from "./locale-switch"
import { MobileMenu } from "./mobile-menu"
import { NavLinks, type NavItem } from "./nav-links"
import { Wordmark } from "./seal"
import { ThemeToggle } from "./theme"

export function siteNav(locale: Locale, dict: Dictionary): NavItem[] {
  return [
    { href: href(locale, "/how-it-works"), label: dict.nav.howItWorks },
    { href: href(locale, "/verify"), label: dict.nav.verify },
    { href: `${href(locale)}#use-cases`, label: dict.nav.useCases },
  ]
}

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = siteNav(locale, dict)
  const cta = { href: href(locale, "/app"), label: dict.nav.openApp }
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href={href(locale)} aria-label={dict.nav.home} className="rounded-sm">
          <Wordmark />
        </Link>
        <nav aria-label={dict.nav.primary} className="hidden md:block">
          <NavLinks items={items} className="flex items-center" />
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
            <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
            {dict.common.demoShort}
          </span>
          <LocaleSwitch locale={locale} label={dict.nav.language} />
          <ThemeToggle label={dict.nav.theme} />
          <Button asChild>
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        </div>
        <MobileMenu items={items} cta={cta} className="ml-auto md:hidden" />
      </div>
    </header>
  )
}
