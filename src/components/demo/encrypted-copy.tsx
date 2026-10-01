"use client"

import { CheckCircle2Icon, CopyIcon, DownloadIcon, EyeIcon, Loader2Icon, LockIcon, PenLineIcon, ShieldCheckIcon, WalletIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { SignatureStroke } from "@/components/sheet/signature-stroke"
import { SealMark } from "@/components/site/seal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { WalletAvatar } from "@/components/ui/wallet"
import { useI18n } from "@/i18n/client"
import { t } from "@/i18n/t"
import { NETWORK, wait } from "@/lib/demo/chain"
import { SAMPLE_DOCS } from "@/lib/demo/documents"
import { connectWallet } from "@/lib/demo/ops"
import { partyFor } from "@/lib/demo/seed"
import { useDemo } from "@/lib/demo/store"
import type { Address, Envelope } from "@/lib/demo/types"
import { formatBytes, formatDateTime, formatNumber, shortHex } from "@/lib/format"
import { cn } from "@/lib/utils"

import { isMe, nameFor } from "./helpers"
import { InfoTip } from "./info-tip"

/** AES-GCM adds a 12-byte IV and a 16-byte tag to the plaintext. */
const GCM_OVERHEAD = 28

/** Everyone holding a wrapped copy of the file key: the sender, then each signer. */
export function keyHolders(e: Envelope): Address[] {
  const all = [e.sender, ...e.signers.map((s) => s.address)]
  return all.filter((a, i) => all.findIndex((b) => b.toLowerCase() === a.toLowerCase()) === i)
}

type Opening = "fetching" | "unwrapping" | "decrypting" | null

/**
 * The encrypted IPFS copy of an envelope: where it's pinned, who holds a key,
 * and, for a connected party, a decrypt-and-view action. Only rendered for
 * envelopes stored with `storage: "ipfs"`.
 */
export function EncryptedCopy({ e, className }: { e: Envelope; className?: string }) {
  const { locale, dict } = useI18n()
  const d = dict.app.envelope
  const x = d.ipfs
  const unknown = dict.app.create.signers.unknown
  const state = useDemo()
  const [opening, setOpening] = useState<Opening>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  if (!e.cid) return null
  const cid = e.cid
  const holders = keyHolders(e)
  const pinnedAt = e.events.find((ev) => ev.kind === "pinned")?.at ?? e.createdAt
  const wallet = state?.wallet.status ?? "disconnected"
  const iHoldKey = holders.some(isMe)

  const roleOf = (a: Address) => {
    const slot = e.signers.find((s) => s.address.toLowerCase() === a.toLowerCase())
    if (slot?.status === "signed") return x.roleSigned
    if (slot?.status === "declined") return x.roleDeclined
    if (slot) return x.roleReview
    return x.roleSender
  }

  const copyCid = async () => {
    try {
      await navigator.clipboard.writeText(cid)
      toast.success(dict.common.copied)
    } catch {
      // Clipboard unavailable (insecure context); the CID is selectable on the page.
    }
  }

  const open = async () => {
    // Fetch the ciphertext, unwrap the file key with the wallet, decrypt, re-hash.
    setOpening("fetching")
    await wait(600)
    setOpening("unwrapping")
    await wait(700)
    setOpening("decrypting")
    await wait(500)
    setOpening(null)
    setViewerOpen(true)
  }

  return (
    <section aria-labelledby={`ipfs-${e.id}`} className={cn("rounded-sm border bg-card p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={`ipfs-${e.id}`} className="eyebrow flex items-center gap-1.5">
          <LockIcon className="size-3.5" aria-hidden="true" />
          {x.title}
        </h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success">
            <CheckCircle2Icon className="size-3.5" aria-hidden="true" />
            {x.pinned}
          </span>
          <InfoTip text={x.hint} label={x.title} />
        </div>
      </div>

      <dl className="mt-3 space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">{x.cid}</dt>
          <dd className="flex min-w-0 items-center gap-1">
            <span className="min-w-0 truncate font-mono text-xs" title={cid}>
              {cid.slice(0, 14)}…{cid.slice(-6)}
            </span>
            <Button type="button" variant="ghost" size="icon-sm" onClick={copyCid} aria-label={x.copyCid} title={x.copyCid}>
              <CopyIcon aria-hidden="true" />
            </Button>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{x.cipher}</dt>
          <dd className="text-right text-xs">{x.cipherValue}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{x.size}</dt>
          <dd className="text-right text-xs">{formatBytes(locale, e.fileSize + GCM_OVERHEAD)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{x.pinnedAt}</dt>
          <dd className="text-right text-xs">{formatDateTime(locale, pinnedAt)}</dd>
        </div>
      </dl>

      <h3 className="eyebrow mt-5">
        {x.access} · {holders.length}
      </h3>
      <ul className="mt-2 space-y-2">
        {holders.map((a) => (
          <li key={a} className="flex items-center gap-2.5 text-sm">
            <WalletAvatar address={a} size={22} />
            <span className="min-w-0 flex-1 truncate">
              <span className="font-medium">{nameFor(a, unknown)}</span>
              {wallet === "connected" && isMe(a) && <span className="text-muted-foreground"> {d.you}</span>}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">{roleOf(a)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">{x.accessNote}</p>

      <div className="mt-4 border-t border-dashed pt-4">
        {wallet !== "connected" ? (
          <>
            <Button type="button" className="w-full" onClick={() => void connectWallet()} disabled={wallet === "connecting"}>
              {wallet === "connecting" ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <WalletIcon aria-hidden="true" />}
              {wallet === "connecting" ? x.connecting : x.connect}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">{x.connectBody}</p>
          </>
        ) : !iHoldKey ? (
          <p role="status" className="flex items-start gap-2 text-sm text-muted-foreground">
            <LockIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {x.noAccess}
          </p>
        ) : (
          <>
            <Button type="button" variant="outline" className="w-full" onClick={open} disabled={!!opening}>
              {opening ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
              {x.open}
            </Button>
            {opening && (
              <p role="status" className="mt-2 text-center text-xs text-muted-foreground">
                {x[opening]}
              </p>
            )}
          </>
        )}
      </div>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent closeLabel={dict.common.close} className="max-h-[calc(100dvh-2rem)] grid-cols-[minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DecryptedViewer e={e} />
        </DialogContent>
      </Dialog>
    </section>
  )
}

/** A PDF-viewer-style rendering of the decrypted file, with its signatures stamped in. */
function DecryptedViewer({ e }: { e: Envelope }) {
  const { locale, dict } = useI18n()
  const d = dict.app.envelope
  const v = d.ipfs.viewer
  const unknown = dict.app.create.signers.unknown
  const doc = e.docId ? SAMPLE_DOCS[e.docId] : undefined
  const lastBlock = e.signers.reduce((m, s) => Math.max(m, s.block ?? 0), 0)

  const download = () => {
    if (!doc) return
    try {
      const url = URL.createObjectURL(new Blob([doc.text], { type: "text/plain;charset=utf-8" }))
      const a = document.createElement("a")
      a.href = url
      a.download = doc.fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      // Download blocked; the page is still readable.
    }
  }

  return (
    <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
      {/* Viewer chrome */}
      <div className="flex items-center gap-3 border-b bg-muted/60 py-2.5 pr-12 pl-4">
        <LockIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <DialogTitle className="truncate font-mono text-sm font-medium">{e.fileName}</DialogTitle>
          <DialogDescription className="sr-only">{v.title}</DialogDescription>
        </div>
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{v.page}</span>
        <Button type="button" variant="ghost" size="sm" onClick={download} disabled={!doc}>
          <DownloadIcon aria-hidden="true" />
          <span className="max-sm:sr-only">{v.download}</span>
        </Button>
      </div>
      <p className="flex items-center gap-2 border-b border-success/30 bg-success/8 px-4 py-2 text-xs font-medium text-success">
        <ShieldCheckIcon className="size-4 shrink-0" aria-hidden="true" />
        {v.matches}
      </p>

      {/* The page */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/50 p-3 sm:p-6">
        <article className="mx-auto max-w-[42rem] bg-white px-6 py-8 text-neutral-900 shadow-[0_1px_3px_rgb(0_0_0/0.12),0_8px_24px_rgb(0_0_0/0.08)] sm:px-12 sm:py-12">
          {doc ? (
            <pre className="font-serif text-[0.82rem] leading-relaxed whitespace-pre-wrap sm:text-[0.9rem]">{doc.text.trim()}</pre>
          ) : (
            <p className="rounded-sm border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">{t(v.noPreview, { name: e.fileName })}</p>
          )}

          <ol className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {e.signers.map((s) => {
              const p = partyFor(s.address)
              return (
                <li key={s.address} className="min-w-0">
                  <div className="flex h-14 items-end">
                    {s.status === "signed" && s.signature ? (
                      <SignatureStroke signature={s.signature} className="-mb-2 [&_path]:stroke-neutral-900" />
                    ) : s.status === "declined" ? (
                      <span className="mb-1 font-mono text-xs tracking-widest text-red-700 uppercase line-through">{v.declined}</span>
                    ) : (
                      <span className="mb-1 inline-flex items-center gap-1.5 text-xs text-neutral-500">
                        <PenLineIcon className="size-3.5" aria-hidden="true" />
                        {v.awaiting}
                      </span>
                    )}
                  </div>
                  <div className="border-t border-neutral-800 pt-1.5">
                    <p className="truncate text-sm font-semibold">{nameFor(s.address, unknown)}</p>
                    <p className="truncate text-xs text-neutral-600">{p ? `${p.title}, ${p.org}` : shortHex(s.address)}</p>
                    {s.signedAt && s.block && (
                      <p className="mt-0.5 truncate font-mono text-[0.65rem] text-neutral-500">
                        {formatDateTime(locale, s.signedAt)} · #{formatNumber(locale, s.block)}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>

          {/* Certificate footer, like a signing service stamps on the last page. */}
          <footer className="mt-10 flex items-center gap-4 border-t border-neutral-300 pt-4">
            {e.status === "completed" && <SealMark className="size-12 shrink-0 -rotate-8" />}
            <div className="min-w-0 text-[0.68rem] leading-relaxed text-neutral-600">
              <p className="font-semibold tracking-wider text-neutral-800 uppercase">{v.certificate}</p>
              <p className="font-mono break-all">SHA-256 {e.hash}</p>
              <p className="font-mono">
                {NETWORK.name} · #{formatNumber(locale, lastBlock || e.anchor.block)} · {dict.app.status[e.status]}
              </p>
            </div>
          </footer>
        </article>
      </div>
    </div>
  )
}
