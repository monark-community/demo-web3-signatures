import Link from "next/link"

import { href, MONARK_URL, PROJECT_DOC_URL, REPO_URL, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { Wordmark } from "./seal"

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const product = [
    { href: href(locale, "/how-it-works"), label: dict.nav.howItWorks },
    { href: href(locale, "/verify"), label: dict.nav.verify },
    { href: href(locale, "/app"), label: dict.nav.openApp },
    { href: href(locale, "/credits"), label: dict.footer.credits },
  ]
  const project = [
    { href: PROJECT_DOC_URL, label: dict.footer.docs },
    { href: REPO_URL, label: dict.footer.repo },
  ]
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm space-y-3">
          <Wordmark />
          <p className="text-sm text-muted-foreground">{dict.footer.tagline}</p>
        </div>
        <nav aria-label={dict.footer.product}>
          <h2 className="eyebrow mb-3">{dict.footer.product}</h2>
          <ul className="space-y-1">
            {product.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-9 items-center text-sm hover:text-primary hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={dict.footer.project}>
          <h2 className="eyebrow mb-3">{dict.footer.project}</h2>
          <ul className="space-y-1">
            {project.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="inline-flex min-h-9 items-center text-sm hover:text-primary hover:underline" rel="noopener noreferrer" target="_blank">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
              {dict.common.demoBadge}
            </span>
            <span>© {new Date().getFullYear()} · {dict.footer.rights}</span>
          </p>
          <a href={MONARK_URL} className="text-[13px] text-muted-foreground hover:text-foreground hover:underline" rel="noopener noreferrer" target="_blank">
            {dict.footer.builtWith}
          </a>
        </div>
      </div>
    </footer>
  )
}
