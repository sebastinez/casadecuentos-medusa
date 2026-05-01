import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import EventsTeaser from "@modules/home/components/events-teaser"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { isLocale } from "@i18n/config"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await params
  const locale = isLocale(countryCode) ? countryCode : "de"
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: t("homeTitle"), description: t("homeDescription") }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  setRequestLocale(countryCode)

  const [region, { collections }] = await Promise.all([
    getRegion(countryCode).catch(() => null),
    listCollections({ fields: "id, handle, title" }).catch(() => ({
      collections: [],
    })),
  ])

  return (
    <>
      <Hero />
      {collections && region && (
        <div className="py-12">
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </div>
      )}
      <EventsTeaser countryCode={countryCode} />
    </>
  )
}
