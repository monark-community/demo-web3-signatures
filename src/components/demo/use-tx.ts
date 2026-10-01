"use client"

import { useCallback, useRef, useState } from "react"

import type { PhaseHook } from "@/lib/demo/ops"
import type { TxPhase, TxResult } from "@/lib/demo/types"

export interface TxView {
  phase: TxPhase
  /** Which wallet step is open: the signature or the transaction. */
  step: "sign" | "tx" | null
  tx?: string
  block?: number
  error?: TxResult["error"]
}

/**
 * Tracks one action through prompt → (encrypting → pinning) → pending → confirmed / failed, for the
 * inline feedback next to the button that started it.
 */
export function useTx() {
  const [view, setView] = useState<TxView>({ phase: "idle", step: null })
  const prompts = useRef(0)

  const run = useCallback(async <R extends TxResult>(action: (onPhase: PhaseHook) => Promise<R>, withSignature = true): Promise<R> => {
    prompts.current = withSignature ? 0 : 1
    setView({ phase: "prompt", step: withSignature ? "sign" : "tx" })
    const onPhase: PhaseHook = (phase, tx) => {
      if (phase === "prompt") {
        prompts.current += 1
        setView({ phase, step: prompts.current > 1 ? "tx" : "sign" })
      } else setView((v) => ({ ...v, phase, tx: tx ?? v.tx }))
    }
    const res = await action(onPhase)
    setView({
      phase: res.ok ? "confirmed" : "failed",
      step: null,
      tx: res.tx || undefined,
      block: res.block,
      error: res.error,
    })
    return res
  }, [])

  const reset = useCallback(() => setView({ phase: "idle", step: null }), [])
  const busy = view.phase !== "idle" && view.phase !== "confirmed" && view.phase !== "failed"
  return { view, run, reset, busy }
}
