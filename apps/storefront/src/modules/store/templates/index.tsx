import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { listCategories } from "@lib/data/categories"
import { listPublishers } from "@lib/data/publishers"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  q,
  categoryIds,
  publisherSlugs,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  q?: string
  categoryIds?: string[]
  publisherSlugs?: string[]
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const [t, productCategories, publishers] = await Promise.all([
    getTranslations("store"),
    listCategories().catch(() => []),
    listPublishers(countryCode).catch(() => [] as string[]),
  ])

  const topLevelCategories = productCategories.filter((c) => !c.parent_category)

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-12 content-container gap-x-12"
      data-testid="category-container"
    >
      <RefinementList
        sortBy={sort}
        categories={topLevelCategories}
        publishers={publishers}
      />
      <div className="w-full">
        <header className="mb-10">
          <h1
            className="font-display text-4xl small:text-5xl text-brand-ink"
            data-testid="store-page-title"
          >
            {t("title")}
          </h1>
          <p className="mt-2 text-brand-ink70">{t("subtitle")}</p>
        </header>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            q={q}
            categoryIds={categoryIds}
            publisherSlugs={publisherSlugs}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
