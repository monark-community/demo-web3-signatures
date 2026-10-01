import { locale as rootLocale } from "next/root-params"

import { NotFoundView } from "@/components/site/not-found-view"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { isLocale, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

async function currentLocale(): Promise<Locale> {
  const value = await rootLocale()
  return value && isLocale(value) ? value : "en"
}

export default async function NotFound() {
  const locale = await currentLocale()
  const dict = getDictionary(locale)
  return (
    <>
      <SiteHeader locale={locale} dict={dict} />
      <main id="main" className="flex-1">
        <NotFoundView locale={locale} dict={dict} />
      </main>
      <SiteFooter locale={locale} dict={dict} />
    </>
  )
}
