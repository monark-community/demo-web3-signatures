"use client"

import { UploadIcon } from "lucide-react"
import { useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Drag-and-drop zone with a real button, so it works with keyboard and touch too. */
export function FileDrop({
  onFile,
  title,
  hint,
  button,
  className,
  compact = false,
}: {
  onFile: (file: File) => void
  title: string
  hint: string
  button: string
  className?: string
  compact?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const id = useId()
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const f = e.dataTransfer.files?.[0]
        if (f) onFile(f)
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed bg-card text-center transition-colors",
        compact ? "px-4 py-6" : "px-6 py-10",
        over ? "border-primary bg-accent/50" : "border-rule",
        className
      )}
    >
      <UploadIcon className="size-7 text-muted-foreground" strokeWidth={1.25} aria-hidden="true" />
      <p className="font-semibold" id={`${id}-title`}>
        {title}
      </p>
      <p className="text-sm text-muted-foreground">{hint}</p>
      <input
        ref={input}
        type="file"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ""
        }}
      />
      <Button type="button" variant="outline" className="mt-2" onClick={() => input.current?.click()} aria-describedby={`${id}-title`}>
        {button}
      </Button>
    </div>
  )
}
