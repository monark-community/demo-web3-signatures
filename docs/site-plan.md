# SignChain: site plan

- Project id: `web3-signatures` · Monark-branded: **false** (an independent product incubated by Monark; Monark appears only as the "Built with Monark" footer credit)
- Authoritative description: https://www.monark.io/en/project/web3-signatures
- Old Lovable site (reference only, kept on `main`): https://signchain.monark.io/
- Canonical site URL assumed: `https://signchain.monark.io` (override with `NEXT_PUBLIC_SITE_URL`)

This file always describes what shipped. Decisions taken while working unattended are marked **Decision**.

---

## 1. Product brief

**Target users.**

- **Senders at small and mid-sized businesses**: operations leads, founders, HR and studio managers who send offer letters, service agreements, licences and board resolutions every week and pay a per-seat e-signature subscription to do it. They want a signature that nobody (including the vendor) can quietly alter or lose.
- **Signers**: candidates, clients, freelancers, board members. They need to see exactly what they sign and sign it in a minute, with the wallet they already use (or an embedded one).
- **Verifiers**: auditors, lawyers, grant officers, a future buyer of the company. They hold a copy of a document and need to know, years later, *who signed this exact file and when*, without an account and without trusting SignChain.

**Core job to be done.** "Get this document signed by these people, and leave behind proof that anyone can check, forever, without calling us." For verifiers: "Tell me, from the file alone, whether it's the one that was signed."

**Domain concepts** (from the documentation page, which wins over the old site):

| Concept | Meaning in SignChain |
|-|-|
| Fingerprint | The document's SHA-256 hash, computed **in the browser**. The same file always gives the same 64 characters; change one byte and every character changes. The file itself never has to leave the sender's device. |
| Envelope | One document plus its signers, routing (everyone at once, or in order), metadata (title, category, message) and status: awaiting signatures, completed, declined or voided. |
| Wallet signature | Each signer signs a structured, human-readable message (EIP-712 typed data) containing the fingerprint, the title and their role. The signature proves the signer's address approved that exact fingerprint. |
| Registry | A smart contract that records `fingerprint → signer address → block timestamp`. It stores no content and no names. |
| Anchor | The on-chain transaction that registers the envelope's fingerprint, and then each signature. Its block number and time are the timestamp. |
| Storage choice | Fingerprint only (default: nothing leaves the device), or fingerprint plus an **encrypted** copy pinned to IPFS, addressed by its content identifier (CID). |
| Verification | Anyone re-hashes a file (or pastes a fingerprint) and compares it with the registry: match with signers and times, registered but not fully signed, or no record for this exact file. |
| Proof receipt | A small JSON file per envelope (fingerprint, signers, signatures, blocks, transactions) that can be verified independently of SignChain. |
| Audit trail | Every event of an envelope in order: created, registered, signed, declined, voided, completed, each with its block. |

**What the Lovable version got wrong or left out.**

- Verification was theatre: any string typed into the box returned "Valid" with the same two invented signers. A tampered file could never fail, which is the one thing verification exists to show.
- The signing button showed nothing about *what* was signed. No message preview, no fingerprint, no network, no fee, no failure state.
- Multi-signer was a static list of two rows. No routing, no counterparty progress, no decline, no void, no completion moment, no receipt.
- "What leaves my device?" was never answered, although privacy without custody is the documentation's main promise; IPFS was a bullet point, never a choice.
- Uploads claimed to "detect 1–8 signature fields" with a random number, and dashboard numbers were hard-coded.
- Generic blue shadcn look with gradient panels; no identity; no French; no dark mode.

## 2. Value proposition

> **For businesses that send agreements every week, SignChain collects wallet signatures on a document's fingerprint and anchors them on-chain, so anyone can prove who signed which exact file, and when, without trusting a vendor or handing over the document.**

Supporting benefits (outcomes):

1. **Your documents stay yours.** Only a 64-character fingerprint leaves your device unless you choose an encrypted copy; there is no vendor archive to leak or lose.
2. **Disputes end with a file drop.** Anyone holding the document can check it against the public record in seconds: signers, times, and whether a single character changed.
3. **Signers know exactly what they approve.** Every signature request shows the fingerprint, title and role being signed, in plain language, before the wallet signs.

## 3. Hero

- **Headline:** "Signatures anyone can check, forever." (5 words) · FR « Des signatures que tout le monde peut vérifier. »
- **Subheadline:** "SignChain turns each document into a fingerprint, collects wallet signatures on it and records them on-chain. The file stays with you; the proof is public." · FR « SignChain réduit chaque document à une empreinte, y recueille les signatures des portefeuilles et les inscrit on-chain. Le fichier reste chez vous ; la preuve est publique. »
- **Primary CTA:** "Send a document" → `/{locale}/app/new` (connects the demo wallet first) · FR « Envoyer un document »
- **Secondary CTA:** "Verify a file" → `/{locale}/verify` · FR « Vérifier un fichier »
- **Hero visual: "The sealed sheet"**, built in code. A real envelope from the demo, drawn as a document sheet: title ("Master Services Agreement — Halden Freight × Tessel Robotics"), three signature lines, the fingerprint printed in eight mono blocks, and a wax seal. On load the fingerprint prints block by block, two signature strokes draw themselves (each stroke generated from that signer's signature bytes), the third line stays "awaiting", and a block number ticks in under the seal. **Why:** the product's idea is "a file becomes a fingerprint, signatures attach to the fingerprint". A photo of a pen can't show that; the UI shows it in two seconds and is a preview of the real app.

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`); `/` redirects by `Accept-Language` (fallback English).

| Route | Purpose | Sections, in order |
|-|-|-|
| `/{locale}` | Explain the idea fast and send people into the product. | Hero (sealed sheet) · "What leaves your device" (the file vs the fingerprint, side by side, with a live hashing toy: type in a box, watch the fingerprint change completely) · How a signature is made (fingerprint → signature → anchor → verify, four steps using real UI fragments) · Who signs with SignChain (three photo use cases: offer letters, creative licences, collective approvals) · Verify teaser (drop zone linking to `/verify`) · FAQ · Closing CTA |
| `/{locale}/verify` | Public verification portal: no wallet, no account. **Justified:** verifiers are a distinct audience (auditors, lawyers) who must never be asked to sign in; it's also the product's proof. | Drop a file / paste a fingerprint · Try with samples (original, one number changed) · Result: match certificate, registered-but-unsigned, or no record with the tamper diff · How verification works (3 lines) |
| `/{locale}/how-it-works` | The mechanics for careful buyers, legal teams and developers. **Justified:** a signature product must explain exactly what is signed, stored and provable; this is also where the legal caveats live. | The fingerprint · The signed message (EIP-712 preview) · The registry contract (interface) · Storage choice · Verification · Legal standing (e-signature laws, not legal advice) · For developers (contract + verify snippet, how the demo data layer maps to it) · CTA |
| `/{locale}/app` | Demo workspace: envelopes. Gate (connect demo wallet) first. | Greeting + three counters (needs you, waiting on others, completed) · Tabs (Needs your signature / Waiting on others / Completed / All) with search · envelope rows · empty states |
| `/{locale}/app/new` | Send a document for signature. | Step 1 Document (drop or sample; fingerprint prints) · Step 2 Details (title, category, message) · Step 3 Signers (address book or paste address; include yourself; routing) · Step 4 Storage (fingerprint only / encrypted IPFS copy) · Review → sign → register |
| `/{locale}/app/envelopes/[id]` | One envelope: review, sign, decline, void, receipt. | Status header · Document sheet (preview or file card) + fingerprint · Signers with strokes · Your action panel · Audit trail · Receipt / verify link |
| `/{locale}/credits` | Photo credits (linked from the footer). | List |
| `/{locale}/pricing` | Internal strategy review only. **Never linked**, not in the sitemap, `noindex, nofollow`. | Model · Tiers · Reasoning |
| 404 | Friendly not-found with links home, to the app and to verify. | |

**Header (site):** SignChain mark + wordmark · How it works · Verify · Use cases (home anchor) · EN/FR · theme · "Open the app".
**Header (app):** mark · Envelopes · New · Verify · "Demo · simulated" badge · network badge (Sepolia testnet) · wallet · Demo controls (fail next transaction, speed, reset demo).
**Mobile:** mark + menu button opening a full-height sheet (links, switches, CTA). In the app, a bottom tab bar (Envelopes / New / Verify).
**Footer:** one-line description · links (How it works, Verify, Open the app, Credits) · "Demo · simulated data" · "Built with Monark" credit (muted, 12–13px, links to monark.io) · project documentation and GitHub links.

## 5. Feature highlights

| Feature | User benefit | Where | Proven by |
|-|-|-|-|
| Local fingerprinting | Your document never leaves your device | Home "What leaves your device" toy, `/app/new` step 1 | Flow 2 |
| Readable signing requests | You know exactly what you approve | Wallet prompt in every signature, how-it-works | Flows 2, 3 |
| Multi-signer routing (parallel or in order) with decline and void | Everyone signs in the right order; a "no" is recorded, not lost | `/app/new` step 3, envelope page | Flows 2, 3 |
| Public verification with tamper detection | Disputes end with a file drop | `/verify`, home teaser | Flow 4 |
| Storage choice (fingerprint only / encrypted IPFS) | Keep custody, or keep a decentralised copy, deliberately | `/app/new` step 4, envelope page | Flow 2 |
| Proof receipt + audit trail | Evidence that outlives the vendor | Envelope page | Flow 3 |

## 6. Key flows

Every transaction goes through the same simulated wallet: prompt (confirm / reject) → pending (spinner, "Waiting for block…", 1.2–2.5 s, or ~0.5 s in fast mode) → confirmed (block number, short tx hash) or failed (reason, "Nothing was recorded", Retry). "Fail the next transaction" in Demo controls forces a failure.

1. **Connect.** Open `/app` → gate explains that the wallet is only a key → "Connect demo wallet" → prompt (SignChain wants to see your address, on Sepolia testnet) → Reject shows an inline error with Try again; Confirm shows the workspace with "Léa Marchand · 0x7a3F…c21D".
2. **Send a document.** `/app/new` → drop any file (hashed locally; >25 MB and empty files rejected with a message) or "Use a sample" → fingerprint prints → title/category/message (validated) → signers: yourself + picks from the address book or a pasted `0x…` address (invalid addresses flagged), routing → storage (encrypted IPFS copy shows its CID after pinning) → Review → **Sign** (EIP-712 prompt showing the typed data) → **Register** (tx prompt with testnet fee) → pending → confirmed: envelope created, your signature stroke drawn, next signer notified; failed: nothing recorded, Retry keeps the draft.
3. **Co-sign and complete.** Inbox "Needs your signature" → Master Services Agreement from Halden Freight (sequential: Halden signed, you next, then your CFO) → review sheet + fingerprint → Sign → prompt → pending → confirmed → CFO becomes "next" → "Simulate Amir signing" (demo) → envelope completes: wax seal presses onto the sheet, "Completed" certificate, proof receipt download, verify link. Alternative: **Decline** with a reason → recorded on-chain, sender sees it; sender can **Void** an envelope still awaiting signatures.
4. **Verify.** `/verify` → drop the original file (or "Try the signed original") → green certificate: title, fingerprint, each signer with time and block, anchor tx → "Try a copy with one number changed" → no record; the two fingerprints are shown aligned, every differing character marked, with the one-word change highlighted in the text → paste a fingerprint of an envelope still awaiting signatures → "Registered, not fully signed (2 of 3)". Invalid fingerprint input shows a format error.

## 7. Content (EN / FR)

Full strings live in `src/i18n/dictionaries/en.ts` and `fr.ts` (typed; French is written natively). Key section copy:

**Home**

| Section | EN | FR |
|-|-|-|
| Eyebrow | Wallet signatures · on-chain proof | Signatures par portefeuille · preuve on-chain |
| H1 | Signatures anyone can check, forever. | Des signatures que tout le monde peut vérifier. |
| Sub | (see §3) | (voir §3) |
| Leaves device H2 | What leaves your device: 64 characters. | Ce qui quitte votre appareil : 64 caractères. |
| Leaves device body | SignChain never needs your document. Your browser computes its fingerprint, and only that fingerprint is signed and recorded. Try it: change one letter and watch every character move. | SignChain n'a jamais besoin de votre document. Votre navigateur en calcule l'empreinte, et seule cette empreinte est signée puis inscrite. Essayez : changez une lettre, et chaque caractère bouge. |
| Steps H2 | Four steps, one proof. | Quatre étapes, une preuve. |
| Steps | Fingerprint it · Sign the fingerprint · Anchor it on-chain · Verify it anywhere | L'empreinte · La signature · L'ancrage on-chain · La vérification, partout |
| Use cases H2 | Who signs with SignChain | Qui signe avec SignChain |
| Use case 1 | Offer letters. Candidates sign from their phone; HR keeps a record no one can backdate. | Lettres d'offre. Les candidats signent depuis leur téléphone ; les RH gardent une trace que personne ne peut antidater. |
| Use case 2 | Creative licences. Photographers and illustrators prove which version was licensed, to whom, and when. | Licences créatives. Photographes et illustrateurs prouvent quelle version a été cédée, à qui et quand. |
| Use case 3 | Collective approvals. Boards, co-ops and DAOs sign resolutions in order, and members can check them later. | Décisions collectives. Conseils, coops et DAO signent leurs résolutions dans l'ordre ; les membres peuvent les vérifier ensuite. |
| Verify teaser | Holding a signed file? Check it here, no account needed. | Vous avez un fichier signé ? Vérifiez-le ici, sans compte. |
| Closing | Send your first envelope in under a minute. | Envoyez votre premier document en moins d'une minute. |

**FAQ** (EN / FR)

1. *Do you keep a copy of my document?* No. Only its fingerprint is recorded. If you choose an IPFS copy, it's encrypted before it leaves your browser. / *Gardez-vous une copie de mon document ?* Non. Seule son empreinte est inscrite. Si vous choisissez une copie IPFS, elle est chiffrée avant de quitter votre navigateur.
2. *Is a wallet signature legally binding?* In many places an electronic signature is valid when you can show who signed and that they meant to (for example ESIGN in the US, eIDAS in the EU, and Québec's IT framework act). SignChain gives you that evidence; whether it suffices for a given contract depends on the law that applies. This is not legal advice. / *Une signature par portefeuille a-t-elle une valeur juridique ?* …
3. *Can someone verify without SignChain?* Yes. The registry is a public contract: re-hash the file with any SHA-256 tool and look up the fingerprint. The proof receipt contains everything needed. / …
4. *What if one character changes?* The fingerprint changes completely, so the edited file has no record. Verification shows it immediately. / …
5. *What if a signer loses their wallet?* Their past signatures stay valid; they sign new documents with a new address. Revoking an address is on the roadmap. / …
6. *Which network does this demo use?* A simulated Sepolia testnet. Nothing here touches real funds or a real chain. / …

**Empty and error states** (EN / FR): "No envelopes need your signature. Nice." / « Aucun document n'attend votre signature. » · "Nothing waiting on others." / « Rien en attente chez les autres. » · "No completed envelopes yet. They appear here, sealed." / « Aucun document finalisé pour l'instant. Ils apparaîtront ici, scellés. » · "No envelope matches “{q}”." / « Aucun document ne correspond à « {q} ». » · "Wallet connection rejected. Nothing was shared." / « Connexion refusée. Rien n'a été partagé. » · "Transaction failed: the network dropped it. Nothing was recorded." / « Transaction échouée : le réseau l'a abandonnée. Rien n'a été inscrit. » · "This file is empty." / « Ce fichier est vide. » · "Files up to 25 MB in this demo." / « Fichiers de 25 Mo maximum dans cette démo. » · "That isn't a wallet address (0x + 40 hex characters)." / « Ce n'est pas une adresse de portefeuille (0x + 40 caractères hexadécimaux). » · "A fingerprint is 64 hexadecimal characters." / « Une empreinte compte 64 caractères hexadécimaux. » · "No record for this exact file." / « Aucune trace de ce fichier exact. » · 404 "This page was never signed." / « Cette page n'a jamais été signée. »

## 8. Aesthetics

**Concept: "Legal paper, sealed with math."** Signing is an old ritual (paper, ink, a wax seal) and SignChain keeps it, but replaces trust in a notary with a checksum. The site looks like a well-set contract: warm bond paper, black ink, oxblood wax, and the hash itself printed in mono as the most important thing on the page. Businesses and their lawyers should feel "serious, exact, calm", not "crypto".

**Palette** (shadcn roles; ratios computed with `scripts/tmp-contrast.mjs` before deletion, WCAG 2.1):

| Role | Light ("bond paper") | Dark ("reading room") |
|-|-|-|
| background | `#F4F2EC` | `#121315` |
| foreground | `#1C1B18` (15.4:1 on bg) | `#ECE9E2` (15.3:1) |
| card | `#FCFBF8` (fg 16.6:1) | `#1A1B1E` (fg 14.2:1) |
| primary (oxblood wax) | `#7A1E2C` (9.2:1 on bg, text-safe) | `#E7919B` (7.9:1 on bg) |
| primary-foreground | `#FCF6F3` (9.6:1 on primary) | `#2B0A11` (7.7:1 on primary) |
| muted / muted-foreground | `#E9E6DE` / `#5B574F` (5.8:1; 6.4:1 on bg) | `#232428` / `#A9A59C` (6.3:1; 7.6:1 on bg) |
| accent / accent-foreground | `#F1E4DF` / `#5C1622` (10.6:1) | `#3A1B22` / `#F5D3D8` (11.2:1) |
| border / input | `#D8D3C8` / `#CBC5B8` | `#303136` / `#3A3B41` |
| ring | `#7A1E2C` | `#E7919B` |
| destructive | `#B42A12` vermilion (5.7:1 on bg) | `#F28266` (7.2:1) |
| success (signed, custom) | `#1D6A46` (5.9:1 on bg) | `#6CC597` (8.9:1) |
| warning (pending, custom) | `#855A00` (5.4:1 on bg) | `#E2B252` (9.5:1) |
| chart-1…5 | `#7A1E2C` `#1D6A46` `#855A00` `#46505E` `#A5604A` | `#E7919B` `#6CC597` `#E2B252` `#9AA5B5` `#D99A82` |

Status colour is always paired with an icon and a word (Signed, Awaiting, Declined, No record). Destructive is vermilion, deliberately hotter and lighter than the oxblood primary so "failed" never reads as "brand".

**Type** (two families via `next/font/google`):

- **Schibsted Grotesk** (400, 500, 600, 700, 800): headings and UI. A sharp, newspaper-born grotesk; it reads like a well-typeset agreement, not a startup template. Scale: 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48 / 64 (hero on desktop), headings weight 700–800, tracking −0.02em.
- **JetBrains Mono** (400, 500): fingerprints, addresses, block numbers, tx hashes, and small uppercase eyebrows (11–12px, +0.08em) styled like form-field labels on a contract. The hash is the product, so mono is a first-class voice, not a code afterthought.
- **Decision:** the Monark registry theme sets Nunito Sans; it's overridden here (`--font-sans`) because this product has its own identity.

**Logo.** A wax seal: an oxblood disc with a 16-notch scalloped edge and a single paper-coloured pen stroke across it, next to the wordmark "SignChain" in Schibsted Grotesk 800. Favicon = the seal alone (`src/app/icon.svg`). The mark is also the "completed" seal in the app.

**Shape.** Paper sheets have a 2px radius (paper is square) and a hard, blur-free stacked shadow (`4px 4px 0` in border colour) suggesting a pile of pages; controls 6px; pills only for status chips. 1px hairline borders; ruled lines (like signature lines) as dividers. Motion: 150–250 ms ease-out for UI; the three signature moments below run 0.6–1.2 s once; everything collapses to instant under `prefers-reduced-motion`.

**Imagery.** Photography only for people and context (use cases): natural light, warm neutral grade, real desks and rooms, no staged handshakes, no screens-with-code, no floating 3D. Everything about the mechanism (fingerprints, signatures, the registry) is drawn in code.

**Signature moments.**

1. **The fingerprint prints.** When a file is dropped, its SHA-256 appears block by block in eight groups of eight, like a typewriter stamping a serial number, then settles into a ruled box.
2. **Your signature, drawn from your signature.** Every signer's line gets a pen stroke generated deterministically from their signature bytes; it draws itself when the signature confirms. When the last one lands, the wax seal presses onto the sheet.
3. **The tamper diff.** On `/verify`, a modified file's fingerprint is laid under the original's; every differing character is struck in vermilion, showing that one changed word moved ~60 of 64 characters.

**What we deliberately avoid, and why.** No purple or blue "AI" gradients, glass, neon or glow: legal buyers read those as speculative. No coins, tokens or price tickers: SignChain doesn't move value. No script "handwriting" fonts faking signatures: our strokes are derived from real signature bytes. No stock handshake or pen close-ups as filler. No default shadcn zinc look: every component is re-themed to paper, ink and wax. No Monark orange; Monark appears only in the footer credit.

## 9. Assets

| File | Purpose | Placement |
|-|-|-|
| `public/images/offer-letter.jpg` | Two people reviewing and signing an offer at a desk | Home, use case "Offer letters" |
| `public/images/creative-licence.jpg` | Illustrator at her desk in a warm studio | Home, use case "Creative licences" |
| `public/images/collective-approval.jpg` | A small team reviewing documents around a table | Home, use case "Collective approvals" |

Credits, URLs and photographers are in `docs/assets.md` and on `/credits`. Icons: `lucide-react`, 1.5px stroke. Built in code: the logo and favicon, the sealed-sheet hero, the fingerprint printer, signature strokes, the wax seal, the four-step diagram, the tamper diff, the Open Graph image.

## 10. Pricing strategy

**Model: per-sender subscription; signers and verifiers never pay.** Price the workflow, not the gas: anchoring a fingerprint on an Ethereum layer-2 costs a fraction of a cent, so fees tied to transactions would be noise. Buyers compare against per-seat e-signature tools (roughly $25–45 per user per month), so undercut on price and win on proof.

| Tier | Price | For | Includes |
|-|-|-|-|
| Verify | $0, forever | Anyone | Unlimited verification, no account. It is the network effect: every verifier sees the product working. |
| Solo | $0 | Freelancers, trials | 3 envelopes / month, fingerprint only, parallel routing |
| Team | $15 per sender / month (annual) or $18 monthly | Small businesses | 40 envelopes per sender pooled, sequential routing, encrypted IPFS copies (5 GB), templates, audit export |
| Business | $32 per sender / month | Firms with compliance needs | Unlimited envelopes (fair use), SSO, dedicated registry contract and chain choice, API and webhooks, retention policies |
| Overage / API | $0.40 per envelope | Platforms embedding signing | Pay as you go beyond the pool |

`/pricing` exists for internal review only: never linked, excluded from the sitemap, `robots: { index: false, follow: false }`. No other page mentions prices.

## 11. Out of scope

- No real chain, wallet, IPFS node or backend; everything is simulated in `src/lib/demo/` and persisted in `localStorage`. The SHA-256 fingerprints are real (computed in the browser).
- No PDF rendering, field placement or drawn signatures: SignChain signs the whole file's fingerprint.
- No email delivery, reminders or accounts; the address book is seeded.
- No encryption keys management UI for IPFS copies (the CID is simulated).
- No legal-advice features (notarisation, qualified eIDAS signatures).
- No token, no fees paid in crypto.
