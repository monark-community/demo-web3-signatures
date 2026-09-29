"use client"

import { ArrowRightIcon, BanIcon, CheckCircle2Icon, ClockIcon, DownloadIcon, FileTextIcon, Loader2Icon, SearchXIcon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"

import { Fingerprint } from "@/components/sheet/fingerprint"
import { SignatureStroke } from "@/components/sheet/signature-stroke"
import { slotTone, StatusChip } from "@/components/sheet/status-chip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { useI18n } from "@/i18n/client"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { wait } from "@/lib/demo/chain"
import { ALTERED_CHANGE, SAMPLE_DOCS } from "@/lib/demo/documents"
import { verifyHash } from "@/lib/demo/ops"
import { normaliseHash, sha256File, sha256Text } from "@/lib/demo/sha256"
import { initDemo, useDemo } from "@/lib/demo/store"
import type { VerifyResult } from "@/lib/demo/types"
import { formatDateTime, formatNumber, shortHex } from "@/lib/format"
import { cn } from "@/lib/utils"

import { FileDrop } from "./file-drop"
import { nameFor } from "./helpers"

const MAX_BYTES = 25 * 1024 * 1024

interface Checked {
  result: VerifyResult
  source: { kind: "file"; name: string } | { kind: "hash" }
  /** Set when the altered sample was used, to show the textual change. */
  altered?: boolean
}

export function VerifyView() {
  const { locale, dict } = useI18n()
  const v = dict.verify
  const state = useDemo()
  const params = useSearchParams()
  const pasteId = useId()
  const [paste, setPaste] = useState("")
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [busy, setBusy] = useState<"hashing" | "checking" | null>(null)
  const [checked, setChecked] = useState<Checked | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initDemo()
  }, [])

  const lookup = async (hash: string, source: Checked["source"], altered = false) => {
    setBusy("checking")
    setChecked(null)
    await wait(450)
    setChecked({ result: verifyHash(hash, source.kind === "file" ? source.name : undefined), source, altered })
    setBusy(null)
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }

  // Deep link from an envelope: /verify?hash=…
  const queryHash = params.get("hash")
  const ranQuery = useRef(false)
  useEffect(() => {
    if (!state || ranQuery.current || !queryHash) return
    ranQuery.current = true
    const h = normaliseHash(queryHash)
    if (h) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off sync from the URL
      setPaste(h)
      void lookup(h, { kind: "hash" })
    }
  }, [state, queryHash])

  const onFile = async (file: File) => {
    setFileError(null)
    if (file.size === 0) return setFileError(v.errors.empty)
    if (file.size > MAX_BYTES) return setFileError(v.errors.tooBig)
    setBusy("hashing")
    try {
      const hash = await sha256File(file)
      await lookup(hash, { kind: "file", name: file.name })
    } catch {
      setBusy(null)
      setFileError(v.errors.read)
    }
  }

  const onPaste = () => {
    const h = normaliseHash(paste)
    if (!h) return setPasteError(v.errors.invalidHash)
    setPasteError(null)
    void lookup(h, { kind: "hash" })
  }

  const trySample = (id: "licence-duval" | "licence-duval-altered" | "offer-reyes") => {
    const doc = SAMPLE_DOCS[id]!
    const hash = sha256Text(doc.text)
    if (id === "offer-reyes") {
      setPaste(hash)
      void lookup(hash, { kind: "hash" })
    } else void lookup(hash, { kind: "file", name: doc.fileName }, id === "licence-duval-altered")
  }

  const downloadSample = (id: string) => {
    try {
      const doc = SAMPLE_DOCS[id]!
      const url = URL.createObjectURL(new Blob([doc.text], { type: "text/plain;charset=utf-8" }))
      const a = document.createElement("a")
      a.href = url
      a.download = doc.fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      // Download blocked; the "try" buttons still work.
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="max-w-2xl">
        <h1 className="text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">{v.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{v.lead}</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <FileDrop onFile={onFile} title={v.drop} hint={v.dropHint} button={v.choose} />
          {fileError && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {fileError}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            {v.or}
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2">
            <label htmlFor={pasteId} className="text-sm font-semibold">
              {v.pasteLabel}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id={pasteId}
                value={paste}
                onChange={(e) => {
                  setPaste(e.target.value)
                  setPasteError(null)
                }}
                onKeyDown={(e) => e.key === "Enter" && onPaste()}
                placeholder={v.pastePlaceholder}
                className="h-11 bg-card font-mono text-xs"
                spellCheck={false}
                autoComplete="off"
                aria-invalid={pasteError ? true : undefined}
                aria-describedby={pasteError ? `${pasteId}-err` : undefined}
              />
              <Button type="button" size="lg" className="h-11" onClick={onPaste} disabled={!!busy}>
                {v.check}
              </Button>
            </div>
            {pasteError && (
              <p id={`${pasteId}-err`} className="text-sm text-destructive">
                {pasteError}
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-sm border bg-card p-5">
            <h2 className="eyebrow">{v.samplesTitle}</h2>
            <ul className="mt-3 divide-y">
              {(
                [
                  ["licence-duval", v.samples.original, true],
                  ["licence-duval-altered", v.samples.altered, true],
                  ["offer-reyes", v.samples.partial, false],
                ] as const
              ).map(([id, label, dl]) => (
                <li key={id} className="flex items-center justify-between gap-2 py-2">
                  <Button type="button" variant="link" className="h-auto justify-start px-0 py-1.5 text-left whitespace-normal" onClick={() => trySample(id)} disabled={!!busy || !state}>
                    <FileTextIcon aria-hidden="true" />
                    {label}
                  </Button>
                  {dl && (
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => downloadSample(id)} aria-label={`${v.download}: ${label}`} title={v.download}>
                      <DownloadIcon aria-hidden="true" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <Link href={href(locale, "/how-it-works")} className="inline-flex items-center gap-1.5 px-1 text-sm font-medium text-primary hover:underline">
            {v.how.title}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </aside>
      </div>

      <div ref={resultRef} className="scroll-mt-24">
        {busy && (
          <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            {busy === "hashing" ? v.hashing : `${v.check}…`}
          </p>
        )}
        {checked && !busy && <Result checked={checked} onAgain={() => setChecked(null)} />}
      </div>
    </div>
  )
}

function Result({ checked, onAgain }: { checked: Checked; onAgain: () => void }) {
  const { locale, dict } = useI18n()
  const r = dict.verify.result
  const unknown = dict.app.create.signers.unknown
  const { result } = checked

  if (result.kind === "none") {
    const near = result.nearest
    const diffCount = near ? result.hash.split("").filter((c, i) => c !== near.hash[i]).length : 0
    return (
      <section role="alert" className="fade-up mt-10 rounded-sm border border-destructive/40 bg-card p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <SearchXIcon className="mt-0.5 size-6 shrink-0 text-destructive" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-destructive">{near ? r.nearTitle : r.noneTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{near ? t(r.nearBody, { n: diffCount }) : r.noneBody}</p>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          {near && (
            <div className="rounded-sm border border-rule bg-paper p-3">
              <Fingerprint hash={near.hash} label={`${r.signed} · ${near.title}`} />
            </div>
          )}
          <div className="rounded-sm border border-destructive/40 bg-paper p-3">
            <Fingerprint hash={result.hash} label={r.yours} diff={near?.hash} print={!!near} />
          </div>
          {checked.altered && (
            <p className="text-sm">
              <span className="text-muted-foreground">{r.changeFound}</span>{" "}
              <span className="font-mono line-through decoration-destructive">{ALTERED_CHANGE.before}</span> →{" "}
              <span className="rounded-xs bg-destructive/12 px-1 font-mono font-semibold text-destructive">{ALTERED_CHANGE.after}</span>
            </p>
          )}
        </div>
        <Button type="button" variant="outline" className="mt-6" onClick={onAgain}>
          {r.again}
        </Button>
      </section>
    )
  }

  const e = result.envelope
  const signed = e.signers.filter((s) => s.status === "signed").length
  const head =
    e.status === "completed"
      ? { icon: CheckCircle2Icon, tone: "text-success", border: "border-success/50", title: r.matchTitle, body: t(r.matchBody, { n: signed, total: e.signers.length }) }
      : e.status === "awaiting"
        ? { icon: ClockIcon, tone: "text-warning", border: "border-warning/50", title: r.partialTitle, body: t(r.partialBody, { n: signed, total: e.signers.length }) }
        : e.status === "declined"
          ? { icon: XCircleIcon, tone: "text-destructive", border: "border-destructive/40", title: r.declinedTitle, body: r.declinedBody }
          : { icon: BanIcon, tone: "text-muted-foreground", border: "border-border", title: r.voidedTitle, body: r.voidedBody }
  const Icon = head.icon

  return (
    <section role="status" className={cn("fade-up sheet mt-10 border-2 p-5 sm:p-7", head.border)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 size-6 shrink-0", head.tone)} aria-hidden="true" />
        <div>
          <h2 className={cn("text-xl font-bold", head.tone)}>{head.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{head.body}</p>
        </div>
      </div>
      <dl className="mt-6 grid gap-4 border-t border-rule pt-5 text-sm sm:grid-cols-3">
        <div className="sm:col-span-3">
          <dt className="eyebrow">{r.document}</dt>
          <dd className="mt-1 font-semibold">{e.title}</dd>
          <dd className="font-mono text-xs text-muted-foreground">{e.fileName}</dd>
        </div>
        <div className="sm:col-span-3">
          <dt className="sr-only">{r.fingerprint}</dt>
          <dd className="rounded-sm border border-rule bg-background/50 p-3">
            <Fingerprint hash={e.hash} label={r.fingerprint} />
          </dd>
        </div>
        <div>
          <dt className="eyebrow">{r.registered}</dt>
          <dd className="mt-1">{formatDateTime(locale, e.anchor.at)}</dd>
          <dd className="font-mono text-xs text-muted-foreground">
            #{formatNumber(locale, e.anchor.block)} · {shortHex(e.anchor.tx, 4, 4)}
          </dd>
        </div>
        <div>
          <dt className="eyebrow">{r.storage}</dt>
          <dd className="mt-1">{e.storage === "hash" ? dict.app.envelope.storageHash : dict.app.envelope.storageIpfs}</dd>
        </div>
      </dl>
      <h3 className="eyebrow mt-6">{r.signers}</h3>
      <ul className="mt-2 grid gap-3 sm:grid-cols-2">
        {e.signers.map((s) => {
          const tone = slotTone(s.status)
          return (
            <li key={s.address} className="rounded-sm border bg-card p-3">
              <div className="flex items-start gap-2.5">
                <WalletAvatar address={s.address} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{nameFor(s.address, unknown)}</p>
                  <WalletAddress address={s.address} className="text-xs text-muted-foreground" />
                </div>
                <StatusChip tone={tone.tone} icon={tone.icon} label={dict.app.slot[s.status]} />
              </div>
              {s.status === "signed" && s.signature && (
                <div className="mt-2 flex items-end justify-between gap-2">
                  <SignatureStroke signature={s.signature} className="h-9 w-32" />
                  <p className="text-right font-mono text-[0.68rem] text-muted-foreground">
                    {s.signedAt ? formatDateTime(locale, s.signedAt) : ""}
                    <br />#{s.block ? formatNumber(locale, s.block) : ""}
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link href={href(locale, `/app/envelopes/${e.id}`)}>{r.openEnvelope}</Link>
        </Button>
        <Button type="button" variant="outline" onClick={onAgain}>
          {r.again}
        </Button>
      </div>
    </section>
  )
}
