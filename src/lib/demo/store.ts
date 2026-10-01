"use client"

import { useSyncExternalStore } from "react"

import { createSeed } from "./seed"
import type { DemoState, WalletRequest } from "./types"

/**
 * The demo's single source of truth: a tiny external store persisted to
 * localStorage under one key, every access wrapped in try/catch. The pending
 * wallet prompt lives next to it in memory (never persisted).
 */

const STORAGE_KEY = "signchain-demo-v1"

let state: DemoState | null = null
let storageOk = true
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function persist() {
  if (!state) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    storageOk = true
  } catch {
    storageOk = false
  }
}

function load(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DemoState
    if (parsed?.version !== 1 || !Array.isArray(parsed.envelopes)) return null
    if (parsed.wallet.status === "connecting") parsed.wallet.status = "disconnected"
    return parsed
  } catch {
    storageOk = false
    return null
  }
}

/** Load saved state, or seed a fresh demo. Idempotent. */
export function initDemo() {
  if (state) return
  state = load() ?? createSeed()
  persist()
  emit()
}

/** Start over with fresh seed data, keeping the wallet connected if it was. */
export function resetDemo() {
  const wallet = state?.wallet
  state = createSeed()
  if (wallet?.status === "connected") state.wallet = wallet
  persist()
  emit()
}

export function getState(): DemoState {
  if (!state) initDemo()
  return state!
}

export function setState(update: (s: DemoState) => DemoState) {
  state = update(getState())
  persist()
  emit()
}

export function isStorageAvailable() {
  return storageOk
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** null during server render and before the first client load. */
export function useDemo(): DemoState | null {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => null
  )
}

// ---- Wallet prompt (the simulated wallet extension) ----

export interface PromptState {
  id: number
  request: WalletRequest
}

let prompt: PromptState | null = null
let resolver: ((approved: boolean) => void) | null = null
let promptSeq = 0

/** Ask the simulated wallet; resolves true on Confirm, false on Reject. */
export function requestWallet(request: WalletRequest): Promise<boolean> {
  if (resolver) resolver(false)
  return new Promise((resolve) => {
    prompt = { id: ++promptSeq, request }
    resolver = resolve
    emit()
  })
}

export function answerPrompt(approved: boolean) {
  const r = resolver
  prompt = null
  resolver = null
  emit()
  r?.(approved)
}

export function usePrompt(): PromptState | null {
  return useSyncExternalStore(
    subscribe,
    () => prompt,
    () => null
  )
}
