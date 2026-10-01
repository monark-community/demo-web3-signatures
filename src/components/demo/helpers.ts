import { ME, partyFor } from "@/lib/demo/seed"
import type { Address, Envelope } from "@/lib/demo/types"

export const isMe = (a: Address) => a.toLowerCase() === ME.address.toLowerCase()

export function nameFor(address: Address, fallback: string): string {
  return partyFor(address)?.name ?? fallback
}

export function myTurn(e: Envelope): boolean {
  return e.status === "awaiting" && e.signers.some((s) => isMe(s.address) && s.status === "pending")
}

export type Bucket = "needs" | "waiting" | "completed" | "all"

export function inBucket(e: Envelope, b: Bucket): boolean {
  if (b === "all") return true
  if (b === "needs") return myTurn(e)
  if (b === "waiting") return e.status === "awaiting" && !myTurn(e)
  return e.status === "completed"
}

export function signedCount(e: Envelope): number {
  return e.signers.filter((s) => s.status === "signed").length
}

export function lastActivity(e: Envelope): number {
  return e.events.reduce((m, x) => Math.max(m, x.at), e.createdAt)
}

/** The proof receipt: everything needed to verify the envelope without SignChain. */
export function receiptJson(e: Envelope, registry: string, chainId: number): string {
  return JSON.stringify(
    {
      type: "signchain.proof-receipt",
      version: 1,
      network: { name: "sepolia", chainId, registry, simulated: true },
      document: { title: e.title, fileName: e.fileName, bytes: e.fileSize, sha256: e.hash, storage: e.storage, cid: e.cid ?? null },
      envelope: { id: e.id, status: e.status, sender: e.sender, routing: e.routing, block: e.anchor.block, tx: e.anchor.tx, registeredAt: new Date(e.anchor.at).toISOString() },
      signatures: e.signers.map((s) => ({
        signer: s.address,
        status: s.status,
        signature: s.signature ?? null,
        block: s.block ?? null,
        tx: s.tx ?? null,
        at: s.signedAt ? new Date(s.signedAt).toISOString() : null,
        reason: s.reason ?? null,
      })),
    },
    null,
    2
  )
}
