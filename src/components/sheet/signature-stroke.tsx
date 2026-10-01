import { strokePath } from "@/lib/stroke"
import { cn } from "@/lib/utils"

/** The pen stroke derived from a signature's bytes. Draws itself once when `draw` is set. */
export function SignatureStroke({
  signature,
  draw = false,
  delay = 0,
  className,
  tone = "ink",
}: {
  signature: string
  draw?: boolean
  delay?: number
  className?: string
  tone?: "ink" | "muted"
}) {
  return (
    <svg viewBox="0 0 240 64" className={cn("h-12 w-44 overflow-visible", className)} aria-hidden="true">
      <path
        d={strokePath(signature)}
        pathLength={1}
        fill="none"
        stroke={tone === "ink" ? "var(--foreground)" : "var(--muted-foreground)"}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(draw && "draw-stroke")}
        style={draw ? ({ "--len": 1, animationDelay: `${delay}s` } as React.CSSProperties) : undefined}
      />
    </svg>
  )
}
