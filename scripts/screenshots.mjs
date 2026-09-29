// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start        (serves on port 3153)
//        pnpm screenshots [filter]       (BASE_URL defaults to http://localhost:3153)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3153"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY ?? process.argv[2] // optional filter on the tag, e.g. "en-390-light"

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const L = {
  en: {
    connect: "Connect demo wallet",
    confirm: "Confirm",
    reject: "Reject",
    sign: "Sign",
    simulate: /^Simulate .* signing$/,
    original: "The signed photo licence",
    altered: "The same licence, one number changed",
    partial: "An offer letter still being signed",
    completed: "Completed and sealed.",
    signedIn: /Signature recorded in block/,
  },
  fr: {
    connect: "Connecter le portefeuille de démo",
    confirm: "Confirmer",
    reject: "Refuser",
    sign: "Signer",
    simulate: /^Simuler la signature de /,
    original: "La licence photo signée",
    altered: "La même licence, un chiffre modifié",
    partial: "Une lettre d'offre en cours de signature",
    completed: "Finalisé et scellé.",
    signedIn: /Signature inscrite dans le bloc/,
  },
}

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: sizes[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "no-preference",
    acceptDownloads: true,
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await context.newPage()
  return { context, page }
}

const tagOf = (v) => `${v.locale}-${v.w}-${v.theme}`

async function shot(page, v, name, fullPage = false) {
  const path = `${OUT}${tagOf(v)}-${name}.png`
  if (fullPage) {
    // Grow the viewport to the page height so sticky bars sit where a reader sees them.
    await page.evaluate(() => window.scrollTo(0, 0))
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    await page.setViewportSize({ width: sizes[v.w].width, height: Math.max(height, sizes[v.w].height) })
    await page.waitForTimeout(400)
    await page.screenshot({ path })
    await page.setViewportSize(sizes[v.w])
  } else {
    await page.waitForTimeout(300)
    await page.screenshot({ path })
  }
  // Catch horizontal overflow on the way.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log("  ✓", `${tagOf(v)}-${name}`, overflow > 0 ? `  !! horizontal overflow ${overflow}px` : "")
}

const dialog = (page) => page.getByRole("dialog").last()
const go = (page, v, path) => page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
async function confirm(page, v) {
  await dialog(page).getByRole("button", { name: L[v.locale].confirm, exact: true }).waitFor()
  await dialog(page).getByRole("button", { name: L[v.locale].confirm, exact: true }).click()
  await page.waitForTimeout(250)
}
async function setFailNext(page) {
  await page.getByRole("button", { name: "Demo controls" }).click()
  await dialog(page).getByRole("switch", { name: "Fail the next transaction" }).click()
  await page.keyboard.press("Escape")
  await page.waitForTimeout(300)
}
async function scrollTo(page, locator) {
  await locator.first().scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, -90))
}

async function connect(page, v, capture) {
  await go(page, v, "/app")
  const btn = page.getByRole("main").getByRole("button", { name: L[v.locale].connect })
  await btn.waitFor()
  if (capture) await shot(page, v, "flow1-01-gate", true)
  await btn.click()
  await dialog(page).waitFor()
  if (capture) {
    await shot(page, v, "flow1-02-connect-prompt")
    await dialog(page).getByRole("button", { name: L[v.locale].reject, exact: true }).click()
    await page.getByRole("alert").first().waitFor()
    await shot(page, v, "flow1-03-connect-rejected")
    await btn.click()
  }
  await confirm(page, v)
  await page.getByRole("heading", { level: 1 }).first().waitFor()
  await page.waitForTimeout(300)
}

async function marketing(page, v) {
  for (const [name, path, wait] of [
    ["home", "", 4200],
    ["how-it-works", "/how-it-works", 300],
    ["verify", "/verify", 300],
    ["credits", "/credits", 300],
    ["pricing", "/pricing", 300],
    ["404", "/this-page-does-not-exist", 300],
  ]) {
    await go(page, v, path)
    await page.waitForTimeout(wait)
    await shot(page, v, `page-${name}`, true)
  }
  if (v.w < 768) {
    await go(page, v, "")
    await page.getByRole("button", { name: "Open menu" }).click()
    await dialog(page).waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function appFlows(page, v) {
  // Flow 1: connect (gate, prompt, rejected), then the inbox
  await connect(page, v, true)
  await shot(page, v, "flow1-04-inbox", true)
  await page.getByRole("tab", { name: /Completed/ }).click()
  await shot(page, v, "flow1-05-inbox-completed")

  // Flow 2: send a document (with one forced failure)
  await go(page, v, "/app/new")
  await page.getByRole("button", { name: "Continue" }).click()
  await shot(page, v, "flow2-01-empty-error", true)
  await page.getByRole("button", { name: "Use a sample contract" }).click()
  await page.waitForTimeout(1600)
  await shot(page, v, "flow2-02-fingerprint", true)
  await page.getByRole("button", { name: "Continue" }).click()
  await shot(page, v, "flow2-03-details", true)
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByRole("radio", { name: /In order/ }).check()
  await page.getByRole("button", { name: /Amir Haddad/ }).click()
  await page.getByLabel("Or paste a wallet address").fill("0x12ab")
  await page.getByRole("button", { name: "Add", exact: true }).click()
  await shot(page, v, "flow2-04-signers", true)
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByRole("radio", { name: /encrypted copy on IPFS/ }).check()
  await page.getByRole("button", { name: "Continue" }).click()
  await shot(page, v, "flow2-05-review", true)
  await setFailNext(page)
  await page.getByRole("button", { name: "Sign and register" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow2-06-sign-prompt")
  await confirm(page, v)
  await dialog(page).getByText("Confirm transaction").waitFor()
  await shot(page, v, "flow2-07-tx-prompt")
  await confirm(page, v)
  await page.getByText("Registering on-chain · waiting for a block…").waitFor()
  await scrollTo(page, page.getByText("Registering on-chain · waiting for a block…"))
  await shot(page, v, "flow2-08-pending")
  await page.getByText(/Transaction failed/).waitFor({ timeout: 10000 })
  await scrollTo(page, page.getByText(/Transaction failed/))
  await shot(page, v, "flow2-09-failed")
  await page.getByRole("button", { name: "Try again" }).click()
  await confirm(page, v)
  await confirm(page, v)
  await page.waitForURL(/\/app\/envelopes\//, { timeout: 15000 })
  await page.waitForTimeout(1600)
  await shot(page, v, "flow2-10-sent", true)

  // Flow 3: co-sign the Halden MSA, then the CFO completes it (seal)
  await go(page, v, "/app/envelopes/msa-halden")
  await shot(page, v, "flow3-01-your-turn", true)
  await page.getByRole("button", { name: "Sign", exact: true }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow3-02-sign-prompt")
  await confirm(page, v)
  await confirm(page, v)
  await page.getByText(L.en.signedIn).waitFor({ timeout: 10000 })
  await scrollTo(page, page.getByText(L.en.signedIn))
  await shot(page, v, "flow3-03-signed")
  await page.getByRole("button", { name: L.en.simulate }).click()
  await page.getByText(L.en.completed).first().waitFor({ timeout: 10000 })
  await page.waitForTimeout(1800)
  await shot(page, v, "flow3-04-completed", true)

  // Flow 3b: decline the grant, void the offer letter
  await go(page, v, "/app/envelopes/grant-boreale")
  await page.getByRole("button", { name: "Decline", exact: true }).click()
  await dialog(page).waitFor()
  await dialog(page).getByRole("button", { name: "Sign refusal" }).click()
  await shot(page, v, "flow3-05-decline-dialog")
  await dialog(page).getByRole("textbox").fill("Clause 6: we need the IP licence limited to 5 years.")
  await dialog(page).getByRole("button", { name: "Sign refusal" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow3-06-decline-prompt")
  await confirm(page, v)
  await confirm(page, v)
  await page.getByText(/Refusal recorded in block/).waitFor({ timeout: 10000 })
  await shot(page, v, "flow3-07-declined", true)
  await go(page, v, "/app/envelopes/offer-reyes")
  await page.getByRole("button", { name: "Void envelope" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow3-08-void-dialog")
  await page.keyboard.press("Escape")

  // Flow 4: verify (match, altered, partial, invalid)
  await go(page, v, "/verify")
  await page.getByRole("button", { name: L.en.original, exact: true }).click()
  await page.getByText("Match: this exact file was signed.").waitFor({ timeout: 10000 })
  await page.waitForTimeout(700)
  await shot(page, v, "flow4-01-match", true)
  await page.getByRole("button", { name: L.en.altered, exact: true }).click()
  await page.getByText(/content differs/).waitFor({ timeout: 10000 })
  await page.waitForTimeout(1600)
  await scrollTo(page, page.getByText(/content differs/))
  await shot(page, v, "flow4-02-tampered")
  await page.getByRole("button", { name: L.en.partial, exact: true }).click()
  await page.getByText("Registered, not fully signed yet.").waitFor({ timeout: 10000 })
  await page.waitForTimeout(700)
  await scrollTo(page, page.getByText("Registered, not fully signed yet."))
  await shot(page, v, "flow4-03-partial")
  await page.getByLabel("Paste a fingerprint").fill("not-a-hash")
  await page.getByRole("button", { name: "Check", exact: true }).click()
  await shot(page, v, "flow4-04-invalid")

  await go(page, v, "/app")
  await page.getByRole("button", { name: "Demo controls" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "app-demo-controls")
}

async function frenchFlow(page, v) {
  await go(page, v, "")
  await page.waitForTimeout(4200)
  await shot(page, v, "page-home", true)
  await connect(page, v, false)
  await shot(page, v, "flow1-04-inbox", true)
  await go(page, v, "/app/envelopes/msa-halden")
  await page.getByRole("button", { name: L.fr.sign, exact: true }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow3-02-sign-prompt")
  await confirm(page, v)
  await confirm(page, v)
  await page.getByText(L.fr.signedIn).waitFor({ timeout: 10000 })
  await page.getByRole("button", { name: L.fr.simulate }).click()
  await page.getByText(L.fr.completed).first().waitFor({ timeout: 10000 })
  await page.waitForTimeout(1800)
  await shot(page, v, "flow3-04-completed", true)
  await go(page, v, "/verify")
  await page.getByRole("button", { name: L.fr.altered, exact: true }).click()
  await page.getByText(/contenu diffère/).waitFor({ timeout: 10000 })
  await page.waitForTimeout(1600)
  await shot(page, v, "flow4-02-tampered", true)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  const tag = tagOf(v)
  if (ONLY && !tag.includes(ONLY)) continue
  console.log(tag)
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") await frenchFlow(page, v)
    else {
      await marketing(page, v)
      await appFlows(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag, e.message)
    await page.screenshot({ path: `${OUT}_error-${tag}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
