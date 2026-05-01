import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { isLocale } from "@i18n/config"
import AboutTemplate from "@modules/about/templates/about-template"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await params
  const locale = isLocale(countryCode) ? countryCode : "de"
  const t = await getTranslations({ locale, namespace: "about" })
  return { title: t("title"), description: t("subtitle") }
}

export default function AboutPage() {
  return <AboutTemplate />
}
