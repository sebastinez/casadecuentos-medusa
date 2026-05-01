"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"
import { useTranslations } from "next-intl"

import { isLocale, Locale, locales } from "@i18n/config"
import { clx } from "@modules/common/components/ui"

const labelKey = (locale: Locale) =>
  locale === "de" ? "languageDe" : "languageEs"

const LocaleToggle = () => {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("common")
  const [isPending, startTransition] = useTransition()

  const segments = pathname.split("/")
  const currentLocale = isLocale(segments[1]) ? segments[1] : "de"

  const swapTo = (next: Locale) => {
    if (next === currentLocale) return
    const newSegments = [...segments]
    newSegments[1] = next
    const target = newSegments.join("/") || `/${next}`
    startTransition(() => {
      router.push(target)
      router.refresh()
    })
  }

  return (
    <div
      className="flex items-center gap-x-1 text-small-regular"
      role="group"
      aria-label={t("language")}
    >
      {locales.map((loc, idx) => (
        <span key={loc} className="flex items-center">
          {idx > 0 && (
            <span aria-hidden className="px-1 text-ui-fg-muted">
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => swapTo(loc)}
            disabled={isPending}
            aria-current={loc === currentLocale ? "true" : undefined}
            className={clx(
              "uppercase tracking-wider",
              loc === currentLocale
                ? "text-ui-fg-base font-medium"
                : "text-ui-fg-subtle hover:text-ui-fg-base"
            )}
          >
            <span className="sr-only">{t(labelKey(loc))}</span>
            <span aria-hidden>{loc}</span>
          </button>
        </span>
      ))}
    </div>
  )
}

export default LocaleToggle
