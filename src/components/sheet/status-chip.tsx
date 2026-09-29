import { BanIcon, CheckIcon, ClockIcon, HourglassIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type ChipTone = "success" | "warning" | "destructive" | "muted"

const TONES: Record<ChipTone, string> = {
  success: "border-success/35 bg-success/10 text-success",
  warning: "border-warning/35 bg-warning/10 text-warning",
  destructive: "border-destructive/35 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
}

const ICONS = { success: CheckIcon, warning: ClockIcon, destructive: XIcon, muted: HourglassIcon, void: BanIcon }

/** Status is never colour alone: always an icon and a word. */
export function StatusChip({
  tone,
  label,
  icon,
  className,
}: {
  tone: ChipTone
  label: string
  icon?: keyof typeof ICONS
  className?: string
}) {
  const Icon = ICONS[icon ?? tone]
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  )
}

export const envelopeTone = (s: "awaiting" | "completed" | "declined" | "voided"): { tone: ChipTone; icon?: keyof typeof ICONS } =>
  s === "completed"
    ? { tone: "success" }
    : s === "awaiting"
      ? { tone: "warning" }
      : s === "declined"
        ? { tone: "destructive" }
        : { tone: "muted", icon: "void" }

export const slotTone = (s: "waiting" | "pending" | "signed" | "declined"): { tone: ChipTone; icon?: keyof typeof ICONS } =>
  s === "signed" ? { tone: "success" } : s === "pending" ? { tone: "warning" } : s === "declined" ? { tone: "destructive" } : { tone: "muted" }
