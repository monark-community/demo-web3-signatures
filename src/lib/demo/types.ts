/**
 * Types of the demo data layer. The UI only depends on these and on the hooks
 * and actions in store.ts / ops.ts, so the simulated chain can later be
 * replaced by wagmi/viem calls against a real registry contract.
 */

export type Address = `0x${string}`

export interface Party {
  address: Address
  name: string
  org: string
  /** Job title, e.g. "Head of Operations". */
  title: string
}

export type Category = "services" | "employment" | "licence" | "grant" | "approval" | "nda" | "other"

/** waiting: not their turn yet (in-order routing) · pending: can sign now. */
export type SlotStatus = "waiting" | "pending" | "signed" | "declined"

export interface SignerSlot {
  address: Address
  status: SlotStatus
  signature?: string
  signedAt?: number
  block?: number
  tx?: string
  reason?: string
}

export type EnvelopeStatus = "awaiting" | "completed" | "declined" | "voided"
export type Routing = "parallel" | "sequential"
export type Storage = "hash" | "ipfs"

export type AuditKind = "created" | "pinned" | "signed" | "declined" | "voided" | "completed"

export interface AuditEvent {
  kind: AuditKind
  at: number
  actor?: Address
  block?: number
  tx?: string
  note?: string
}

export interface Envelope {
  id: string
  title: string
  category: Category
  message?: string
  fileName: string
  fileSize: number
  /** SHA-256 of the file, 64 lowercase hex characters, no 0x. */
  hash: string
  /** Key of a built-in sample document, so the sheet can show its text. */
  docId?: string
  storage: Storage
  cid?: string
  sender: Address
  routing: Routing
  signers: SignerSlot[]
  status: EnvelopeStatus
  createdAt: number
  completedAt?: number
  anchor: { block: number; tx: string; at: number }
  events: AuditEvent[]
}

export type WalletStatus = "disconnected" | "connecting" | "connected"

export interface WalletState {
  status: WalletStatus
  address?: Address
}

export type Speed = "realistic" | "fast"

export interface DemoSettings {
  failNext: boolean
  speed: Speed
}

export interface DemoState {
  version: 1
  wallet: WalletState
  settings: DemoSettings
  envelopes: Envelope[]
  /** Latest simulated block height. */
  block: number
}

/** What a wallet prompt asks the visitor to approve. */
export type WalletRequest =
  | { kind: "connect" }
  | {
      kind: "sign"
      /** EIP-712 message fields shown verbatim in the prompt. */
      message: { documentHash: string; title: string; signer: Address; role: "sender" | "signer"; decision: "approve" | "decline"; nonce: number }
    }
  | { kind: "tx"; action: "register" | "sign" | "decline" | "void"; title: string; fee: string }

/** encrypting / pinning: the optional IPFS copy, between the signature and the registration. */
export type TxPhase = "idle" | "prompt" | "encrypting" | "pinning" | "pending" | "confirmed" | "failed"

export interface TxResult {
  ok: boolean
  tx: string
  block?: number
  error?: "rejected" | "dropped" | "reverted"
}

export type VerifyResult =
  | { kind: "match"; envelope: Envelope }
  | { kind: "none"; hash: string; nearest?: Envelope }
