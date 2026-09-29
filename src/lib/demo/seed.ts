import { addressFor, cidFor, signatureFor } from "./chain"
import { docBytes, SAMPLE_DOCS } from "./documents"
import { sha256Text } from "./sha256"
import type { Address, AuditEvent, Category, DemoState, Envelope, Party, Routing, SignerSlot, Storage } from "./types"

/** The visitor, once the demo wallet is connected. */
export const ME: Party = {
  address: addressFor("lea.marchand"),
  name: "Léa Marchand",
  org: "Tessel Robotics",
  title: "Head of Operations",
}

/** The seeded address book: every counterparty in the demo. */
export const PARTIES: Party[] = [
  ME,
  { address: addressFor("amir.haddad"), name: "Amir Haddad", org: "Tessel Robotics", title: "Chief Financial Officer" },
  { address: addressFor("nora.lindqvist"), name: "Nora Lindqvist", org: "Halden Freight", title: "Commercial Director" },
  { address: addressFor("jonah.reyes"), name: "Jonah Reyes", org: "Candidate", title: "Senior Firmware Engineer" },
  { address: addressFor("ines.duval"), name: "Inès Duval", org: "Independent", title: "Photographer" },
  { address: addressFor("helene.tremblay"), name: "Hélène Tremblay", org: "Tessel Robotics", title: "Board Chair" },
  { address: addressFor("marcus.webb"), name: "Marcus Webb", org: "Tessel Robotics", title: "Director" },
  { address: addressFor("priya.raman"), name: "Priya Raman", org: "Quillon Bio", title: "Legal Counsel" },
  { address: addressFor("claire.beaulieu"), name: "Claire Beaulieu", org: "Fondation Boréale", title: "Grants Officer" },
  { address: addressFor("kofi.mensah"), name: "Kofi Mensah", org: "Mensah Studio", title: "Industrial Designer" },
]

export const partyByName = (first: string): Party => {
  const p = PARTIES.find((x) => x.name.startsWith(first))
  if (!p) throw new Error(`unknown party ${first}`)
  return p
}

export function partyFor(address: Address): Party | undefined {
  return PARTIES.find((p) => p.address.toLowerCase() === address.toLowerCase())
}

const HOUR = 3_600_000
const DAY = 24 * HOUR
export const GENESIS_BLOCK = 7_342_118

interface SeedSigner {
  who: string
  status: SignerSlot["status"]
  /** Hours before "now" when they signed or declined. */
  hoursAgo?: number
  reason?: string
}

interface SeedEnvelope {
  id: string
  docId: string
  title: string
  category: Category
  message?: string
  sender: string
  routing: Routing
  storage: Storage
  createdHoursAgo: number
  signers: SeedSigner[]
}

const SEED: SeedEnvelope[] = [
  {
    id: "msa-halden",
    docId: "msa-halden",
    title: "Master Services Agreement — Halden Freight",
    category: "services",
    message: "Léa, as agreed on Tuesday: 14 departures a month, 97% on time. Amir signs after you.",
    sender: "Nora",
    routing: "sequential",
    storage: "ipfs",
    createdHoursAgo: 30,
    signers: [
      { who: "Nora", status: "signed", hoursAgo: 29.5 },
      { who: "Léa", status: "pending" },
      { who: "Amir", status: "waiting" },
    ],
  },
  {
    id: "grant-boreale",
    docId: "grant-boreale",
    title: "Applied research grant FB-2026-031",
    category: "grant",
    message: "Congratulations again. Both Tessel signatures are needed before the first instalment.",
    sender: "Claire",
    routing: "parallel",
    storage: "hash",
    createdHoursAgo: 52,
    signers: [
      { who: "Claire", status: "signed", hoursAgo: 51.8 },
      { who: "Léa", status: "pending" },
      { who: "Amir", status: "pending" },
    ],
  },
  {
    id: "offer-reyes",
    docId: "offer-reyes",
    title: "Offer letter — Senior Firmware Engineer",
    category: "employment",
    message: "Jonah, we'd love to have you on Motion Control. Questions welcome before you sign.",
    sender: "Léa",
    routing: "parallel",
    storage: "hash",
    createdHoursAgo: 20,
    signers: [
      { who: "Léa", status: "signed", hoursAgo: 19.9 },
      { who: "Jonah", status: "pending" },
    ],
  },
  {
    id: "licence-duval",
    docId: "licence-duval",
    title: "Photography licence — Autumn catalogue",
    category: "licence",
    sender: "Léa",
    routing: "parallel",
    storage: "ipfs",
    createdHoursAgo: 12 * 24 + 5,
    signers: [
      { who: "Léa", status: "signed", hoursAgo: 12 * 24 + 4.9 },
      { who: "Inès", status: "signed", hoursAgo: 12 * 24 + 1.2 },
    ],
  },
  {
    id: "resolution-2026-07",
    docId: "resolution-2026-07",
    title: "Board resolution 2026-07 — Lachine warehouse lease",
    category: "approval",
    sender: "Hélène",
    routing: "sequential",
    storage: "hash",
    createdHoursAgo: 19 * 24,
    signers: [
      { who: "Hélène", status: "signed", hoursAgo: 19 * 24 - 0.2 },
      { who: "Marcus", status: "signed", hoursAgo: 18 * 24 + 6 },
      { who: "Amir", status: "signed", hoursAgo: 18 * 24 + 2 },
      { who: "Léa", status: "signed", hoursAgo: 17 * 24 + 21 },
    ],
  },
  {
    id: "nda-quillon",
    docId: "nda-quillon",
    title: "Mutual NDA — Quillon Bio",
    category: "nda",
    sender: "Léa",
    routing: "parallel",
    storage: "hash",
    createdHoursAgo: 6 * 24,
    signers: [
      { who: "Léa", status: "signed", hoursAgo: 6 * 24 - 0.1 },
      { who: "Priya", status: "declined", hoursAgo: 5 * 24 + 3, reason: "We need a 3-year term, not 5. I'll send a revised draft this week." },
    ],
  },
]

/** Block height a given number of hours ago, on a 12-second chain. */
const blockAt = (tip: number, hoursAgo: number) => tip - Math.round((hoursAgo * 3600) / 12)
const txFrom = (label: string) => `0x${sha256Text(`tx:${label}`)}`

export function createSeed(now = Date.now()): DemoState {
  const tip = GENESIS_BLOCK
  const envelopes: Envelope[] = SEED.map((s) => {
    const doc = SAMPLE_DOCS[s.docId]!
    const hash = sha256Text(doc.text)
    const sender = partyByName(s.sender).address
    const createdAt = now - s.createdHoursAgo * HOUR
    const anchorBlock = blockAt(tip, s.createdHoursAgo)
    const events: AuditEvent[] = [
      { kind: "created", at: createdAt, actor: sender, block: anchorBlock, tx: txFrom(`${s.id}:create`) },
    ]
    if (s.storage === "ipfs") events.push({ kind: "pinned", at: createdAt + 20_000, actor: sender, note: cidFor(hash) })

    const signers: SignerSlot[] = s.signers.map((x) => {
      const address = partyByName(x.who).address
      if (x.status === "signed" || x.status === "declined") {
        const at = now - (x.hoursAgo ?? 0) * HOUR
        const block = blockAt(tip, x.hoursAgo ?? 0)
        const tx = txFrom(`${s.id}:${x.who}`)
        events.push({ kind: x.status, at, actor: address, block, tx, note: x.reason })
        return {
          address,
          status: x.status,
          signature: signatureFor(hash, address, x.status === "signed" ? "approve" : "decline"),
          signedAt: at,
          block,
          tx,
          reason: x.reason,
        }
      }
      return { address, status: x.status }
    })

    let status: Envelope["status"] = "awaiting"
    let completedAt: number | undefined
    if (signers.some((x) => x.status === "declined")) status = "declined"
    else if (signers.every((x) => x.status === "signed")) {
      status = "completed"
      completedAt = Math.max(...signers.map((x) => x.signedAt ?? 0))
      const last = signers.find((x) => x.signedAt === completedAt)
      events.push({ kind: "completed", at: completedAt, block: last?.block, tx: last?.tx })
    }
    events.sort((a, b) => a.at - b.at)

    return {
      id: s.id,
      title: s.title,
      category: s.category,
      message: s.message,
      fileName: doc.fileName,
      fileSize: docBytes(s.docId),
      hash,
      docId: s.docId,
      storage: s.storage,
      cid: s.storage === "ipfs" ? cidFor(hash) : undefined,
      sender,
      routing: s.routing,
      signers,
      status,
      createdAt,
      completedAt,
      anchor: { block: anchorBlock, tx: txFrom(`${s.id}:create`), at: createdAt },
      events,
    }
  })

  return {
    version: 1,
    wallet: { status: "disconnected" },
    settings: { failNext: false, speed: "realistic" },
    envelopes: envelopes.sort((a, b) => b.createdAt - a.createdAt),
    block: tip,
  }
}

export { DAY, HOUR }
