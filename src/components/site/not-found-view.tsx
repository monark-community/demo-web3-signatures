import Link from "next/link"

import { Fingerprint } from "@/components/sheet/fingerprint"
import { Button } from "@/components/ui/button"
import { href, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"
import { sha256Text } from "@/lib/demo/sha256"

export function NotFoundView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const d = dict.notFound
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="eyebrow text-destructive">{d.code}</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">{d.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{d.body}</p>
      <div className="mt-8 rounded-sm border border-destructive/30 bg-card p-4 opacity-80">
        <Fingerprint hash={sha256Text("404")} />
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href={href(locale)}>{d.home}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={href(locale, "/app")}>{d.app}</Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href={href(locale, "/verify")}>{d.verify}</Link>
        </Button>
      </div>
    </div>
  )
}
