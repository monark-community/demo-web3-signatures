"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useI18n } from "@/i18n/client"

import { LocaleSwitch } from "./locale-switch"
import { NavLinks, type NavItem } from "./nav-links"
import { Wordmark } from "./seal"
import { ThemeToggle } from "./theme"

export function MobileMenu({
  items,
  cta,
  className,
  extra,
}: {
  items: NavItem[]
  cta: { href: string; label: string }
  className?: string
  extra?: React.ReactNode
}) {
  const { locale, dict } = useI18n()
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={dict.nav.menu} className={className}>
          <MenuIcon className="size-5" strokeWidth={1.5} aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={dict.common.close} className="w-full gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle>
            <Wordmark />
          </SheetTitle>
          <SheetDescription className="pr-8">{dict.footer.tagline}</SheetDescription>
        </SheetHeader>
        <nav aria-label={dict.nav.primary} className="flex-1 overflow-y-auto px-3 py-3">
          <NavLinks
            items={items}
            className="flex flex-col"
            itemClassName="h-12 w-full border-b border-rule px-3 text-base aria-[current=page]:text-primary aria-[current=page]:after:hidden"
            onNavigate={() => setOpen(false)}
          />
          {extra}
        </nav>
        <div className="flex flex-col gap-4 border-t px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3">
            <LocaleSwitch locale={locale} label={dict.nav.language} />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
              <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
              {dict.common.demoShort}
            </span>
            <ThemeToggle label={dict.nav.theme} />
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href={cta.href} onClick={() => setOpen(false)}>
              {cta.label}
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
