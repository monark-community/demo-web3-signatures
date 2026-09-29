"use client"

import { ArrowRightIcon, RotateCcwIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"

import { Fingerprint } from "@/components/sheet/fingerprint"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/client"
import { t } from "@/i18n/t"
import { sha256Text } from "@/lib/demo/sha256"

/** Type in the "document", watch the fingerprint: the avalanche effect, live. */
export function HashToy() {
  const { dict } = useI18n()
  const d = dict.home.leaves
  const id = useId()
  const [text, setText] = useState(d.initial)
  const original = useMemo(() => sha256Text(d.initial), [d.initial])
  const hash = useMemo(() => sha256Text(text), [text])
  const changed = useMemo(() => hash.split("").filter((c, i) => c !== original[i]).length, [hash, original])

  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1.15fr]">
      <div className="sheet flex flex-col p-4 sm:p-5">
        <label htmlFor={id} className="eyebrow mb-2">
          {d.fileLabel}
        </label>
        <textarea
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          spellCheck={false}
          className="min-h-24 w-full flex-1 resize-none rounded-sm border border-input bg-background/60 p-3 text-base leading-relaxed focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring"
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{d.input}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setText(d.initial)} disabled={text === d.initial}>
            <RotateCcwIcon aria-hidden="true" />
            {d.reset}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center text-muted-foreground" aria-hidden="true">
        <ArrowRightIcon className="size-5 rotate-90 lg:rotate-0" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col justify-between rounded-sm border bg-card p-4 sm:p-5">
        <div>
          <p className="eyebrow mb-3">{d.hashLabel}</p>
          <Fingerprint hash={hash} diff={original} size="lg" />
        </div>
        <p className="mt-4 font-mono text-xs" aria-live="polite">
          {changed === 0 ? (
            <span className="text-success">{d.same}</span>
          ) : (
            <span className="text-destructive">{t(d.changed, { n: changed })}</span>
          )}
        </p>
      </div>
    </div>
  )
}
