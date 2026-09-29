"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/client"

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { dict } = useI18n()
  return (
    <main id="main" className="flex flex-1 flex-col">
      <section role="alert" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center px-4 py-20 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">{dict.error.title}</h1>
        <p className="mt-4 text-muted-foreground">{dict.error.body}</p>
        <Button className="mt-8" size="lg" onClick={reset}>
          {dict.error.retry}
        </Button>
      </section>
    </main>
  )
}
