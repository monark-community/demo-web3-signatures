import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).credits
  return pageMetadata(locale, "/credits", d.metaTitle, d.lead)
}

export default async function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale).credits
  const items = [
    { photo: PHOTOS.offer, where: d.where.offer },
    { photo: PHOTOS.licence, where: d.where.licence },
    { photo: PHOTOS.approval, where: d.where.approval },
  ]
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-4xl font-extrabold tracking-[-0.03em]">{d.title}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{d.lead}</p>
      <ul className="mt-10 divide-y border-y">
        {items.map(({ photo, where }) => (
          <li key={photo.src} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-sm border sm:w-40">
              <Image src={photo.src} alt="" fill sizes="(min-width: 640px) 160px, 100vw" className="object-cover" />
            </div>
            <div className="text-sm">
              <p className="font-semibold">
                <a href={photo.page} className="hover:text-primary hover:underline" rel="noopener noreferrer" target="_blank">
                  {t(d.by, { name: photo.photographer })}
                </a>
              </p>
              <p className="mt-1">
                <a href={photo.profile} className="text-muted-foreground hover:text-primary hover:underline" rel="noopener noreferrer" target="_blank">
                  {photo.profile.replace("https://", "")}
                </a>
              </p>
              <p className="mt-1 text-muted-foreground">{t(d.usedOn, { where })}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
