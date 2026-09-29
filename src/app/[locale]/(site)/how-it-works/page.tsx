import { ArrowRightIcon, FileSearchIcon, HardDriveIcon, ScaleIcon, ServerIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Fingerprint } from "@/components/sheet/fingerprint"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { NETWORK, REGISTRY_ADDRESS } from "@/lib/demo/chain"
import { SAMPLE_DOCS } from "@/lib/demo/documents"
import { partyByName } from "@/lib/demo/seed"
import { sha256Text } from "@/lib/demo/sha256"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).how
  return pageMetadata(locale, "/how-it-works", d.metaTitle, d.metaDescription)
}

const CONTRACT = `interface ISignChainRegistry {
  event EnvelopeCreated(bytes32 indexed docHash, address indexed sender,
                        address[] signers, bool sequential, string cid);
  event DocumentSigned(bytes32 indexed docHash, address indexed signer,
                       uint64 timestamp);
  event DocumentDeclined(bytes32 indexed docHash, address indexed signer,
                         bytes32 reasonHash);
  event EnvelopeVoided(bytes32 indexed docHash);

  function createEnvelope(bytes32 docHash, address[] calldata signers,
                          bool sequential, string calldata cid) external;
  function sign(bytes32 docHash, bytes calldata sig) external;   // EIP-712
  function decline(bytes32 docHash, bytes32 reasonHash,
                   bytes calldata sig) external;
  function voidEnvelope(bytes32 docHash) external;              // sender only
}`

const VERIFY = `const hash = sha256(await file.arrayBuffer())          // 1. fingerprint
const logs = await client.getContractEvents({            // 2. look it up
  address: REGISTRY, abi, eventName: "DocumentSigned",
  args: { docHash: \`0x\${hash}\` },
})
for (const s of receipt.signatures)                       // 3. check each one
  assert(await verifyTypedData({ ...domain, message, signature: s.signature,
                                  address: s.signer }))`

export default async function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.how
  const s = h.sections
  const hash = sha256Text(SAMPLE_DOCS["msa-halden"]!.text)
  const lea = partyByName("Léa")
  const message: Array<[string, string]> = [
    ["documentHash", `0x${hash}`],
    ["title", "Master Services Agreement — Halden Freight"],
    ["signer", lea.address],
    ["role", "signer"],
    ["decision", "approve"],
    ["nonce", "7"],
  ]

  return (
    <>
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-12 sm:px-6 lg:pt-16">
          <h1 className="max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">{h.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{h.lead}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl divide-y px-4 sm:px-6">
        {/* 1. Fingerprint */}
        <section className="grid gap-8 py-14 lg:grid-cols-2" aria-labelledby="s1">
          <div>
            <h2 id="s1" className="text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
              {s.fingerprint.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{s.fingerprint.body}</p>
          </div>
          <div className="sheet self-start p-5">
            <p className="font-mono text-xs text-muted-foreground">halden-tessel-msa-2026.txt</p>
            <div className="mt-3 rounded-sm border border-rule bg-background/50 p-3">
              <Fingerprint hash={hash} label="SHA-256" size="lg" />
            </div>
          </div>
        </section>

        {/* 2. Message */}
        <section className="grid gap-8 py-14 lg:grid-cols-2" aria-labelledby="s2">
          <div>
            <h2 id="s2" className="text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
              {s.message.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{s.message.body}</p>
          </div>
          <figure className="self-start">
            <dl className="overflow-hidden rounded-sm border bg-paper font-mono text-[0.72rem]">
              <div className="border-b bg-muted/60 px-3 py-2 text-muted-foreground">
                SignChain · v1 · chainId {NETWORK.chainId} · {REGISTRY_ADDRESS.slice(0, 10)}…
              </div>
              {message.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-2 border-b px-3 py-2 last:border-b-0">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="break-all">{v}</dd>
                </div>
              ))}
            </dl>
            <figcaption className="mt-2 text-xs text-muted-foreground">{s.message.caption}</figcaption>
          </figure>
        </section>

        {/* 3. Registry */}
        <section className="grid gap-8 py-14 lg:grid-cols-2" aria-labelledby="s3">
          <div>
            <h2 id="s3" className="text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
              {s.registry.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{s.registry.body}</p>
          </div>
          <figure className="min-w-0 self-start">
            <pre className="overflow-x-auto rounded-sm border bg-card p-4 font-mono text-[0.7rem] leading-relaxed">
              <code>{CONTRACT}</code>
            </pre>
            <figcaption className="mt-2 text-xs text-muted-foreground">{s.dev.contractCaption}</figcaption>
          </figure>
        </section>

        {/* 4. Storage */}
        <section className="py-14" aria-labelledby="s4">
          <h2 id="s4" className="text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
            {s.storage.title}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {s.storage.items.map((it, i) => {
              const Icon = i === 0 ? HardDriveIcon : ServerIcon
              return (
                <div key={it.title} className="rounded-sm border bg-card p-5">
                  <Icon className="size-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
                  <h3 className="mt-3 font-bold">{it.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{it.body}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* 5. Verification */}
        <section className="grid gap-8 py-14 lg:grid-cols-2" aria-labelledby="s5">
          <div>
            <h2 id="s5" className="text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
              {s.verify.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{s.verify.body}</p>
            <Button asChild variant="outline" className="mt-6">
              <Link href={href(locale, "/verify")}>
                <FileSearchIcon aria-hidden="true" />
                {h.cta.secondary}
              </Link>
            </Button>
          </div>
          <figure className="min-w-0 self-start">
            <pre className="overflow-x-auto rounded-sm border bg-card p-4 font-mono text-[0.7rem] leading-relaxed">
              <code>{VERIFY}</code>
            </pre>
            <figcaption className="mt-2 text-xs text-muted-foreground">{s.dev.verifyCaption}</figcaption>
          </figure>
        </section>

        {/* Legal + developers */}
        <section className="grid gap-8 py-14 lg:grid-cols-2" aria-label={`${s.legal.title} · ${s.dev.title}`}>
          <div className="rounded-sm border bg-card p-6">
            <ScaleIcon className="size-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold">{s.legal.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.legal.body}</p>
          </div>
          <div className="rounded-sm border bg-card p-6">
            <h2 className="text-xl font-bold">{s.dev.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.dev.body}</p>
          </div>
        </section>
      </div>

      <section className="border-t bg-card/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.025em]">{h.cta.title}</h2>
            <p className="mt-2 text-muted-foreground">{h.cta.body}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={href(locale, "/app")}>
                {h.cta.primary}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={href(locale, "/verify")}>{h.cta.secondary}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
