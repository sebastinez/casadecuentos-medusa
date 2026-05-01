export const locales = ["de", "es"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "de"

export const isLocale = (value: string | undefined | null): value is Locale =>
  !!value && (locales as readonly string[]).includes(value)
