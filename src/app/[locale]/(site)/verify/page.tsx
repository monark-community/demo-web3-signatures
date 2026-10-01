import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { VerifyView } from "@/components/demo/verify-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/verify">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).verify
  return pageMetadata(locale, "/verify", d.metaTitle, d.metaDescription)
}

export default async function VerifyPage({ params }: PageProps<"/[locale]/verify">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <Suspense>
      <VerifyView />
    </Suspense>
  )
}
