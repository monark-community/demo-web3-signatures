# SignChain

**Signatures anyone can check, forever.** SignChain collects wallet signatures on a document's fingerprint (its SHA-256 hash) and anchors them on-chain, so anyone holding the file can prove who signed that exact version, and when, without trusting a vendor or handing over the document.

This repository is an interactive **demo** with simulated data: no real chain, wallet, IPFS node or backend. Fingerprints are real SHA-256 digests computed in the browser; everything else is simulated.

- Project documentation: https://www.monark.io/en/project/web3-signatures
- Target host: https://signchain.monark.io
- An independent project incubated by [Monark](https://www.monark.io).

## What you can do in the demo

1. **Connect** a simulated wallet (confirm or reject).
2. **Send a document**: drop any file (it's hashed locally, never uploaded) or use a sample contract, add signers from the address book or by address, pick parallel or in-order signing and where the document lives (fingerprint only, or an encrypted IPFS copy), then sign (EIP-712 prompt) and register (transaction).
3. **Co-sign, decline or void**: sign the Halden Freight agreement, let the CFO sign (simulated), watch the envelope complete and the wax seal press; download the JSON proof receipt; decline with a reason; void an envelope you sent.
4. **Verify** on the public verifier: drop a file or paste a fingerprint. Try the signed photo licence, then the same licence with one number changed, and see the fingerprints diverge.

"Demo controls" in the app header can fail the next transaction, speed up blocks, and reset the demo.

## Run it locally

Requirements: Node 22 and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3153
```

Checks and production build:

```bash
pnpm lint
pnpm typecheck
pnpm build && pnpm start   # http://localhost:3153
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` optionally overrides the canonical URL used in metadata and the sitemap (default `https://signchain.monark.io`).

Screenshots of every page and flow (with the production server running):

```bash
pnpm screenshots            # writes docs/screenshots/
pnpm screenshots en-390     # only one variant
```

## How the simulation works

Everything lives in `src/lib/demo/`, behind a small typed API, so it can be swapped for wagmi/viem and a real registry contract without touching the UI:

| File | Role |
|-|-|
| `types.ts` | Envelopes, signer slots, audit events, wallet and settings types |
| `sha256.ts` | Real SHA-256 (Web Crypto for files, a portable implementation for text) |
| `documents.ts` | Sample documents; their fingerprints are the SHA-256 of these exact texts |
| `seed.ts` | The persona (Léa Marchand, Tessel Robotics), address book and seeded envelopes |
| `chain.ts` | Simulated network: addresses, signatures, CIDs, fees, block latency |
| `store.ts` | External store persisted to `localStorage` (every access in try/catch) and the wallet-prompt queue |
| `ops.ts` | Actions: connect, create, sign, decline, void, simulate a counterparty, verify |

Each action goes through the same steps a real dApp would: a wallet prompt (the signed message or the transaction, which the visitor can reject), a pending state while "waiting for a block" (1.2 to 2.5 s), then confirmed with a block number or failed with nothing recorded. With wagmi/viem these map to `signTypedData`, `writeContract` and `waitForTransactionReceipt`.

## Project structure

```
src/
  app/[locale]/(site)/   home, how-it-works, verify, credits, pricing (unlinked), 404
  app/[locale]/app/      demo workspace: inbox, new envelope, envelope detail
  app/                   icon, sitemap, robots; opengraph-image per locale
  components/site/       header, footer, mobile menu, theme and locale switches, seal mark
  components/sheet/      document sheet, fingerprint, signature stroke, status chip
  components/demo/       app shell, wallet prompt, flows, verifier
  components/ui/         shadcn/ui + Monark UI registry components (wallet, connect-wallet, network-badge, tx-status)
  i18n/                  EN/FR dictionaries, locale config, client provider
  lib/demo/              simulated chain and data layer
docs/                    site plan, asset credits, screenshots
```

Routes are localised (`/en/…`, `/fr/…`); `/` redirects to the visitor's preferred language (`src/proxy.ts`).

## Deploy to Vercel

Import the repository in Vercel and deploy with the framework defaults (Next.js, pnpm detected from the lockfile, Node 22 from `engines`). No `vercel.json` and no environment variables are required.

## Stack

Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, shadcn/ui on the [Monark UI registry](https://ui.monark.io), lucide-react, next-themes, sonner. Playwright is a dev dependency for screenshots only.
