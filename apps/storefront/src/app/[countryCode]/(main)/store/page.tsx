import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { isLocale } from "@i18n/config"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await params
  const locale = isLocale(countryCode) ? countryCode : "de"
  const t = await getTranslations({ locale, namespace: "store" })
  return { title: t("title"), description: t("subtitle") }
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    q?: string
    category?: string | string[]
    publisher?: string | string[]
  }>
  params: Promise<{ countryCode: string }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page, q } = searchParams

  const categoryIds = searchParams.category
    ? Array.isArray(searchParams.category)
      ? searchParams.category
      : [searchParams.category]
    : undefined

  const publisherSlugs = searchParams.publisher
    ? Array.isArray(searchParams.publisher)
      ? searchParams.publisher
      : [searchParams.publisher]
    : undefined

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      q={q}
      categoryIds={categoryIds}
      publisherSlugs={publisherSlugs}
    />
  )
}
