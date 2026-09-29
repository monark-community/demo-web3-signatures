import { hashGroups } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * A SHA-256 fingerprint printed as eight blocks of eight, like a serial
 * number stamped on a contract. `print` runs the typewriter animation once;
 * `diff` marks every character that differs from another fingerprint.
 */
export function Fingerprint({
  hash,
  print = false,
  delay = 0,
  diff,
  label,
  className,
  size = "md",
}: {
  hash: string
  print?: boolean
  /** Seconds before printing starts. */
  delay?: number
  diff?: string
  label?: string
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const groups = hashGroups(hash)
  return (
    <div className={cn("font-mono tabular-nums", className)}>
      {label && <p className="eyebrow mb-1.5">{label}</p>}
      <p
        aria-label={hash}
        className={cn(
          "grid w-fit grid-cols-4 gap-x-4 gap-y-1",
          size === "sm" && "gap-x-2.5 text-[0.7rem]",
          size === "md" && "text-[0.8rem] sm:text-[0.85rem]",
          size === "lg" && "text-[0.9rem] sm:text-base"
        )}
      >
        {groups.map((g, gi) => (
          <span key={gi} aria-hidden="true" className="whitespace-nowrap">
            {g.split("").map((c, ci) => {
              const i = gi * 8 + ci
              const changed = diff !== undefined && diff[i] !== c
              return (
                <span
                  key={ci}
                  className={cn(
                    "inline-block",
                    print && "print-char",
                    changed && "bg-destructive/12 font-medium text-destructive line-through decoration-1"
                  )}
                  style={print ? { animationDelay: `${(delay + i * 0.018).toFixed(3)}s` } : undefined}
                >
                  {c}
                </span>
              )
            })}
          </span>
        ))}
      </p>
    </div>
  )
}
