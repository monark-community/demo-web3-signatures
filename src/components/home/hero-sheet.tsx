import { DocumentSheet } from "@/components/sheet/document-sheet"
import { signatureFor } from "@/lib/demo/chain"
import { SAMPLE_DOCS } from "@/lib/demo/documents"
import { GENESIS_BLOCK, partyByName } from "@/lib/demo/seed"
import { sha256Text } from "@/lib/demo/sha256"
import type { Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"
import { formatNumber } from "@/lib/format"

/** The home hero: the seeded Halden MSA, drawn as it stands in the demo. Pure CSS animation, no JS. */
export function HeroSheet({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const d = dict.home.sheet
  const doc = SAMPLE_DOCS["msa-halden"]!
  const hash = sha256Text(doc.text)
  const nora = partyByName("Nora")
  const lea = partyByName("Léa")
  const amir = partyByName("Amir")
  const body = doc.text.split("\n").slice(4, 12).join("\n")
  return (
    <DocumentSheet
      heading={d.title}
      subheading={`${d.parties} · No. HF-TR-2026-014`}
      text={body}
      maxTextLines={8}
      hash={hash}
      hashLabel={d.fingerprint}
      printHash
      printDelay={0.2}
      signers={[
        {
          key: "nora",
          name: nora.name,
          role: `${nora.title}, ${nora.org}`,
          status: "signed",
          signature: signatureFor(hash, nora.address),
          draw: true,
          drawDelay: 1.5,
          statusLabel: d.signed,
          meta: `${d.block} ${formatNumber(locale, GENESIS_BLOCK - 8850)}`,
        },
        {
          key: "lea",
          name: lea.name,
          role: `${lea.title}, ${lea.org}`,
          status: "signed",
          signature: signatureFor(hash, lea.address),
          draw: true,
          drawDelay: 2.4,
          statusLabel: d.signed,
          meta: `${d.block} ${formatNumber(locale, GENESIS_BLOCK + 3)}`,
        },
        {
          key: "amir",
          name: amir.name,
          role: `${amir.title}, ${amir.org}`,
          status: "pending",
          statusLabel: d.awaiting,
        },
      ]}
      seal={{ label: d.anchored, sublabel: `${d.block} ${formatNumber(locale, GENESIS_BLOCK - 9000)}`, press: true, delay: 3.3 }}
    />
  )
}
