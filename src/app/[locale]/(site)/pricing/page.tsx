import { CheckIcon, EyeOffIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { cn } from "@/lib/utils"

// Internal strategy review only: never linked, not in the sitemap, not indexed.
export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).pricing
  return { title: d.metaTitle, robots: { index: false, follow: false } }
}

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale).pricing
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
        <EyeOffIcon className="size-3.5" aria-hidden="true" />
        {d.notice}
      </p>
      <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">{d.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{d.lead}</p>

      <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {d.tiers.map((tier) => {
          const featured = "featured" in tier && tier.featured
          return (
            <li key={tier.name} className={cn("flex flex-col rounded-sm border bg-card p-5", featured && "sheet border-primary")}>
              <h2 className="eyebrow">{tier.name}</h2>
              <p className="mt-3 text-4xl font-extrabold tracking-[-0.03em]">{tier.price}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tier.cadence}</p>
              <p className="mt-4 text-sm font-medium">{tier.for}</p>
              <ul className="mt-4 space-y-2 border-t border-rule pt-4">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
      <p className="mt-6 text-sm text-muted-foreground">{d.overage}</p>

      <section className="mt-14 max-w-3xl" aria-labelledby="reasoning">
        <h2 id="reasoning" className="text-2xl font-bold">
          {d.reasoningTitle}
        </h2>
        <ol className="mt-4 space-y-3">
          {d.reasoning.map((r, i) => (
            <li key={r} className="flex gap-3 text-muted-foreground">
              <span className="font-mono text-xs text-primary">0{i + 1}</span>
              {r}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
