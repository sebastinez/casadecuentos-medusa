import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google"
import { getLocale } from "next-intl/server"
import { defaultLocale } from "@i18n/config"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

const display = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "WONK"],
})

const body = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
})

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale().catch(() => defaultLocale)

  return (
    <html
      lang={locale}
      data-mode="light"
      className={`${display.variable} ${body.variable}`}
    >
      <body className="bg-brand-cream text-brand-ink font-sans antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
