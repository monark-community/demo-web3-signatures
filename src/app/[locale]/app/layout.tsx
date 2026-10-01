import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AppShell } from "@/components/demo/app-shell"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: LayoutProps<"/[locale]/app">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app
  return pageMetadata(locale, "/app", d.metaTitle, d.metaDescription)
}

export default async function AppLayout({ children, params }: LayoutProps<"/[locale]/app">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <AppShell>{children}</AppShell>
}
