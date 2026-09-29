import { FileIcon, PenLineIcon } from "lucide-react"

import { SealMark } from "@/components/site/seal"
import { cn } from "@/lib/utils"

import { Fingerprint } from "./fingerprint"
import { SignatureStroke } from "./signature-stroke"

export interface SheetSigner {
  key: string
  name: string
  role: string
  status: "waiting" | "pending" | "signed" | "declined"
  signature?: string
  /** Shown under the line, e.g. "Signed 3 h ago · block 7,341,902". */
  meta?: string
  /** Draw the stroke with an animation. */
  draw?: boolean
  drawDelay?: number
  statusLabel: string
}

/**
 * The paper sheet at the heart of SignChain: a document, its fingerprint and
 * its signature lines. Pure render, usable from server and client components.
 */
export function DocumentSheet({
  heading,
  subheading,
  text,
  file,
  hash,
  hashLabel,
  printHash,
  printDelay,
  signers,
  seal,
  className,
  textLabel,
  maxTextLines = 14,
}: {
  heading: string
  subheading?: string
  text?: string
  /** Shown instead of the text when the content isn't available (uploaded files). */
  file?: { name: string; size: string; note: string }
  hash: string
  hashLabel: string
  printHash?: boolean
  printDelay?: number
  signers: SheetSigner[]
  seal?: { label: string; sublabel?: string; press?: boolean; delay?: number }
  className?: string
  textLabel?: string
  maxTextLines?: number
}) {
  const lines = text?.trim().split("\n") ?? []
  const shown = lines.slice(0, maxTextLines)
  return (
    <article className={cn("sheet relative overflow-hidden px-5 pt-6 pb-5 sm:px-8 sm:pt-8", className)}>
      <header className="border-b border-rule pb-4">
        <h3 className="text-lg leading-tight font-bold tracking-[-0.01em] sm:text-xl">{heading}</h3>
        {subheading && <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>}
      </header>

      {text ? (
        <div className="relative mt-4" aria-label={textLabel}>
          <pre className="overflow-hidden font-sans text-[0.8rem] leading-relaxed whitespace-pre-wrap text-foreground/85 sm:text-[0.84rem]">
            {shown.join("\n")}
          </pre>
          {lines.length > shown.length && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-b from-transparent to-paper" aria-hidden="true" />
          )}
        </div>
      ) : file ? (
        <div className="mt-4 flex items-start gap-3 rounded-sm border border-dashed border-rule bg-background/40 p-4">
          <FileIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate font-mono text-sm">{file.name}</p>
            <p className="text-xs text-muted-foreground">{file.size}</p>
            <p className="mt-2 text-sm text-muted-foreground">{file.note}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-sm border border-rule bg-background/50 px-3 py-3">
        <Fingerprint hash={hash} label={hashLabel} print={printHash} delay={printDelay} />
      </div>

      <ol className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {signers.map((s) => (
          <li key={s.key} className="min-w-0">
            <div className="flex h-14 items-end">
              {s.status === "signed" && s.signature ? (
                <SignatureStroke signature={s.signature} draw={s.draw} delay={s.drawDelay} className="-mb-2" />
              ) : s.status === "declined" ? (
                <span className="mb-1 font-mono text-sm tracking-widest text-destructive uppercase line-through">{s.statusLabel}</span>
              ) : (
                <span className={cn("mb-1 inline-flex items-center gap-1.5 text-xs", s.status === "pending" ? "text-warning" : "text-muted-foreground")}>
                  <PenLineIcon className="size-3.5" aria-hidden="true" />
                  {s.statusLabel}
                </span>
              )}
            </div>
            <div className="border-t border-foreground/70 pt-1.5">
              <p className="truncate text-sm font-semibold">{s.name}</p>
              <p className="truncate text-xs text-muted-foreground">{s.role}</p>
              {s.meta && <p className="mt-0.5 truncate font-mono text-[0.68rem] text-muted-foreground">{s.meta}</p>}
            </div>
            <span className="sr-only">{s.statusLabel}</span>
          </li>
        ))}
      </ol>

      {seal && (
        <div className="mt-6 flex items-center justify-end gap-3">
          <div className="text-right">
            <p className="eyebrow">{seal.label}</p>
            {seal.sublabel && <p className="font-mono text-xs text-foreground">{seal.sublabel}</p>}
          </div>
          <span
            className={cn("inline-block -rotate-8", seal.press && "seal-press")}
            style={seal.press && seal.delay ? { animationDelay: `${seal.delay}s` } : undefined}
          >
            <SealMark className="size-14" />
          </span>
        </div>
      )}
    </article>
  )
}
