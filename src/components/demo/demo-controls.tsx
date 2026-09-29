"use client"

import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"
import { useId, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useI18n } from "@/i18n/client"
import { updateSettings } from "@/lib/demo/ops"
import { resetDemo, useDemo } from "@/lib/demo/store"

export function DemoControls({ compact = false }: { compact?: boolean }) {
  const { dict } = useI18n()
  const c = dict.app.controls
  const state = useDemo()
  const [open, setOpen] = useState(false)
  const failId = useId()
  const fastId = useId()
  if (!state) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size={compact ? "icon" : "sm"} aria-label={c.open} className="relative">
          <SlidersHorizontalIcon aria-hidden="true" />
          {!compact && <span>{c.open}</span>}
          {state.settings.failNext && <span className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-background bg-destructive" aria-hidden="true" />}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={dict.common.close} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.title}</DialogTitle>
          <DialogDescription>{c.body}</DialogDescription>
        </DialogHeader>
        <div className="divide-y rounded-sm border">
          <div className="flex items-start justify-between gap-4 p-4">
            <div>
              <label htmlFor={failId} className="text-sm font-semibold">
                {c.failNext}
              </label>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.failNextHint}</p>
            </div>
            <Switch id={failId} checked={state.settings.failNext} onCheckedChange={(v) => updateSettings({ failNext: v })} />
          </div>
          <div className="flex items-start justify-between gap-4 p-4">
            <div>
              <label htmlFor={fastId} className="text-sm font-semibold">
                {c.fast}
              </label>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.fastHint}</p>
            </div>
            <Switch id={fastId} checked={state.settings.speed === "fast"} onCheckedChange={(v) => updateSettings({ speed: v ? "fast" : "realistic" })} />
          </div>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">{c.resetHint}</p>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => {
                resetDemo()
                setOpen(false)
                toast.success(c.resetDone)
              }}
            >
              <RotateCcwIcon aria-hidden="true" />
              {c.reset}
            </Button>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">{dict.common.demoBadge}</p>
      </DialogContent>
    </Dialog>
  )
}
