import { ImageResponse } from "next/og"

import { SEAL_PATH, SEAL_STROKE } from "@/components/site/seal"
import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { signatureFor } from "@/lib/demo/chain"
import { SAMPLE_DOCS } from "@/lib/demo/documents"
import { partyByName } from "@/lib/demo/seed"
import { sha256Text } from "@/lib/demo/sha256"
import { hashGroups } from "@/lib/format"
import { strokePath } from "@/lib/stroke"

export const alt = "SignChain"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const PAPER = "#f4f2ec"
const SHEET = "#fffefb"
const INK = "#1c1b18"
const MUTED = "#5b574f"
const WAX = "#7a1e2c"
const RULE = "#d8d3c8"

function Seal({ size: s }: { size: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <path d={SEAL_PATH} fill={WAX} />
      <circle cx="16" cy="16" r="10.6" fill="none" stroke="#fcf6f3" strokeOpacity="0.35" strokeWidth="0.8" />
      <path d={SEAL_STROKE} fill="none" stroke="#fcf6f3" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  const hash = sha256Text(SAMPLE_DOCS["msa-halden"]!.text)
  const signers = [partyByName("Nora"), partyByName("Léa")]

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, color: INK, padding: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 520 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Seal size={60} />
            <span style={{ fontSize: 46, fontWeight: 800, letterSpacing: -1.5 }}>
              Sign<span style={{ color: WAX }}>Chain</span>
            </span>
          </div>
          <div style={{ fontSize: 62, lineHeight: 1.04, fontWeight: 800, letterSpacing: -2 }}>{d.home.title}</div>
          <div style={{ fontSize: 22, color: MUTED }}>{d.common.demoBadge}</div>
        </div>
        <div
          style={{
            marginLeft: 56,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: SHEET,
            border: `2px solid ${RULE}`,
            boxShadow: `10px 10px 0 -2px ${PAPER}, 10px 10px 0 0 ${RULE}`,
            padding: "30px 32px",
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800 }}>{d.home.sheet.title}</div>
          <div style={{ fontSize: 18, color: MUTED, marginTop: 4 }}>{d.home.sheet.parties}</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 22, padding: 14, border: `1px solid ${RULE}`, background: PAPER }}>
            <div style={{ fontSize: 13, color: MUTED, letterSpacing: 1.5 }}>{d.home.sheet.fingerprint.toUpperCase()}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 8, fontSize: 19, fontFamily: "monospace" }}>
              {hashGroups(hash).map((g) => (
                <span key={g}>{g}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 26 }}>
            {signers.map((p) => (
              <div key={p.address} style={{ display: "flex", flexDirection: "column", width: 250 }}>
                <svg width="220" height="58" viewBox="0 0 240 64">
                  <path d={strokePath(signatureFor(hash, p.address))} fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                <div style={{ borderTop: `2px solid ${INK}`, paddingTop: 6, fontSize: 18, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 14, color: MUTED }}>{p.org}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto" }}>
            <Seal size={72} />
          </div>
        </div>
      </div>
    ),
    size
  )
}
