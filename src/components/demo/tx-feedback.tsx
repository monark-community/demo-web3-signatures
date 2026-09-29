"use client"

import { AlertTriangleIcon, CheckCircle2Icon, Loader2Icon, WalletIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { TxStatus } from "@/components/ui/tx-status"
import { useI18n } from "@/i18n/client"
import { t } from "@/i18n/t"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

import type { TxView } from "./use-tx"

export interface TxLabels {
  signing: string
  prompt: string
  pending: string
  confirmed: string
  rejected: string
  failed: string
  retry: string
}

/** Inline, next to the action: never a toast over the thing it reports on. */
export function TxFeedback({
  view,
  labels,
  onRetry,
  children,
  className,
}: {
  view: TxView
  labels: TxLabels
  onRetry?: () => void
  children?: ReactNode
  className?: string
}) {
  const { locale, dict } = useI18n()
  if (view.phase === "idle") return null

  const failed = view.phase === "failed"
  const reason = view.error === "reverted" ? dict.app.txErrors.reverted : dict.app.txErrors.dropped

  let icon = <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
  let text = ""
  if (view.phase === "prompt") {
    icon = <WalletIcon className="size-4" aria-hidden="true" />
    text = view.step === "tx" ? labels.prompt : labels.signing
  } else if (view.phase === "pending") text = labels.pending
  else if (view.phase === "confirmed") {
    icon = <CheckCircle2Icon className="size-4" aria-hidden="true" />
    text = t(labels.confirmed, { block: view.block ? formatNumber(locale, view.block) : "" })
  } else if (failed) {
    icon = <AlertTriangleIcon className="size-4" aria-hidden="true" />
    text = view.error === "rejected" ? labels.rejected : t(labels.failed, { reason })
  }

  return (
    <div
      role={failed ? "alert" : "status"}
      aria-live={failed ? "assertive" : "polite"}
      className={cn(
        "fade-up rounded-sm border p-3 text-sm",
        failed && "border-destructive/40 bg-destructive/8",
        view.phase === "confirmed" && "border-success/40 bg-success/8",
        (view.phase === "prompt" || view.phase === "pending") && "border-warning/40 bg-warning/8",
        className
      )}
    >
      <p
        className={cn(
          "flex items-start gap-2 font-medium",
          failed && "text-destructive",
          view.phase === "confirmed" && "text-success",
          (view.phase === "prompt" || view.phase === "pending") && "text-warning"
        )}
      >
        <span className="mt-0.5 shrink-0">{icon}</span>
        <span>{text}</span>
      </p>
      {view.tx && view.phase !== "prompt" && (
        <TxStatus
          status={view.phase === "confirmed" ? "confirmed" : view.phase === "failed" ? "failed" : "pending"}
          hash={view.tx}
          label={view.phase === "confirmed" ? dict.app.tx.confirmed : view.phase === "failed" ? dict.app.tx.failed : dict.app.tx.pending}
          className="mt-2 max-w-full bg-card"
        />
      )}
      {(failed && onRetry) || children ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {failed && onRetry && (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              {labels.retry}
            </Button>
          )}
          {children}
        </div>
      ) : null}
    </div>
  )
}
