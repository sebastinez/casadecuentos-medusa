import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { isLocale } from "@i18n/config"
import EventListTemplate from "@modules/events/templates/event-list"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await params
  const locale = isLocale(countryCode) ? countryCode : "de"
  const t = await getTranslations({ locale, namespace: "events" })
  return { title: t("title"), description: t("subtitle") }
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  return <EventListTemplate countryCode={countryCode} />
}
