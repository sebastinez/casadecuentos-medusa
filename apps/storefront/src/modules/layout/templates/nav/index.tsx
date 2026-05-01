import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import LocaleToggle from "@modules/layout/components/locale-toggle"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [t, tMeta] = await Promise.all([
    getTranslations("nav"),
    getTranslations("metadata"),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-3 focus:left-3 focus:px-4 focus:py-2 focus:bg-brand-ink focus:text-brand-paper focus:rounded-large focus:text-sm focus:font-medium"
      >
        {t("skipToContent")}
      </a>
      <header className="relative h-16 mx-auto border-b duration-200 bg-brand-paper/90 backdrop-blur border-brand-ink/10">
        <nav className="content-container txt-xsmall-plus text-brand-ink70 flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="font-display text-2xl text-brand-ink hover:text-brand-accent transition-colors"
              data-testid="nav-store-link"
            >
              {tMeta("siteName")}
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocaleToggle />
              <LocalizedClientLink
                className="hover:text-brand-accent transition-colors"
                href="/account"
                data-testid="nav-account-link"
              >
                {t("account")}
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-brand-accent transition-colors flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  {t("cartCount", { count: 0 })}
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
