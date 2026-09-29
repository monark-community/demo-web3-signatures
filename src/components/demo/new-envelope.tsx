"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  FileTextIcon,
  Loader2Icon,
  PlusIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useId, useState } from "react"

import { Fingerprint } from "@/components/sheet/fingerprint"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { useI18n } from "@/i18n/client"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { isAddress } from "@/lib/demo/chain"
import { SAMPLE_DOCS, docBytes } from "@/lib/demo/documents"
import { createEnvelope, findByHash } from "@/lib/demo/ops"
import { ME, PARTIES, partyFor } from "@/lib/demo/seed"
import { sha256File, sha256Text } from "@/lib/demo/sha256"
import { useDemo } from "@/lib/demo/store"
import type { Address, Category, Routing, Storage } from "@/lib/demo/types"
import { formatBytes } from "@/lib/format"
import { cn } from "@/lib/utils"

import { FileDrop } from "./file-drop"
import { TxFeedback } from "./tx-feedback"
import { useTx } from "./use-tx"

const MAX_BYTES = 25 * 1024 * 1024
const CATEGORIES: Category[] = ["services", "employment", "licence", "grant", "approval", "nda", "other"]

interface DocState {
  name: string
  size: number
  hash: string
  docId?: string
}

export function NewEnvelope() {
  const { locale, dict } = useI18n()
  const c = dict.app.create
  const router = useRouter()
  useDemo() // re-render when the store changes (duplicates, reset)
  const ids = { title: useId(), category: useId(), message: useId(), paste: useId() }

  const [step, setStep] = useState(0)
  const [doc, setDoc] = useState<DocState | null>(null)
  const [hashing, setHashing] = useState(false)
  const [docError, setDocError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<Category>("services")
  const [message, setMessage] = useState("")
  const [includeMe, setIncludeMe] = useState(true)
  const [others, setOthers] = useState<Address[]>([])
  const [routing, setRouting] = useState<Routing>("parallel")
  const [paste, setPaste] = useState("")
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [storage, setStorage] = useState<Storage>("hash")
  const [showErrors, setShowErrors] = useState<Record<number, boolean>>({})
  const { view, run, busy } = useTx()

  const duplicate = doc ? findByHash(doc.hash) : undefined
  const errors = {
    0: !doc || !!duplicate,
    1: title.trim().length < 3,
    2: others.length === 0,
    3: false,
  } as Record<number, boolean>

  const onFile = async (file: File) => {
    setDocError(null)
    if (file.size === 0) return setDocError(dict.verify.errors.empty)
    if (file.size > MAX_BYTES) return setDocError(dict.verify.errors.tooBig)
    setHashing(true)
    setDoc(null)
    try {
      const hash = await sha256File(file)
      setDoc({ name: file.name, size: file.size, hash })
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "))
    } catch {
      setDocError(dict.verify.errors.read)
    } finally {
      setHashing(false)
    }
  }

  const pickSample = () => {
    const s = SAMPLE_DOCS["consulting-mensah"]!
    setDocError(null)
    setDoc({ name: s.fileName, size: docBytes(s.id), hash: sha256Text(s.text), docId: s.id })
    if (!title) setTitle(c.doc.sampleName)
    setCategory("services")
    const kofi = PARTIES.find((p) => p.name.startsWith("Kofi"))!.address
    if (others.length === 0) setOthers([kofi])
  }

  const addOther = (a: Address) => {
    if (a.toLowerCase() === ME.address.toLowerCase() || others.some((o) => o.toLowerCase() === a.toLowerCase())) return false
    setOthers((o) => [...o, a])
    return true
  }

  const onPaste = () => {
    const v = paste.trim()
    if (!isAddress(v)) return setPasteError(c.signers.invalid)
    if (!addOther(v.toLowerCase() as Address)) return setPasteError(c.signers.exists)
    setPaste("")
    setPasteError(null)
  }

  const move = (i: number, dir: -1 | 1) => {
    setOthers((o) => {
      const next = [...o]
      const j = i + dir
      if (j < 0 || j >= next.length) return o
      ;[next[i], next[j]] = [next[j]!, next[i]!]
      return next
    })
  }

  const goNext = () => {
    if (errors[step]) {
      setShowErrors((s) => ({ ...s, [step]: true }))
      return
    }
    setStep((s) => Math.min(4, s + 1))
  }

  const send = async () => {
    const firstBad = [0, 1, 2].find((i) => errors[i])
    if (firstBad !== undefined) {
      setShowErrors({ 0: true, 1: true, 2: true })
      setStep(firstBad)
      return
    }
    const signers = includeMe ? [ME.address, ...others] : others
    const res = await run(
      (onPhase) =>
        createEnvelope(
          {
            title: title.trim(),
            category,
            message: message.trim() || undefined,
            fileName: doc!.name,
            fileSize: doc!.size,
            hash: doc!.hash,
            docId: doc!.docId,
            storage,
            routing,
            signers,
          },
          onPhase
        ),
      includeMe
    )
    if (res.ok && res.id) {
      setTimeout(() => router.push(href(locale, `/app/envelopes/${res.id}?sent=1`)), 900)
    }
  }

  const nameOf = (a: Address) => partyFor(a)?.name ?? c.signers.unknown
  const stepNames = [...c.steps, c.review.title]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="eyebrow">{dict.app.nav.new}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-balance sm:text-4xl">{c.title}</h1>
      <p className="mt-2 text-muted-foreground">{c.lead}</p>

      <ol className="mt-8 grid grid-cols-5 gap-1.5" aria-label={c.title}>
        {stepNames.map((name, i) => {
          const done = i < step && !errors[i]
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => !busy && setStep(i)}
                aria-current={step === i ? "step" : undefined}
                className="group flex w-full flex-col gap-1.5 text-left"
              >
                <span className={cn("h-1 rounded-full", step === i ? "bg-primary" : done ? "bg-foreground/60" : "bg-border")} />
                <span
                  className={cn(
                    "hidden items-center gap-1 text-xs font-medium sm:flex",
                    step === i ? "text-foreground" : "text-muted-foreground",
                    showErrors[i] && errors[i] && "text-destructive"
                  )}
                >
                  {done && <CheckIcon className="size-3" aria-hidden="true" />}
                  {name}
                </span>
                <span className="sr-only sm:hidden">{name}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-sm font-semibold sm:hidden">
        {step + 1}/5 · {stepNames[step]}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="min-w-0" aria-live="polite">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">{c.doc.title}</h2>
              {!doc && !hashing && (
                <>
                  <FileDrop onFile={onFile} title={c.doc.drop} hint={c.doc.hint} button={c.doc.choose} />
                  <Button type="button" variant="link" className="h-auto px-0" onClick={pickSample}>
                    <FileTextIcon aria-hidden="true" />
                    {c.doc.sample}
                  </Button>
                </>
              )}
              {hashing && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                  <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                  {c.doc.hashing}
                </p>
              )}
              {doc && (
                <div className="sheet p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <FileTextIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(locale, doc.size)}</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setDoc(null)} disabled={busy}>
                      {c.doc.replace}
                    </Button>
                  </div>
                  <div className="mt-4 rounded-sm border border-rule bg-background/50 p-3">
                    <Fingerprint key={doc.hash} hash={doc.hash} label={c.doc.fingerprint} print />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{c.doc.local}</p>
                </div>
              )}
              {duplicate && (
                <p role="alert" className="rounded-sm border border-destructive/40 bg-destructive/8 px-3 py-2 text-sm text-destructive">
                  {t(c.doc.duplicate, { title: duplicate.title })}{" "}
                  <Link href={href(locale, `/app/envelopes/${duplicate.id}`)} className="font-semibold underline">
                    {c.doc.openExisting}
                  </Link>
                </p>
              )}
              {docError && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {docError}
                </p>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">{c.details.title}</h2>
              <div className="space-y-2">
                <Label htmlFor={ids.title}>{c.details.name}</Label>
                <Input
                  id={ids.title}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={c.details.namePlaceholder}
                  aria-invalid={showErrors[1] && errors[1] ? true : undefined}
                  aria-describedby={showErrors[1] && errors[1] ? `${ids.title}-err` : undefined}
                  className="h-11 bg-card"
                  maxLength={120}
                />
                {showErrors[1] && errors[1] && (
                  <p id={`${ids.title}-err`} className="text-sm text-destructive">
                    {c.details.nameRequired}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={ids.category}>{c.details.category}</Label>
                <select
                  id={ids.category}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                >
                  {CATEGORIES.map((k) => (
                    <option key={k} value={k}>
                      {dict.app.categories[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={ids.message}>{c.details.message}</Label>
                <Textarea
                  id={ids.message}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={c.details.messagePlaceholder}
                  rows={3}
                  className="bg-card"
                  maxLength={280}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">{c.signers.title}</h2>
              <label className="flex items-center gap-3 rounded-sm border bg-card p-3 text-sm">
                <input type="checkbox" checked={includeMe} onChange={(e) => setIncludeMe(e.target.checked)} className="size-4 accent-[var(--primary)]" />
                <WalletAvatar address={ME.address} size={24} />
                <span className="font-medium">{c.signers.includeMe}</span>
              </label>

              <fieldset>
                <legend className="text-sm font-semibold">{c.signers.routing}</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(["parallel", "sequential"] as const).map((r) => (
                    <label
                      key={r}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-sm border bg-card p-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                        routing === r && "border-primary"
                      )}
                    >
                      <input type="radio" name="routing" value={r} checked={routing === r} onChange={() => setRouting(r)} className="mt-0.5 size-4 accent-[var(--primary)]" />
                      <span>
                        <span className="block font-medium">{c.signers[r]}</span>
                        <span className="text-xs text-muted-foreground">{c.signers[`${r}Hint`]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <p className="text-sm font-semibold">{c.signers.order}</p>
                <ol className="mt-2 divide-y rounded-sm border bg-card">
                  {includeMe && (
                    <li className="flex items-center gap-3 p-3 text-sm">
                      <span className="w-5 font-mono text-xs text-muted-foreground">1</span>
                      <WalletAvatar address={ME.address} size={24} />
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {ME.name} <span className="text-muted-foreground">{dict.app.envelope.you}</span>
                      </span>
                    </li>
                  )}
                  {others.map((a, i) => (
                    <li key={a} className="flex items-center gap-2 p-2 pl-3 text-sm">
                      <span className="w-5 font-mono text-xs text-muted-foreground">{i + (includeMe ? 2 : 1)}</span>
                      <WalletAvatar address={a} size={24} />
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate font-medium">{nameOf(a)}</span>
                        <WalletAddress address={a} className="text-xs text-muted-foreground" />
                      </span>
                      {routing === "sequential" && (
                        <>
                          <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t(c.signers.up, { name: nameOf(a) })}>
                            <ArrowUpIcon aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => move(i, 1)}
                            disabled={i === others.length - 1}
                            aria-label={t(c.signers.down, { name: nameOf(a) })}
                          >
                            <ArrowDownIcon aria-hidden="true" />
                          </Button>
                        </>
                      )}
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => setOthers((o) => o.filter((x) => x !== a))} aria-label={t(c.signers.remove, { name: nameOf(a) })}>
                        <XIcon aria-hidden="true" />
                      </Button>
                    </li>
                  ))}
                </ol>
                {showErrors[2] && errors[2] && (
                  <p role="alert" className="mt-2 text-sm text-destructive">
                    {c.signers.none}
                  </p>
                )}
              </div>

              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <UserPlusIcon className="size-4" aria-hidden="true" />
                  {c.signers.add}
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {PARTIES.filter((p) => p.address !== ME.address && !others.includes(p.address)).map((p) => (
                    <li key={p.address}>
                      <Button type="button" variant="outline" size="sm" onClick={() => addOther(p.address)} className="h-auto min-h-9 bg-card py-1.5">
                        <PlusIcon aria-hidden="true" />
                        <span className="text-left leading-tight">
                          <span className="block">{p.name}</span>
                          <span className="block text-[0.7rem] font-normal text-muted-foreground">{p.org}</span>
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor={ids.paste}>{c.signers.paste}</Label>
                <div className="flex gap-2">
                  <Input
                    id={ids.paste}
                    value={paste}
                    onChange={(e) => {
                      setPaste(e.target.value)
                      setPasteError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        onPaste()
                      }
                    }}
                    placeholder={c.signers.pastePlaceholder}
                    className="h-10 bg-card font-mono text-sm"
                    aria-invalid={pasteError ? true : undefined}
                    aria-describedby={pasteError ? `${ids.paste}-err` : undefined}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <Button type="button" variant="outline" onClick={onPaste} className="h-10">
                    {c.signers.addAddress}
                  </Button>
                </div>
                {pasteError && (
                  <p id={`${ids.paste}-err`} className="text-sm text-destructive">
                    {pasteError}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <fieldset className="space-y-3">
              <legend className="text-xl font-bold">{c.storage.title}</legend>
              {(["hash", "ipfs"] as const).map((s) => (
                <label
                  key={s}
                  className={cn(
                    "mt-3 flex cursor-pointer gap-3 rounded-sm border bg-card p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                    storage === s && "border-primary"
                  )}
                >
                  <input type="radio" name="storage" value={s} checked={storage === s} onChange={() => setStorage(s)} className="mt-1 size-4 accent-[var(--primary)]" />
                  <span>
                    <span className="block font-semibold">{c.storage[s]}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{c.storage[`${s}Hint`]}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">{c.review.title}</h2>
              <p className="text-sm text-muted-foreground">{c.review.body}</p>
              <Summary
                doc={doc}
                title={title}
                category={dict.app.categories[category]}
                signers={includeMe ? [ME.address, ...others] : others}
                routing={routing}
                storage={storage}
                nameOf={nameOf}
              />
              <p className="text-xs text-muted-foreground">{dict.common.valueNotice}</p>
              <TxFeedback
                view={view}
                labels={{
                  signing: c.progress.signing,
                  prompt: c.progress.prompt,
                  pending: c.progress.pending,
                  confirmed: c.progress.confirmed,
                  rejected: c.progress.rejected,
                  failed: c.progress.failed,
                  retry: c.progress.retry,
                }}
                onRetry={send}
              />
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t pt-5">
            <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || busy}>
              {c.review.back}
            </Button>
            {step < 4 ? (
              <Button type="button" size="lg" onClick={goNext} disabled={hashing}>
                {c.review.next}
              </Button>
            ) : (
              <Button type="button" size="lg" onClick={send} disabled={busy || view.phase === "confirmed"}>
                {busy && <Loader2Icon className="animate-spin" aria-hidden="true" />}
                {includeMe ? c.review.send : c.review.sendNoSign}
              </Button>
            )}
          </div>
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Summary
              doc={doc}
              title={title}
              category={dict.app.categories[category]}
              signers={includeMe ? [ME.address, ...others] : others}
              routing={routing}
              storage={storage}
              nameOf={nameOf}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}

function Summary({
  doc,
  title,
  category,
  signers,
  routing,
  storage,
  nameOf,
}: {
  doc: DocState | null
  title: string
  category: string
  signers: Address[]
  routing: Routing
  storage: Storage
  nameOf: (a: Address) => string
}) {
  const { dict } = useI18n()
  const c = dict.app.create
  const e = dict.app.envelope
  return (
    <div className="sheet p-5">
      <p className="eyebrow">{category}</p>
      <p className="mt-1 text-lg leading-tight font-bold">{title.trim() || "—"}</p>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="eyebrow">{e.fingerprint}</dt>
          <dd className="mt-1 font-mono text-xs break-all">{doc ? doc.hash : "—"}</dd>
        </div>
        <div>
          <dt className="eyebrow">{e.signers}</dt>
          <dd className="mt-1">
            <ol className="space-y-1">
              {signers.length === 0 && <li className="text-muted-foreground">—</li>}
              {signers.map((a, i) => (
                <li key={a} className="flex items-center gap-2">
                  {routing === "sequential" && <span className="w-4 font-mono text-xs text-muted-foreground">{i + 1}</span>}
                  <WalletAvatar address={a} size={18} />
                  <span className="truncate">
                    {a === ME.address ? `${ME.name} ${e.you}` : nameOf(a)}
                  </span>
                </li>
              ))}
            </ol>
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <div>
            <dt className="eyebrow">{c.signers.routing}</dt>
            <dd className="mt-1">{routing === "parallel" ? e.routingParallel : e.routingSequential}</dd>
          </div>
          <div>
            <dt className="eyebrow">{e.storage}</dt>
            <dd className="mt-1">{storage === "hash" ? c.storage.hash : c.storage.ipfs}</dd>
          </div>
        </div>
      </dl>
    </div>
  )
}
