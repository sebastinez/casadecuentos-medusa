import { NextRequest, NextResponse } from "next/server"

import { defaultLocale, isLocale, Locale } from "./i18n/config"

const LOCALE_COOKIE_NAME = "_medusa_locale"

/**
 * Pick a supported locale from the request's Accept-Language header.
 * Falls back to defaultLocale when nothing matches.
 */
function pickLocaleFromAcceptLanguage(request: NextRequest): Locale {
  const header = request.headers.get("accept-language")
  if (!header) return defaultLocale

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";")
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2)
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 }
    })
    .filter((p) => p.tag)
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    const primary = tag.split("-")[0]
    if (isLocale(primary)) return primary
  }

  return defaultLocale
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const firstSegment = request.nextUrl.pathname
    .split("/")[1]
    ?.toLowerCase()

  if (isLocale(firstSegment)) {
    const response = NextResponse.next()
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }
    if (request.cookies.get(LOCALE_COOKIE_NAME)?.value !== firstSegment) {
      response.cookies.set(LOCALE_COOKIE_NAME, firstSegment, {
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
    }
    return response
  }

  const locale = pickLocaleFromAcceptLanguage(request)
  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  const queryString = request.nextUrl.search || ""
  const redirectUrl = `${request.nextUrl.origin}/${locale}${redirectPath}${queryString}`

  const response = NextResponse.redirect(redirectUrl, 307)
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
