import { getTranslations } from "next-intl/server"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default async function Footer() {
  const [{ collections }, productCategories, t, tNav, tMeta] = await Promise.all([
    listCollections({ fields: "*products" }),
    listCategories(),
    getTranslations("footer"),
    getTranslations("nav"),
    getTranslations("metadata"),
  ])

  return (
    <footer className="border-t border-brand-ink/10 w-full bg-brand-paper/40">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-24">
          <div className="flex flex-col gap-y-2">
            <LocalizedClientLink
              href="/"
              className="font-display text-2xl text-brand-ink hover:text-brand-accent transition-colors"
            >
              {tMeta("siteName")}
            </LocalizedClientLink>
            <Text className="txt-small text-brand-ink70 max-w-xs">
              {t("tagline")}
            </Text>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-4">
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-brand-ink uppercase tracking-wider">
                {t("explore")}
              </span>
              <ul className="grid grid-cols-1 gap-2 text-brand-ink70 txt-small">
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href="/store"
                  >
                    {tNav("store")}
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href="/events"
                  >
                    {tNav("events")}
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href="/about"
                  >
                    {tNav("about")}
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href="/contact"
                  >
                    {tNav("contact")}
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus text-brand-ink uppercase tracking-wider">
                  {t("categories")}
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return null
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li
                        className="flex flex-col gap-2 text-brand-ink70 txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-ui-fg-base",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children.map((child) => (
                              <li key={child.id}>
                                <LocalizedClientLink
                                  className="hover:text-brand-accent transition-colors"
                                  href={`/categories/${child.handle}`}
                                  data-testid="category-link"
                                >
                                  {child.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus text-brand-ink uppercase tracking-wider">
                  {t("collections")}
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-brand-ink70 txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-brand-ink50">
          <Text className="txt-compact-small">
            {t("rights", { year: new Date().getFullYear() })}
          </Text>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  )
}
