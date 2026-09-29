import type { Metadata } from "next"
import { Suspense } from "react"

import { EnvelopeView } from "@/components/demo/envelope-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

// Seeded envelopes are prerendered; envelopes created in the browser render on demand
// (the page is a thin shell: the envelope itself lives in the visitor's localStorage).
export function generateStaticParams() {
  return ["msa-halden", "grant-boreale", "offer-reyes", "licence-duval", "resolution-2026-07", "nda-quillon"].map((id) => ({ id }))
}

export async function generateMetadata({ params }: PageProps<"/[locale]/app/envelopes/[id]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app
  return { title: d.metaTitle, robots: { index: false, follow: true } }
}

export default async function EnvelopePage({ params }: PageProps<"/[locale]/app/envelopes/[id]">) {
  const { id } = await params
  return (
    <Suspense>
      <EnvelopeView id={id} />
    </Suspense>
  )
}
