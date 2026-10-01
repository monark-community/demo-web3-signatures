import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Schibsted_Grotesk } from "next/font/google"
import { notFound } from "next/navigation"

import "../globals.css"

import { ThemeProvider } from "@/components/site/theme"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { I18nProvider } from "@/i18n/client"
import { isLocale, locales, SITE_URL } from "@/i18n/config"
import { getDictionary } from "@/i18n"

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-schibsted",
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.title, template: d.titleTemplate },
    description: d.description,
    applicationName: "SignChain",
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", fr: "/fr", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "SignChain",
      title: d.title,
      description: d.description,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      url: `/${locale}`,
    },
    twitter: { card: "summary_large_image", title: d.title, description: d.description },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#121315" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)

  return (
    <html lang={locale} className={`${schibsted.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <I18nProvider locale={locale} dict={dict}>
            <TooltipProvider delayDuration={200}>
              <a
                href="#main"
                className="sr-only z-[60] rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
              >
                {dict.common.skip}
              </a>
              {children}
              <Toaster position="top-right" offset={{ top: 76, right: 16 }} mobileOffset={{ top: 72 }} />
            </TooltipProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
