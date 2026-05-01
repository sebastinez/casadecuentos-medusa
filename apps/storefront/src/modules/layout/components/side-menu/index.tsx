"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text } from "@modules/common/components/ui"
import LocaleToggle from "@modules/layout/components/locale-toggle"
import { useTranslations } from "next-intl"
import { Fragment, useEffect, useState } from "react"
import { createPortal } from "react-dom"

const SideMenu = () => {
  const t = useTranslations("nav")
  const tCommon = useTranslations("common")
  const tFooter = useTranslations("footer")
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const items = [
    { label: t("home"), href: "/" },
    { label: t("store"), href: "/store" },
    { label: t("events"), href: "/events" },
    { label: t("about"), href: "/about" },
    { label: t("contact"), href: "/contact" },
    { label: t("account"), href: "/account" },
    { label: t("cart"), href: "/cart" },
  ]

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-brand-accent"
                >
                  {t("menu")}
                </Popover.Button>
              </div>

              {mounted &&
                createPortal(
                  <>
                    {/* Backdrop */}
                    <Transition
                      show={open}
                      as={Fragment}
                      enter="transition-opacity ease-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition-opacity ease-in duration-200"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div
                        className="fixed inset-0 z-[50] bg-brand-ink/30"
                        onClick={close}
                        data-testid="side-menu-backdrop"
                      />
                    </Transition>

                    {/* Drawer */}
                    <Transition
                      show={open}
                      as={Fragment}
                      enter="transition ease-out duration-300"
                      enterFrom="-translate-x-full"
                      enterTo="translate-x-0"
                      leave="transition ease-in duration-200"
                      leaveFrom="translate-x-0"
                      leaveTo="-translate-x-full"
                    >
                      <PopoverPanel
                        static
                        data-testid="nav-menu-popup"
                        className="fixed inset-y-0 left-0 z-[51] w-72 sm:w-80 flex flex-col bg-brand-paper border-r border-brand-ink/10 shadow-xl"
                      >
                        <div className="flex items-center justify-between px-6 h-16 border-b border-brand-ink/10 shrink-0">
                          <span className="font-display text-brand-ink text-lg">
                            {t("menu")}
                          </span>
                          <button
                            aria-label={tCommon("close")}
                            data-testid="close-menu-button"
                            onClick={close}
                            className="text-brand-ink70 hover:text-brand-accent transition-colors"
                          >
                            <XMark />
                          </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-6 py-8">
                          <ul className="flex flex-col gap-2">
                            {items.map(({ label, href }) => (
                              <li key={href}>
                                <LocalizedClientLink
                                  href={href}
                                  className="block font-display text-2xl text-brand-ink hover:text-brand-accent transition-colors py-2"
                                  onClick={close}
                                  data-testid={`${href.replace(/^\//, "") || "home"}-link`}
                                >
                                  {label}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        </nav>

                        <div className="px-6 py-6 border-t border-brand-ink/10 shrink-0 flex flex-col gap-4">
                          <LocaleToggle />
                          <Text className="txt-compact-small text-brand-ink50">
                            {tFooter("rights", { year: new Date().getFullYear() })}
                          </Text>
                        </div>
                      </PopoverPanel>
                    </Transition>
                  </>,
                  document.body
                )}
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
