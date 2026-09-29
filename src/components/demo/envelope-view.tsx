"use client"

import {
  ArrowLeftIcon,
  BanIcon,
  CheckCircle2Icon,
  CopyIcon,
  DownloadIcon,
  FileSearchIcon,
  Loader2Icon,
  PenLineIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"
import { toast } from "sonner"

import { DocumentSheet, type SheetSigner } from "@/components/sheet/document-sheet"
import { envelopeTone, slotTone, StatusChip } from "@/components/sheet/status-chip"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { useI18n } from "@/i18n/client"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { NETWORK, REGISTRY_ADDRESS } from "@/lib/demo/chain"
import { SAMPLE_DOCS } from "@/lib/demo/documents"
import { declineEnvelope, signEnvelope, simulateCounterparty, voidEnvelope } from "@/lib/demo/ops"
import { partyFor } from "@/lib/demo/seed"
import { useDemo } from "@/lib/demo/store"
import type { Envelope, SignerSlot } from "@/lib/demo/types"
import { formatBytes, formatDateTime, formatNumber, formatRelative, shortHex } from "@/lib/format"
import { cn } from "@/lib/utils"

import { isMe, myTurn, nameFor, receiptJson, signedCount } from "./helpers"
import { TxFeedback } from "./tx-feedback"
import { useTx } from "./use-tx"

export function EnvelopeView({ id }: { id: string }) {
  const { locale, dict } = useI18n()
  const state = useDemo()
  const envelope = state?.envelopes.find((e) => e.id === id)

  if (!state) return null
  if (!envelope)
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <p className="text-muted-foreground">{dict.app.envelope.notFound}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href={href(locale, "/app")}>{dict.app.envelope.backToList}</Link>
        </Button>
      </div>
    )
  return <EnvelopeDetail e={envelope} />
}

/** Remembers which signatures and completions happened while this page was open, so only those animate. */
function useFresh(e: Envelope) {
  const seen = useRef<{ signed: Set<string>; completed: boolean } | null>(null)
  const [fresh, setFresh] = useState<{ signed: string[]; completed: boolean }>({ signed: [], completed: false })
  useEffect(() => {
    const signedNow = e.signers.filter((s) => s.status === "signed").map((s) => s.address)
    if (!seen.current) {
      // First render: a just-created envelope still gets its first stroke drawn.
      const justNow = e.signers.filter((s) => s.signedAt && Date.now() - s.signedAt < 4000).map((s) => s.address)
      seen.current = { signed: new Set(signedNow.filter((a) => !justNow.includes(a))), completed: e.status === "completed" && justNow.length === 0 }
    }
    const newly = signedNow.filter((a) => !seen.current!.signed.has(a))
    const completedNow = e.status === "completed" && !seen.current.completed
    if (newly.length || completedNow) {
      setFresh((f) => ({ signed: [...f.signed, ...newly], completed: f.completed || completedNow }))
      newly.forEach((a) => seen.current!.signed.add(a))
      if (completedNow) seen.current.completed = true
    }
  }, [e])
  return fresh
}

function EnvelopeDetail({ e }: { e: Envelope }) {
  const { locale, dict } = useI18n()
  const d = dict.app.envelope
  const params = useSearchParams()
  const sent = params.get("sent") === "1"
  const fresh = useFresh(e)
  const tone = envelopeTone(e.status)
  const doc = e.docId ? SAMPLE_DOCS[e.docId] : undefined
  const unknown = dict.app.create.signers.unknown
  const role = (s: SignerSlot) => {
    const p = partyFor(s.address)
    return p ? `${p.title}, ${p.org}` : shortHex(s.address)
  }

  const sheetSigners: SheetSigner[] = e.signers.map((s) => ({
    key: s.address,
    name: `${nameFor(s.address, unknown)}${isMe(s.address) ? ` ${d.you}` : ""}`,
    role: role(s),
    status: s.status,
    signature: s.signature,
    draw: fresh.signed.includes(s.address),
    drawDelay: 0.1,
    statusLabel: dict.app.slot[s.status],
    meta: s.block ? `${d.signature} ${shortHex(s.signature ?? "", 6, 4)}` : undefined,
  }))

  const firstOther = e.signers.find((s) => !isMe(s.address))
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href={href(locale, "/app")} className="inline-flex min-h-9 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        {d.backToList}
      </Link>

      <header className="mt-3 flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{dict.app.categories[e.category]}</p>
          <h1 className="mt-1.5 text-2xl leading-tight font-extrabold tracking-[-0.025em] text-balance sm:text-3xl">{e.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <WalletAvatar address={e.sender} size={18} />
              {d.from} {nameFor(e.sender, unknown)}
              {isMe(e.sender) && ` ${d.you}`}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {d.sent} {formatDateTime(locale, e.createdAt)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{e.routing === "parallel" ? d.routingParallel : d.routingSequential}</span>
          </p>
        </div>
        <StatusChip tone={tone.tone} icon={tone.icon} label={dict.app.status[e.status]} className="self-start px-2.5 py-1 text-sm sm:self-auto" />
      </header>

      {sent && (
        <p role="status" className="fade-up mt-4 flex items-center gap-2 rounded-sm border border-success/40 bg-success/8 px-3 py-2 text-sm font-medium text-success">
          <CheckCircle2Icon className="size-4 shrink-0" aria-hidden="true" />
          {e.status === "completed" ? dict.app.create.doneAllSigned : t(dict.app.create.done, { name: firstOther ? nameFor(firstOther.address, unknown) : "" })}
        </p>
      )}

      {e.message && (
        <blockquote className="mt-5 border-l-2 border-primary pl-4 text-sm italic text-muted-foreground">
          “{e.message}” — {nameFor(e.sender, unknown)}
        </blockquote>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        <div className="min-w-0 space-y-6">
          <DocumentSheet
            heading={e.title}
            subheading={`${e.fileName} · ${formatBytes(locale, e.fileSize)}`}
            text={doc?.text}
            textLabel={d.preview}
            maxTextLines={16}
            file={doc ? undefined : { name: e.fileName, size: formatBytes(locale, e.fileSize), note: d.filePrivate }}
            hash={e.hash}
            hashLabel={d.fingerprint}
            signers={sheetSigners}
            seal={
              e.status === "completed"
                ? {
                    label: d.action.completedTitle,
                    sublabel: `${dict.home.sheet.block} ${formatNumber(locale, e.signers.reduce((m, s) => Math.max(m, s.block ?? 0), 0))}`,
                    press: fresh.completed,
                    delay: 0.9,
                  }
                : undefined
            }
          />
          <AuditTrail e={e} />
        </div>

        <div className="min-w-0 space-y-6">
          <ActionPanel e={e} />
          <SignerList e={e} />
          <ProofPanel e={e} />
        </div>
      </div>
    </div>
  )
}

function ActionPanel({ e }: { e: Envelope }) {
  const { dict } = useI18n()
  const a = dict.app.envelope.action
  const p = dict.app.envelope.progress
  const unknown = dict.app.create.signers.unknown
  const sign = useTx()
  const [lastAction, setLastAction] = useState<"sign" | "decline" | "void">("sign")
  const [declineOpen, setDeclineOpen] = useState(false)
  const [voidOpen, setVoidOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [reasonError, setReasonError] = useState(false)
  const [simulating, setSimulating] = useState<string | null>(null)
  const reasonId = useId()

  const mine = e.signers.find((s) => isMe(s.address))
  const turn = myTurn(e)
  const nextOther = e.signers.find((s) => s.status === "pending" && !isMe(s.address))
  const waitingOn = e.signers.filter((s) => s.status === "pending" && !isMe(s.address)).map((s) => nameFor(s.address, unknown))
  const blocker = mine?.status === "waiting" ? e.signers.find((s) => s.status === "pending") : undefined

  const doSign = () => {
    setLastAction("sign")
    void sign.run((onPhase) => signEnvelope(e.id, onPhase))
  }
  const doDecline = async () => {
    if (reason.trim().length < 3) return setReasonError(true)
    setDeclineOpen(false)
    setLastAction("decline")
    await sign.run((onPhase) => declineEnvelope(e.id, reason.trim(), onPhase))
  }
  const doVoid = async () => {
    setVoidOpen(false)
    setLastAction("void")
    await sign.run((onPhase) => voidEnvelope(e.id, onPhase), false)
  }
  const doSimulate = async () => {
    if (!nextOther) return
    setSimulating(nameFor(nextOther.address, unknown))
    await simulateCounterparty(e.id)
    setSimulating(null)
  }

  const labels = {
    signing: p.signing,
    prompt: p.prompt,
    pending: p.pending,
    confirmed: lastAction === "sign" ? p.signed : lastAction === "decline" ? p.declined : p.voided,
    rejected: p.rejected,
    failed: p.failed,
    retry: p.retry,
  }
  const retry = lastAction === "sign" ? doSign : lastAction === "decline" ? () => setDeclineOpen(true) : doVoid

  let body: React.ReactNode
  if (e.status === "completed") {
    body = (
      <div className="flex items-start gap-3">
        <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
        <div>
          <h2 className="font-bold">{a.completedTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t(a.completedBody, { n: e.signers.length })}</p>
        </div>
      </div>
    )
  } else if (e.status === "declined") {
    const who = e.signers.find((s) => s.status === "declined")
    body = (
      <div className="flex items-start gap-3">
        <XCircleIcon className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div>
          <h2 className="font-bold">{a.declinedTitle}</h2>
          {who && (
            <p className="mt-1 text-sm text-muted-foreground">
              {nameFor(who.address, unknown)}: “{who.reason}”
            </p>
          )}
        </div>
      </div>
    )
  } else if (e.status === "voided") {
    body = (
      <div className="flex items-start gap-3">
        <BanIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <h2 className="font-bold">{a.voidedTitle}</h2>
      </div>
    )
  } else if (turn) {
    body = (
      <>
        <h2 className="flex items-center gap-2 font-bold">
          <PenLineIcon className="size-4 text-primary" aria-hidden="true" />
          {a.yourTurn}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{a.yourTurnBody}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" size="lg" onClick={() => setDeclineOpen(true)} disabled={sign.busy}>
            {a.decline}
          </Button>
          <Button type="button" size="lg" onClick={doSign} disabled={sign.busy}>
            {sign.busy && <Loader2Icon className="animate-spin" aria-hidden="true" />}
            {a.sign}
          </Button>
        </div>
        <p className="mt-3 text-[0.7rem] text-muted-foreground">{dict.common.valueNotice}</p>
      </>
    )
  } else {
    body = (
      <>
        <p className="text-sm">
          {blocker
            ? t(a.notYet, { name: nameFor(blocker.address, unknown) })
            : mine?.status === "signed"
              ? a.signedByYou
              : null}{" "}
          {waitingOn.length > 0 && <span className="text-muted-foreground">{t(a.waitingOthers, { names: waitingOn.join(", ") })}</span>}
        </p>
      </>
    )
  }

  return (
    <section aria-label={a.yourTurn} className="rounded-sm border bg-card p-5">
      {body}
      <TxFeedback view={sign.view} labels={labels} onRetry={retry} className="mt-4" />

      {e.status === "awaiting" && nextOther && !sign.busy && (
        <div className="mt-4 border-t border-dashed pt-4">
          <Button type="button" variant="secondary" onClick={doSimulate} disabled={!!simulating} className="w-full">
            {simulating ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <UsersIcon aria-hidden="true" />}
            {simulating ? t(a.simulating, { name: simulating }) : t(a.simulate, { name: nameFor(nextOther.address, unknown) })}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">{a.simulateHint}</p>
        </div>
      )}

      {e.status === "awaiting" && isMe(e.sender) && !sign.busy && (
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setVoidOpen(true)}>
            <BanIcon aria-hidden="true" />
            {a.void}
          </Button>
        </div>
      )}

      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent closeLabel={dict.common.close}>
          <DialogHeader>
            <DialogTitle>{a.declineTitle}</DialogTitle>
            <DialogDescription>{a.declineBody}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={reasonId}>{a.reason}</Label>
            <Textarea
              id={reasonId}
              value={reason}
              onChange={(ev) => {
                setReason(ev.target.value)
                setReasonError(false)
              }}
              placeholder={a.reasonPlaceholder}
              rows={3}
              maxLength={280}
              aria-invalid={reasonError ? true : undefined}
              aria-describedby={reasonError ? `${reasonId}-err` : undefined}
            />
            {reasonError && (
              <p id={`${reasonId}-err`} className="text-sm text-destructive">
                {a.reasonRequired}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeclineOpen(false)}>
              {dict.common.cancel}
            </Button>
            <Button type="button" variant="destructive" onClick={doDecline}>
              {a.declineConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={voidOpen} onOpenChange={setVoidOpen}>
        <DialogContent closeLabel={dict.common.close}>
          <DialogHeader>
            <DialogTitle>{a.voidTitle}</DialogTitle>
            <DialogDescription>{a.voidBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setVoidOpen(false)}>
              {dict.common.cancel}
            </Button>
            <Button type="button" variant="destructive" onClick={doVoid}>
              {a.voidConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function SignerList({ e }: { e: Envelope }) {
  const { locale, dict } = useI18n()
  const d = dict.app.envelope
  const unknown = dict.app.create.signers.unknown
  return (
    <section aria-labelledby="signers-title">
      <h2 id="signers-title" className="eyebrow mb-2">
        {d.signers} · {signedCount(e)}/{e.signers.length}
      </h2>
      <ol className="divide-y rounded-sm border bg-card">
        {e.signers.map((s, i) => {
          const tone = slotTone(s.status)
          return (
            <li key={s.address} className="flex items-start gap-3 p-3">
              {e.routing === "sequential" && <span className="mt-1.5 w-4 font-mono text-xs text-muted-foreground">{i + 1}</span>}
              <WalletAvatar address={s.address} size={28} className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {nameFor(s.address, unknown)} {isMe(s.address) && <span className="font-normal text-muted-foreground">{d.you}</span>}
                </p>
                <WalletAddress address={s.address} className="text-xs text-muted-foreground" />
                {s.signedAt && s.block && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t(s.status === "declined" ? d.declinedAt : d.signedAt, {
                      when: formatRelative(locale, s.signedAt),
                      block: formatNumber(locale, s.block),
                    })}
                  </p>
                )}
                {s.reason && <p className="mt-1 text-xs italic text-muted-foreground">“{s.reason}”</p>}
              </div>
              <StatusChip tone={tone.tone} icon={tone.icon} label={dict.app.slot[s.status]} />
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function ProofPanel({ e }: { e: Envelope }) {
  const { locale, dict } = useI18n()
  const d = dict.app.envelope
  const r = d.receipt

  const download = () => {
    try {
      const blob = new Blob([receiptJson(e, REGISTRY_ADDRESS, NETWORK.chainId)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `signchain-receipt-${e.hash.slice(0, 12)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      // Downloads can be blocked (e.g. in some in-app browsers); nothing else to do.
    }
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(e.hash)
      toast.success(dict.common.copied)
    } catch {
      // Clipboard unavailable (insecure context); the fingerprint is visible on the page anyway.
    }
  }

  return (
    <section aria-labelledby="proof-title" className="rounded-sm border bg-card p-5">
      <h2 id="proof-title" className="eyebrow">
        {r.title}
      </h2>
      <dl className="mt-3 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{d.anchor}</dt>
          <dd className="text-right font-mono text-xs">
            #{formatNumber(locale, e.anchor.block)} · {shortHex(e.anchor.tx, 4, 4)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{d.storage}</dt>
          <dd className="text-right text-xs">{e.storage === "hash" ? d.storageHash : d.storageIpfs}</dd>
        </div>
        {e.cid && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">CID</dt>
            <dd className="min-w-0 truncate text-right font-mono text-xs" title={e.cid}>
              {e.cid.slice(0, 14)}…{e.cid.slice(-6)}
            </dd>
          </div>
        )}
      </dl>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Button type="button" variant="outline" onClick={download}>
          <DownloadIcon aria-hidden="true" />
          {r.download}
        </Button>
        <Button asChild variant="outline">
          <Link href={`${href(locale, "/verify")}?hash=${e.hash}`}>
            <FileSearchIcon aria-hidden="true" />
            {r.verify}
          </Link>
        </Button>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={copy} className="mt-2">
        <CopyIcon aria-hidden="true" />
        {r.copyHash}
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">{r.hint}</p>
    </section>
  )
}

function AuditTrail({ e }: { e: Envelope }) {
  const { locale, dict } = useI18n()
  const a = dict.app.envelope.audit
  const unknown = dict.app.create.signers.unknown
  const events = [...e.events].sort((x, y) => y.at - x.at)
  return (
    <section aria-labelledby="audit-title">
      <h2 id="audit-title" className="eyebrow mb-2">
        {a.title}
      </h2>
      <ol className="relative space-y-4 border-l border-rule pl-5">
        {events.map((ev, i) => (
          <li key={`${ev.kind}-${ev.at}-${i}`} className="relative">
            <span
              className={cn(
                "absolute top-1.5 -left-[1.62rem] size-2.5 rounded-full border-2 border-background",
                ev.kind === "completed" || ev.kind === "signed" ? "bg-success" : ev.kind === "declined" || ev.kind === "voided" ? "bg-destructive" : "bg-foreground/50"
              )}
              aria-hidden="true"
            />
            <p className="text-sm font-medium">
              {t(a[ev.kind], { name: ev.actor ? nameFor(ev.actor, unknown) : "" })}
            </p>
            <p className="font-mono text-[0.7rem] text-muted-foreground">
              {formatDateTime(locale, ev.at)}
              {ev.block ? ` · ${t(a.block, { block: formatNumber(locale, ev.block) })}` : ""}
              {ev.kind === "pinned" && ev.note ? ` · ${ev.note.slice(0, 16)}…` : ""}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
