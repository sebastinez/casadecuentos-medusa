import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { isLocale } from "@i18n/config"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default async function CheckoutLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  if (!isLocale(countryCode)) {
    notFound()
  }

  setRequestLocale(countryCode)

  const [messages, t, tNav] = await Promise.all([
    getMessages({ locale: countryCode }),
    getTranslations({ locale: countryCode, namespace: "common" }),
    getTranslations({ locale: countryCode, namespace: "nav" }),
  ])

  const tStore = await getTranslations({
    locale: countryCode,
    namespace: "metadata",
  })

  return (
    <NextIntlClientProvider locale={countryCode} messages={messages}>
      <div className="w-full bg-white relative small:min-h-screen">
        <div className="h-16 bg-white border-b ">
          <nav className="flex h-full items-center content-container justify-between">
            <LocalizedClientLink
              href="/cart"
              className="text-small-semi text-ui-fg-base flex items-center gap-x-2 uppercase flex-1 basis-0"
              data-testid="back-to-cart-link"
            >
              <ChevronDown className="rotate-90" size={16} />
              <span className="mt-px hidden small:block txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base ">
                {tNav("cart")}
              </span>
              <span className="mt-px block small:hidden txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
                {t("back")}
              </span>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase"
              data-testid="store-link"
            >
              {tStore("siteName")}
            </LocalizedClientLink>
            <div className="flex-1 basis-0" />
          </nav>
        </div>
        <div className="relative" data-testid="checkout-container">
          {props.children}
        </div>
        <div className="py-4 w-full flex items-center justify-center">
          <MedusaCTA />
        </div>
      </div>
    </NextIntlClientProvider>
  )
}
