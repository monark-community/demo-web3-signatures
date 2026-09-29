"use client"

import { FileSignatureIcon, GlobeIcon, LinkIcon, ReceiptTextIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { NetworkBadge } from "@/components/ui/network-badge"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { useI18n } from "@/i18n/client"
import { t } from "@/i18n/t"
import { NETWORK, REGISTRY_ADDRESS } from "@/lib/demo/chain"
import { ME } from "@/lib/demo/seed"
import { answerPrompt, usePrompt } from "@/lib/demo/store"

/** The simulated wallet extension. Every signature and transaction passes through here. */
export function WalletPrompt() {
  const { dict } = useI18n()
  const p = dict.app.prompt
  const prompt = usePrompt()
  const req = prompt?.request

  const title = !req ? "" : req.kind === "connect" ? p.connectTitle : req.kind === "sign" ? p.signTitle : p.txTitle
  const Icon = !req ? LinkIcon : req.kind === "connect" ? LinkIcon : req.kind === "sign" ? FileSignatureIcon : ReceiptTextIcon

  return (
    <Dialog open={!!prompt} onOpenChange={(open) => !open && answerPrompt(false)}>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-md">
        <div className="flex items-center justify-between gap-3 border-b bg-muted/60 px-4 py-2.5">
          <span className="font-mono text-[0.7rem] tracking-wider text-muted-foreground uppercase">{p.wallet}</span>
          <NetworkBadge name={dict.app.network} variant="outline" icon={<span className="block size-full rounded-full bg-warning" />} />
        </div>
        {req && (
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <GlobeIcon className="size-3.5" aria-hidden="true" />
              {p.site}
            </div>
            <div className="mt-3 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-lg leading-tight font-bold">{title}</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  {req.kind === "connect"
                    ? p.connectBody
                    : req.kind === "sign"
                      ? req.message.decision === "decline"
                        ? p.declineBody
                        : p.signBody
                      : t(p.txBody, { action: p.actions[req.action] })}
                </DialogDescription>
              </div>
            </div>

            {req.kind === "sign" && (
              <dl className="mt-4 overflow-hidden rounded-sm border bg-paper font-mono text-[0.72rem]">
                <div className="border-b bg-muted/50 px-3 py-1.5 text-muted-foreground">
                  SignChain · v1 · chainId {NETWORK.chainId}
                </div>
                {(
                  [
                    ["documentHash", req.message.documentHash],
                    ["title", req.message.title],
                    ["signer", req.message.signer],
                    ["role", req.message.role],
                    ["decision", req.message.decision],
                    ["nonce", String(req.message.nonce)],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-2 border-b px-3 py-1.5 last:border-b-0">
                    <dt className="text-muted-foreground">{p.fields[k]}</dt>
                    <dd className={k === "decision" && v === "decline" ? "break-all text-destructive" : "break-all"}>{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {req.kind === "tx" && (
              <dl className="mt-4 divide-y rounded-sm border text-sm">
                <div className="flex justify-between gap-3 px-3 py-2">
                  <dt className="text-muted-foreground">{p.contract}</dt>
                  <dd className="font-mono text-xs">
                    <WalletAddress address={REGISTRY_ADDRESS} />
                  </dd>
                </div>
                <div className="flex justify-between gap-3 px-3 py-2">
                  <dt className="text-muted-foreground">{p.network}</dt>
                  <dd>{dict.app.network}</dd>
                </div>
                <div className="flex justify-between gap-3 px-3 py-2">
                  <dt className="text-muted-foreground">{p.fee}</dt>
                  <dd className="font-mono text-xs">
                    {req.fee} {NETWORK.currency}
                  </dd>
                </div>
              </dl>
            )}

            <div className="mt-4 flex items-center gap-2.5 rounded-sm border px-3 py-2">
              <WalletAvatar address={ME.address} size={24} />
              <span className="text-xs text-muted-foreground">{p.account}</span>
              <WalletAddress address={ME.address} className="ml-auto text-xs" />
            </div>
            {req.kind === "tx" && <p className="mt-3 text-center text-[0.7rem] text-muted-foreground">{dict.common.valueNotice}</p>}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={() => answerPrompt(false)}>
            {p.reject}
          </Button>
          <Button type="button" onClick={() => answerPrompt(true)} autoFocus>
            {p.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
