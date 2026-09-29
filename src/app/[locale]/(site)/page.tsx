import { ArrowRightIcon, CheckIcon, FileSearchIcon, XIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { HashToy } from "@/components/home/hash-toy"
import { HeroSheet } from "@/components/home/hero-sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { GENESIS_BLOCK } from "@/lib/demo/seed"
import { formatNumber } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/", null, d.meta.description)
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.home
  const photos = [PHOTOS.offer, PHOTOS.licence, PHOTOS.approval]

  return (
    <>
      {/* Hero */}
      <section className="relative border-b">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pt-16 lg:pb-20">
          <div className="fade-up">
            <p className="eyebrow">{h.eyebrow}</p>
            <h1 className="mt-4 text-[2.5rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4rem]">
              {h.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{h.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link href={href(locale, "/app/new")}>
                  {h.ctaPrimary}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link href={href(locale, "/verify")}>
                  <FileSearchIcon aria-hidden="true" />
                  {h.ctaSecondary}
                </Link>
              </Button>
            </div>
          </div>
          <figure className="relative">
            <HeroSheet locale={locale} dict={dict} />
            <figcaption className="mt-4 text-xs text-muted-foreground">{h.heroCaption}</figcaption>
          </figure>
        </div>
      </section>

      {/* What leaves your device */}
      <section className="border-b bg-card/60" aria-labelledby="leaves-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">{h.leaves.eyebrow}</p>
            <h2 id="leaves-title" className="mt-3 text-3xl font-bold tracking-[-0.025em] text-balance sm:text-4xl">
              {h.leaves.title}
            </h2>
            <p className="mt-4 text-muted-foreground">{h.leaves.body}</p>
          </div>
          <div className="mt-10">
            <HashToy />
          </div>
          <p className="mt-4 max-w-2xl text-xs text-muted-foreground">{h.leaves.note}</p>
        </div>
      </section>

      {/* Four steps */}
      <section className="border-b" aria-labelledby="steps-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">{h.steps.eyebrow}</p>
              <h2 id="steps-title" className="mt-3 text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
                {h.steps.title}
              </h2>
            </div>
            <Link href={href(locale, "/how-it-works")} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              {h.steps.more}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-sm border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {h.steps.items.map((s, i) => (
              <li key={s.title} className="flex flex-col bg-background p-5">
                <span className="font-mono text-xs text-primary">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                <div className="mt-auto pt-5">
                  <StepVisual index={i} locale={locale} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="scroll-mt-20 border-b bg-card/60" aria-labelledby="uses-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <p className="eyebrow">{h.uses.eyebrow}</p>
          <h2 id="uses-title" className="mt-3 text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
            {h.uses.title}
          </h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {h.uses.items.map((u, i) => (
              <li key={u.title}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm border">
                  <Image
                    src={photos[i]!.src}
                    alt={u.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover saturate-[0.85] sepia-[0.12]"
                  />
                </div>
                <h3 className="mt-4 text-lg font-bold">{u.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{u.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Verify teaser */}
      <section className="border-b" aria-labelledby="verify-title">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="eyebrow">{h.verify.eyebrow}</p>
            <h2 id="verify-title" className="mt-3 text-3xl font-bold tracking-[-0.025em] text-balance sm:text-4xl">
              {h.verify.title}
            </h2>
            <p className="mt-4 text-muted-foreground">{h.verify.body}</p>
            <ul className="mt-6 space-y-2">
              {h.verify.points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm">
                  <CheckIcon className="size-4 text-success" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8">
              <Link href={href(locale, "/verify")}>
                {h.verify.cta}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <Link
            href={href(locale, "/verify")}
            className="group flex min-h-56 flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-rule bg-card p-8 text-center transition-colors hover:border-primary"
          >
            <FileSearchIcon className="size-9 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.25} aria-hidden="true" />
            <span className="font-semibold">{dict.verify.drop}</span>
            <span className="text-sm text-muted-foreground">{dict.verify.dropHint}</span>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b bg-card/60" aria-labelledby="faq-title">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_2fr] lg:py-20">
          <h2 id="faq-title" className="text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
            {h.faq.title}
          </h2>
          <Accordion type="single" collapsible className="border-t">
            {h.faq.items.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`}>
                <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="pr-6 text-[0.95rem] leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Closing */}
      <section aria-labelledby="closing-title">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-20">
          <div className="max-w-2xl">
            <h2 id="closing-title" className="text-3xl font-bold tracking-[-0.025em] text-balance sm:text-4xl">
              {h.closing.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{h.closing.body}</p>
          </div>
          <Button asChild size="lg" className="h-12 px-6 text-base">
            <Link href={href(locale, "/app/new")}>
              {h.closing.cta}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}

/** Small, real UI fragments for each of the four steps. */
function StepVisual({ index, locale }: { index: number; locale: "en" | "fr" }) {
  const box = "rounded-sm border bg-card p-3 font-mono text-[0.7rem] leading-relaxed"
  if (index === 0)
    return (
      <div className={box}>
        <p className="text-muted-foreground">offer-jonah-reyes.pdf</p>
        <p className="mt-1 break-all text-foreground">9f2c61d0 4be7a318 …</p>
      </div>
    )
  if (index === 1)
    return (
      <div className={box}>
        <p>
          <span className="text-muted-foreground">documentHash:</span> 0x9f2c…a318
        </p>
        <p>
          <span className="text-muted-foreground">role:</span> signer
        </p>
        <p>
          <span className="text-muted-foreground">decision:</span> approve
        </p>
      </div>
    )
  if (index === 2)
    return (
      <div className={box}>
        <p className="text-muted-foreground">#{formatNumber(locale, GENESIS_BLOCK)}</p>
        <p>DocumentSigned(0x9f2c…, 0x7a3f…)</p>
      </div>
    )
  return (
    <div className={`${box} space-y-1`}>
      <p className="flex items-center gap-1.5 text-success">
        <CheckIcon className="size-3.5" aria-hidden="true" /> 9f2c61d0… = 9f2c61d0…
      </p>
      <p className="flex items-center gap-1.5 text-destructive">
        <XIcon className="size-3.5" aria-hidden="true" /> 9f2c61d0… ≠ 3be80f7a…
      </p>
    </div>
  )
}
