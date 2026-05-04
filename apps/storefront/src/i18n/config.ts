export const locales = ["de", "es"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "de"

export const isLocale = (value: string | undefined | null): value is Locale =>
  !!value && (locales as readonly string[]).includes(value)

/**
 * Maps each UI locale to the Medusa region country code used for
 * pricing / currency resolution.  The locale `"de"` (German language)
 * maps to `"ch"` (Switzerland) because the store sells in CHF,
 * not in Germany.
 */
export const localeToCountryCode: Record<Locale, string> = {
  de: "ch",
  es: "ch",
}

/** Resolve the Medusa country code for a given locale string. */
export const countryCodeForLocale = (locale: string): string =>
  isLocale(locale)
    ? localeToCountryCode[locale]
    : localeToCountryCode[defaultLocale]
