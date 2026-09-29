"use client"

import { FilePlus2Icon, FileSearchIcon, InboxIcon, Loader2Icon, WalletIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

import { LocaleSwitch } from "@/components/site/locale-switch"
import { MobileMenu } from "@/components/site/mobile-menu"
import { NavLinks, isActive, type NavItem } from "@/components/site/nav-links"
import { SealMark, Wordmark } from "@/components/site/seal"
import { ThemeToggle } from "@/components/site/theme"
import { Button } from "@/components/ui/button"
import { ConnectWallet } from "@/components/ui/connect-wallet"
import { NetworkBadge } from "@/components/ui/network-badge"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { useI18n } from "@/i18n/client"
import { href, MONARK_URL } from "@/i18n/config"
import { t } from "@/i18n/t"
import { connectWallet, disconnectWallet } from "@/lib/demo/ops"
import { ME } from "@/lib/demo/seed"
import { initDemo, isStorageAvailable, useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

import { DemoControls } from "./demo-controls"
import { WalletPrompt } from "./wallet-prompt"

function DemoChip() {
  const { dict } = useI18n()
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-mono text-[0.68rem] tracking-wider text-muted-foreground uppercase">
      <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
      {dict.common.demoShort}
    </span>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { locale, dict } = useI18n()
  const state = useDemo()
  const pathname = usePathname() ?? ""
  const [rejected, setRejected] = useState(false)

  useEffect(() => {
    initDemo()
  }, [])

  const items: NavItem[] = [
    { href: href(locale, "/app"), label: dict.app.nav.envelopes },
    { href: href(locale, "/app/new"), label: dict.app.nav.new },
    { href: href(locale, "/verify"), label: dict.app.nav.verify },
  ]
  const connected = state?.wallet.status === "connected"
  // Envelope pages belong to the "Envelopes" tab.
  const tabActive = (item: NavItem, i: number) =>
    isActive(pathname, item) || (i === 0 && pathname.startsWith(`${href(locale, "/app/envelopes")}`))

  const onConnect = async () => {
    setRejected(false)
    const ok = await connectWallet()
    if (!ok) setRejected(true)
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-5 sm:px-6">
          <Link href={href(locale)} aria-label={dict.nav.home} className="rounded-sm">
            <span className="sm:hidden">
              <SealMark className="size-8" />
            </span>
            <Wordmark className="hidden sm:inline-flex" />
          </Link>
          <nav aria-label={dict.app.nav.label} className="hidden md:block">
            <NavLinks items={items.map((it, i) => ({ ...it, prefix: i === 0 }))} className="flex items-center" />
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <DemoChip />
            <NetworkBadge
              name={dict.app.network}
              variant="outline"
              className="hidden lg:inline-flex"
              icon={<span className="block size-full rounded-full bg-warning" />}
            />
            <div className="hidden items-center gap-1 lg:flex">
              <LocaleSwitch locale={locale} label={dict.nav.language} />
              <ThemeToggle label={dict.nav.theme} />
            </div>
            {state && <DemoControls compact />}
            {connected && (
              <ConnectWallet
                status="connected"
                address={ME.address}
                name={ME.name}
                onDisconnect={disconnectWallet}
                disconnectLabel={dict.app.wallet.disconnect}
                className="hidden py-1.5 sm:inline-flex [&_[data-slot=wallet-avatar]]:size-7!"
              />
            )}
            <MobileMenu
              items={items}
              cta={{ href: href(locale), label: dict.nav.home }}
              className="lg:hidden"
              extra={
                connected ? (
                  <div className="mt-4 flex items-center gap-3 rounded-sm border bg-card p-3 sm:hidden">
                    <WalletAvatar address={ME.address} size={32} />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-sm font-medium">{ME.name}</p>
                      <WalletAddress address={ME.address} className="text-xs text-muted-foreground" />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={disconnectWallet}>
                      {dict.app.wallet.disconnect}
                    </Button>
                  </div>
                ) : null
              }
            />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1 pb-24 md:pb-0">
        {!state ? (
          <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-24 text-sm text-muted-foreground sm:px-6" role="status">
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            {dict.common.loading}
          </div>
        ) : !connected ? (
          <Gate connecting={state.wallet.status === "connecting"} rejected={rejected} onConnect={onConnect} />
        ) : (
          <>
            {!isStorageAvailable() && (
              <p className="mx-auto max-w-6xl px-4 pt-4 text-sm text-warning sm:px-6" role="status">
                {dict.common.storageOff}
              </p>
            )}
            {children}
          </>
        )}
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 pb-24 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 md:pb-5">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5 font-mono tracking-wider uppercase">
              <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
              {dict.common.demoBadge}
            </span>
            <span>{dict.common.valueNotice}</span>
          </p>
          <a href={MONARK_URL} className="text-[13px] hover:text-foreground hover:underline" rel="noopener noreferrer" target="_blank">
            {dict.footer.builtWith}
          </a>
        </div>
      </footer>

      {/* Mobile tab bar, above the home indicator. */}
      <nav
        aria-label={dict.app.nav.label}
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-[2px] md:hidden"
      >
        <ul className="grid grid-cols-3">
          {items.map((item, i) => {
            const Icon = [InboxIcon, FilePlus2Icon, FileSearchIcon][i]!
            const active = tabActive({ ...item, prefix: i === 0 }, i)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[0.72rem] font-medium",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2 : 1.5} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <WalletPrompt />
    </>
  )
}

function Gate({ connecting, rejected, onConnect }: { connecting: boolean; rejected: boolean; onConnect: () => void }) {
  const { dict } = useI18n()
  const g = dict.app.gate
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
      <div className="fade-up">
        <p className="eyebrow">{g.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">{g.title}</h1>
        <p className="mt-4 max-w-lg text-muted-foreground">{g.body}</p>
        <div className="mt-8 flex flex-col items-start gap-3">
          <Button size="lg" className="h-12 px-6 text-base" onClick={onConnect} disabled={connecting}>
            {connecting ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <WalletIcon aria-hidden="true" />}
            {connecting ? g.connecting : g.connect}
          </Button>
          <p className="text-sm text-muted-foreground">{t(g.persona, { name: ME.name, title: ME.title.toLowerCase(), org: ME.org })}</p>
          {rejected && (
            <p role="alert" className="rounded-sm border border-destructive/40 bg-destructive/8 px-3 py-2 text-sm font-medium text-destructive">
              {g.rejected}
            </p>
          )}
        </div>
      </div>
      <div className="sheet hidden p-8 lg:block" aria-hidden="true">
        <div className="flex items-center gap-4">
          <SealMark className="size-16" />
          <div className="space-y-2">
            <div className="h-3 w-48 rounded-full bg-muted" />
            <div className="h-3 w-32 rounded-full bg-muted" />
          </div>
        </div>
        <div className="mt-8 space-y-3">
          {[92, 84, 88, 60].map((w) => (
            <div key={w} className="h-2.5 rounded-full bg-muted" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-8">
          {[0, 1].map((i) => (
            <div key={i} className="border-t border-foreground/60 pt-2">
              <div className="h-2.5 w-24 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
