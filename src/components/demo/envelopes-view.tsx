"use client"

import { FilePlus2Icon, InboxIcon, PenLineIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { envelopeTone, StatusChip } from "@/components/sheet/status-chip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/i18n/client"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { ME } from "@/lib/demo/seed"
import { useDemo } from "@/lib/demo/store"
import type { Envelope } from "@/lib/demo/types"
import { formatRelative } from "@/lib/format"
import { cn } from "@/lib/utils"

import { inBucket, isMe, lastActivity, myTurn, nameFor, signedCount, type Bucket } from "./helpers"

const BUCKETS: Bucket[] = ["needs", "waiting", "completed", "all"]

export function EnvelopesView() {
  const { locale, dict } = useI18n()
  const l = dict.app.list
  const state = useDemo()
  const [bucket, setBucket] = useState<Bucket>("needs")
  const [q, setQ] = useState("")

  const envelopes = useMemo(() => state?.envelopes ?? [], [state])
  const counts = useMemo(
    () => Object.fromEntries(BUCKETS.map((b) => [b, envelopes.filter((e) => inBucket(e, b)).length])) as Record<Bucket, number>,
    [envelopes]
  )
  const query = q.trim().toLowerCase()
  const rows = envelopes
    .filter((e) => inBucket(e, bucket))
    .filter((e) => {
      if (!query) return true
      const names = e.signers.map((s) => nameFor(s.address, "")).join(" ")
      return `${e.title} ${e.fileName} ${names}`.toLowerCase().includes(query)
    })
    .sort((a, b) => lastActivity(b) - lastActivity(a))

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{t(l.greeting, { name: ME.name.split(" ")[0]! })}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(l.summary, { needs: counts.needs, waiting: counts.waiting, done: counts.completed })}
          </p>
        </div>
        <Button asChild size="lg" className="self-start sm:self-auto">
          <Link href={href(locale, "/app/new")}>
            <FilePlus2Icon aria-hidden="true" />
            {l.new}
          </Link>
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-b md:flex-row md:items-end md:justify-between">
        <div role="tablist" aria-label={dict.app.nav.envelopes} className="-mb-px flex gap-1 overflow-x-auto">
          {BUCKETS.map((b) => (
            <button
              key={b}
              type="button"
              role="tab"
              id={`tab-${b}`}
              aria-selected={bucket === b}
              aria-controls="envelope-panel"
              onClick={() => setBucket(b)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors",
                bucket === b ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {l.tabs[b]}
              <span
                className={cn(
                  "rounded-full px-1.5 font-mono text-[0.7rem]",
                  b === "needs" && counts.needs > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {counts[b]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative mb-3 w-full md:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label={l.search}
            placeholder={l.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 bg-card pl-9"
          />
        </div>
      </div>

      <div id="envelope-panel" role="tabpanel" aria-labelledby={`tab-${bucket}`}>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <InboxIcon className="size-8 text-muted-foreground" strokeWidth={1.25} aria-hidden="true" />
            <p className="text-muted-foreground">{query ? t(l.empty.search, { q }) : l.empty[bucket]}</p>
            {!query && bucket !== "needs" && (
              <Button asChild variant="outline" size="sm">
                <Link href={href(locale, "/app/new")}>{l.new}</Link>
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map((e) => (
              <EnvelopeRow key={e.id} e={e} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function EnvelopeRow({ e }: { e: Envelope }) {
  const { locale, dict } = useI18n()
  const l = dict.app.list
  const mine = isMe(e.sender)
  const others = e.signers.filter((s) => !isMe(s.address)).map((s) => nameFor(s.address, dict.app.create.signers.unknown))
  const party = mine ? t(l.to, { names: others.join(", ") }) : t(l.from, { name: nameFor(e.sender, "") })
  const turn = myTurn(e)
  const tone = envelopeTone(e.status)
  return (
    <li>
      <Link
        href={href(locale, `/app/envelopes/${e.id}`)}
        className="group grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 sm:px-2 hover:bg-card"
      >
        <div className="min-w-0">
          <p className="eyebrow">{dict.app.categories[e.category]}</p>
          <p className="mt-1 truncate font-semibold group-hover:text-primary">{e.title}</p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{party}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
          <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="flex gap-0.5" aria-hidden="true">
              {e.signers.map((s, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-4 rounded-full",
                    s.status === "signed" ? "bg-success" : s.status === "declined" ? "bg-destructive" : "bg-border"
                  )}
                />
              ))}
            </span>
            {t(l.signedCount, { n: signedCount(e), total: e.signers.length })}
          </span>
          {turn ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              <PenLineIcon className="size-3.5" aria-hidden="true" />
              {l.yourTurn}
            </span>
          ) : (
            <StatusChip tone={tone.tone} icon={tone.icon} label={dict.app.status[e.status]} />
          )}
          <span className="w-full text-xs text-muted-foreground sm:w-28 sm:text-right">{formatRelative(locale, lastActivity(e))}</span>
        </div>
      </Link>
    </li>
  )
}
