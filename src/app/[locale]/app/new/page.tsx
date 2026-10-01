import type { Metadata } from "next"

import { NewEnvelope } from "@/components/demo/new-envelope"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/new">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app
  return pageMetadata(locale, "/app/new", d.create.metaTitle, d.metaDescription)
}

export default function NewEnvelopePage() {
  return <NewEnvelope />
}
