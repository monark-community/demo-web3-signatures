"use client"

import { createContext, useContext, type ReactNode } from "react"

import type { Locale } from "./config"
import type { Dictionary } from "./dictionaries/en"

interface I18nValue {
  locale: Locale
  dict: Dictionary
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ locale, dict, children }: I18nValue & { children: ReactNode }) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>
}

/** The active locale and its dictionary, for client components. */
export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error("useI18n must be used inside I18nProvider")
  return value
}
