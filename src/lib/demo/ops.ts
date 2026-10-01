"use client"

import { cidFor, feeEstimate, latency, randomId, randomTx, signatureFor, wait } from "./chain"
import { ME } from "./seed"
import { getState, requestWallet, setState } from "./store"
import type {
  Address,
  AuditEvent,
  Category,
  DemoSettings,
  Envelope,
  Routing,
  SignerSlot,
  Storage,
  TxPhase,
  TxResult,
  VerifyResult,
} from "./types"

/**
 * Every action the UI can take. Each one walks the same path a real dApp
 * would: wallet prompt(s) → broadcast → wait for a block → confirmed or
 * failed. With wagmi/viem these become signTypedData + writeContract +
 * waitForTransactionReceipt against the registry contract.
 */

export type PhaseHook = (phase: TxPhase, tx?: string) => void

const speed = () => getState().settings.speed

// ---- Wallet ----

export async function connectWallet(): Promise<boolean> {
  setState((s) => ({ ...s, wallet: { status: "connecting" } }))
  const approved = await requestWallet({ kind: "connect" })
  if (!approved) {
    setState((s) => ({ ...s, wallet: { status: "disconnected" } }))
    return false
  }
  await wait(latency(speed(), "prompt"))
  setState((s) => ({ ...s, wallet: { status: "connected", address: ME.address } }))
  return true
}

export function disconnectWallet() {
  setState((s) => ({ ...s, wallet: { status: "disconnected" } }))
}

export function updateSettings(patch: Partial<DemoSettings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
}

// ---- Transactions ----

async function sendTx(action: "register" | "sign" | "decline" | "void", title: string, onPhase: PhaseHook): Promise<TxResult> {
  onPhase("prompt")
  const approved = await requestWallet({ kind: "tx", action, title, fee: feeEstimate(action) })
  if (!approved) {
    onPhase("failed")
    return { ok: false, tx: "", error: "rejected" }
  }
  const tx = randomTx()
  onPhase("pending", tx)
  await wait(latency(speed(), "block"))
  if (getState().settings.failNext) {
    setState((s) => ({ ...s, settings: { ...s.settings, failNext: false } }))
    onPhase("failed", tx)
    return { ok: false, tx, error: Math.random() < 0.5 ? "dropped" : "reverted" }
  }
  const block = getState().block + 1 + Math.floor(Math.random() * 3)
  setState((s) => ({ ...s, block }))
  onPhase("confirmed", tx)
  return { ok: true, tx, block }
}

async function signMessage(
  hash: string,
  title: string,
  role: "sender" | "signer",
  decision: "approve" | "decline",
  onPhase: PhaseHook
): Promise<string | null> {
  onPhase("prompt")
  const approved = await requestWallet({
    kind: "sign",
    message: { documentHash: `0x${hash}`, title, signer: ME.address, role, decision, nonce: getState().envelopes.length + 1 },
  })
  if (!approved) {
    onPhase("failed")
    return null
  }
  return signatureFor(hash, ME.address, decision)
}

const rejected = (): TxResult => ({ ok: false, tx: "", error: "rejected" })

// ---- Envelopes ----

export interface Draft {
  title: string
  category: Category
  message?: string
  fileName: string
  fileSize: number
  hash: string
  docId?: string
  storage: Storage
  routing: Routing
  /** In signing order; may include ME.address. */
  signers: Address[]
}

export function findByHash(hash: string): Envelope | undefined {
  return getState().envelopes.find((e) => e.hash === hash && e.status !== "voided")
}

export async function createEnvelope(draft: Draft, onPhase: PhaseHook): Promise<TxResult & { id?: string }> {
  const iSign = draft.signers.some((a) => a === ME.address)
  const signature = iSign ? await signMessage(draft.hash, draft.title, "sender", "approve", onPhase) : "none"
  if (signature === null) return rejected()

  // The copy is encrypted and pinned before registering, so its CID goes into the same transaction.
  let cid: string | undefined
  let pinnedAt = 0
  if (draft.storage === "ipfs") {
    onPhase("encrypting")
    await wait(latency(speed(), "prompt"))
    onPhase("pinning")
    await wait(latency(speed(), "block"))
    cid = cidFor(draft.hash)
    pinnedAt = Date.now()
  }

  const res = await sendTx("register", draft.title, onPhase)
  if (!res.ok || !res.block) return res

  const now = Date.now()
  const id = randomId()
  const events: AuditEvent[] = [{ kind: "created", at: now, actor: ME.address, block: res.block, tx: res.tx }]
  if (cid) events.push({ kind: "pinned", at: pinnedAt, actor: ME.address, note: cid })

  let firstOpen = true
  const signers: SignerSlot[] = draft.signers.map((address) => {
    if (address === ME.address) {
      events.push({ kind: "signed", at: now + 2, actor: address, block: res.block, tx: res.tx })
      return { address, status: "signed", signature, signedAt: now, block: res.block, tx: res.tx }
    }
    if (draft.routing === "parallel") return { address, status: "pending" }
    const status = firstOpen ? "pending" : "waiting"
    firstOpen = false
    return { address, status }
  })

  const complete = signers.every((x) => x.status === "signed")
  if (complete) events.push({ kind: "completed", at: now + 3, block: res.block, tx: res.tx })

  const envelope: Envelope = {
    id,
    title: draft.title,
    category: draft.category,
    message: draft.message,
    fileName: draft.fileName,
    fileSize: draft.fileSize,
    hash: draft.hash,
    docId: draft.docId,
    storage: draft.storage,
    cid,
    sender: ME.address,
    routing: draft.routing,
    signers,
    status: complete ? "completed" : "awaiting",
    createdAt: now,
    completedAt: complete ? now : undefined,
    anchor: { block: res.block, tx: res.tx, at: now },
    events,
  }
  setState((s) => ({ ...s, envelopes: [envelope, ...s.envelopes] }))
  return { ...res, id }
}

function applySignature(e: Envelope, address: Address, signature: string, tx: string, block: number): Envelope {
  const now = Date.now()
  const signers = e.signers.map((x) =>
    x.address === address ? { ...x, status: "signed" as const, signature, signedAt: now, block, tx } : x
  )
  // In-order routing: open the next slot.
  if (e.routing === "sequential") {
    const next = signers.find((x) => x.status === "waiting")
    if (next && !signers.some((x) => x.status === "pending")) next.status = "pending"
  }
  const events: AuditEvent[] = [...e.events, { kind: "signed", at: now, actor: address, block, tx }]
  const complete = signers.every((x) => x.status === "signed")
  if (complete) events.push({ kind: "completed", at: now + 1, block, tx })
  return { ...e, signers, events, status: complete ? "completed" : e.status, completedAt: complete ? now : undefined }
}

function patchEnvelope(id: string, fn: (e: Envelope) => Envelope) {
  setState((s) => ({ ...s, envelopes: s.envelopes.map((e) => (e.id === id ? fn(e) : e)) }))
}

const getEnvelope = (id: string) => getState().envelopes.find((e) => e.id === id)

export async function signEnvelope(id: string, onPhase: PhaseHook): Promise<TxResult> {
  const e = getEnvelope(id)
  if (!e) return rejected()
  const signature = await signMessage(e.hash, e.title, "signer", "approve", onPhase)
  if (!signature) return rejected()
  const res = await sendTx("sign", e.title, onPhase)
  if (res.ok && res.block) patchEnvelope(id, (x) => applySignature(x, ME.address, signature, res.tx, res.block!))
  return res
}

export async function declineEnvelope(id: string, reason: string, onPhase: PhaseHook): Promise<TxResult> {
  const e = getEnvelope(id)
  if (!e) return rejected()
  const signature = await signMessage(e.hash, e.title, "signer", "decline", onPhase)
  if (!signature) return rejected()
  const res = await sendTx("decline", e.title, onPhase)
  if (res.ok && res.block) {
    const now = Date.now()
    patchEnvelope(id, (x) => ({
      ...x,
      status: "declined",
      signers: x.signers.map((s) =>
        s.address === ME.address ? { ...s, status: "declined", signature, signedAt: now, block: res.block, tx: res.tx, reason } : s
      ),
      events: [...x.events, { kind: "declined", at: now, actor: ME.address, block: res.block, tx: res.tx, note: reason }],
    }))
  }
  return res
}

export async function voidEnvelope(id: string, onPhase: PhaseHook): Promise<TxResult> {
  const e = getEnvelope(id)
  if (!e) return rejected()
  const res = await sendTx("void", e.title, onPhase)
  if (res.ok && res.block) {
    patchEnvelope(id, (x) => ({
      ...x,
      status: "voided",
      events: [...x.events, { kind: "voided", at: Date.now(), actor: ME.address, block: res.block, tx: res.tx }],
    }))
  }
  return res
}

/** Demo only: the next counterparty whose turn it is signs, as if from their own wallet. */
export async function simulateCounterparty(id: string): Promise<Address | null> {
  const e = getEnvelope(id)
  if (!e || e.status !== "awaiting") return null
  const slot = e.signers.find((x) => x.status === "pending" && x.address !== ME.address)
  if (!slot) return null
  await wait(latency(speed(), "block"))
  const block = getState().block + 1 + Math.floor(Math.random() * 4)
  setState((s) => ({ ...s, block }))
  patchEnvelope(id, (x) => applySignature(x, slot.address, signatureFor(x.hash, slot.address), randomTx(), block))
  return slot.address
}

// ---- Verification (public, no wallet) ----

export function verifyHash(hash: string, fileName?: string): VerifyResult {
  const envelopes = getState().envelopes
  const envelope = envelopes.find((e) => e.hash === hash)
  if (envelope) return { kind: "match", envelope }
  const nearest = fileName ? envelopes.find((e) => e.fileName === fileName) : undefined
  return { kind: "none", hash, nearest }
}
