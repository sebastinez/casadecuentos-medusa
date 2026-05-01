"use server"

import { cookies as nextCookies } from "next/headers"

const LOCALE_COOKIE_NAME = "_medusa_locale"

/**
 * Reads the Medusa locale cookie. The cookie is seeded by `middleware.ts`
 * from the `[countryCode]` URL segment, so SDK calls (cart, products) can
 * forward the right locale without explicit prop drilling.
 */
export const getLocale = async (): Promise<string | null> => {
  try {
    const cookies = await nextCookies()
    return cookies.get(LOCALE_COOKIE_NAME)?.value ?? null
  } catch {
    return null
  }
}
