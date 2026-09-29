import { cn } from "@/lib/utils"

/** A wax seal: a 16-notch scalloped disc, an inner ring and one pen stroke. */
function scallopPath(cx: number, cy: number, r: number, notches: number, depth: number): string {
  const steps = notches * 8
  let d = ""
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2 - Math.PI / 2
    const rr = r - depth * (0.5 - 0.5 * Math.cos(a * notches))
    const x = cx + rr * Math.cos(a)
    const y = cy + rr * Math.sin(a)
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return `${d}Z`
}

export const SEAL_PATH = scallopPath(16, 16, 15.5, 16, 1.6)
export const SEAL_STROKE = "M8.6 18.6c1.8-4.6 3.4-6.9 4.6-6.7 1.5.3-.9 7.6.6 7.7 1.2.1 2.4-4.8 3.7-4.6 1.1.2.2 3.4 1.3 3.5.9.1 1.6-1.4 2.6-2.2"

export function SealMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={SEAL_PATH} fill="var(--seal)" />
      <circle cx="16" cy="16" r="10.6" fill="none" stroke="var(--seal-ink)" strokeOpacity="0.35" strokeWidth="0.8" />
      <path d={SEAL_STROKE} fill="none" stroke="var(--seal-ink)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <SealMark className="size-7" />
      <span className="text-[1.15rem] font-extrabold tracking-[-0.03em] text-foreground">
        Sign<span className="text-primary">Chain</span>
      </span>
    </span>
  )
}
