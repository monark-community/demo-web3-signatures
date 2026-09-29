import { sha256Text } from "./sha256"
import type { Address, Speed } from "./types"

/**
 * The simulated chain: ids, addresses, signatures, block timing and latency.
 * Nothing here talks to a network. Randomness uses Math.random on purpose
 * (crypto.randomUUID is unavailable on plain-http LAN previews).
 */

export const NETWORK = { name: "Sepolia", chainId: 11155111, blockTime: 12, currency: "SepoliaETH" }
export const REGISTRY_ADDRESS: Address = "0x5c9b1e0a7d3f24c8b6e1a90f3d7c25e84b1a6f02"

export function randomHex(chars: number): string {
  let s = ""
  while (s.length < chars) s += Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, "0")
  return s.slice(0, chars)
}

export const randomTx = () => `0x${randomHex(64)}`
export const randomId = () => randomHex(10)

/** A stable, valid-looking address derived from a label. */
export function addressFor(label: string): Address {
  return `0x${sha256Text(`address:${label}`).slice(0, 40)}`
}

/** A deterministic 65-byte signature over (fingerprint, signer, decision). */
export function signatureFor(hash: string, signer: Address, decision: "approve" | "decline" = "approve"): string {
  const r = sha256Text(`r:${hash}:${signer}:${decision}`)
  const s = sha256Text(`s:${hash}:${signer}:${decision}`)
  return `0x${r}${s}1b`
}

/** A CIDv1-shaped identifier for the encrypted IPFS copy (base32, lowercase). */
export function cidFor(hash: string): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567"
  const src = sha256Text(`cid:${hash}`) + sha256Text(`cid2:${hash}`)
  let out = "bafybei"
  for (let i = 0; i < 52; i++) out += alphabet[parseInt(src.slice(i * 2, i * 2 + 2), 16) % 32]
  return out
}

export function isAddress(value: string): value is Address {
  return /^0x[0-9a-fA-F]{40}$/.test(value.trim())
}

export function latency(speed: Speed, kind: "prompt" | "block"): number {
  if (speed === "fast") return kind === "block" ? 450 : 250
  return kind === "block" ? 1400 + Math.random() * 1100 : 700
}

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** A realistic testnet fee string for the prompt, e.g. "0.00021". */
export function feeEstimate(action: "register" | "sign" | "decline" | "void"): string {
  const base = { register: 0.00031, sign: 0.00019, decline: 0.00017, void: 0.00014 }[action]
  return (base + Math.random() * 0.00004).toFixed(5)
}
