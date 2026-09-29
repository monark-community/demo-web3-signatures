import { ArrowRightIcon, FileSearchIcon } from "lucide-react"
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
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/", null, d.meta.description)
}

const H2 = "text-3xl font-bold tracking-[-0.025em] text-balance sm:text-4xl"

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.home
  const photos = [PHOTOS.offer, PHOTOS.licence, PHOTOS.approval]

  return (
    <>
      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pt-16 lg:pb-20">
          <div className="fade-up">
            <h1 className="text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4.1rem]">{h.title}</h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">{h.lead}</p>
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
          <HeroSheet locale={locale} dict={dict} />
        </div>
      </section>

      {/* 1. What leaves your device */}
      <section className="border-b bg-card/60" aria-labelledby="leaves-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="leaves-title" className={H2}>
            {h.leaves.title}
          </h2>
          <p className="mt-3 text-muted-foreground">{h.leaves.body}</p>
          <div className="mt-10">
            <HashToy />
          </div>
        </div>
      </section>

      {/* 2. Use cases */}
      <section id="use-cases" className="scroll-mt-20 border-b" aria-labelledby="uses-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="uses-title" className={H2}>
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

      {/* 3. Verify teaser */}
      <section className="border-b bg-card/60" aria-labelledby="verify-title">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 id="verify-title" className={H2}>
              {h.verify.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{h.verify.body}</p>
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

      {/* 4. FAQ */}
      <section className="border-b" aria-labelledby="faq-title">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_2fr] lg:py-20">
          <h2 id="faq-title" className={H2}>
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

      {/* 5. Closing */}
      <section aria-labelledby="closing-title">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-20">
          <div className="max-w-2xl">
            <h2 id="closing-title" className={H2}>
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
