import { getTranslations } from "next-intl/server"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  categoryIds,
  productsIds,
  countryCode,
  q,
  publisherSlugs,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  categoryIds?: string[]
  productsIds?: string[]
  countryCode: string
  q?: string
  publisherSlugs?: string[]
}) {
  const region = await getRegion(countryCode)
  if (!region) return null

  const resolvedCategoryIds = [
    ...(categoryId ? [categoryId] : []),
    ...(categoryIds ?? []),
  ]

  const queryParams: { limit: number; collection_id?: string[]; id?: string[] } =
    { limit: PRODUCT_LIMIT }

  if (collectionId) queryParams["collection_id"] = [collectionId]
  if (productsIds) queryParams["id"] = productsIds

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy: sortBy ?? "created_at",
    countryCode,
    q,
    categoryIds: resolvedCategoryIds.length ? resolvedCategoryIds : undefined,
    publisherSlugs,
  })

  const hasActiveFilters =
    q || resolvedCategoryIds.length || (publisherSlugs?.length ?? 0) > 0

  if (products.length === 0) {
    const t = await getTranslations("store")
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="text-brand-ink70">{t("noResults")}</p>
        {hasActiveFilters && (
          <LocalizedClientLink
            href="/store"
            className="text-sm text-brand-accent hover:underline underline-offset-2"
          >
            {t("resetFilters")}
          </LocalizedClientLink>
        )}
      </div>
    )
  }

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {products.map((p) => (
          <li key={p.id}>
            <ProductPreview product={p} region={region} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
