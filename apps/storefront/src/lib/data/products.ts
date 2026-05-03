"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,",
          ...queryParams,
        },
        headers,
        next: { ...next, revalidate: 60 },
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
  q,
  categoryIds,
  publisherSlugs,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
  q?: string
  categoryIds?: string[]
  publisherSlugs?: string[]
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12
  const isPriceSort = sortBy === "price_asc" || sortBy === "price_desc"
  const hasPublisherFilter = !!publisherSlugs?.length
  const needsMemoryOps = isPriceSort || hasPublisherFilter

  const baseQueryParams = {
    ...queryParams,
    ...(q ? { q } : {}),
    ...(categoryIds?.length ? { category_id: categoryIds } : {}),
  }

  if (needsMemoryOps) {
    const {
      response: { products },
    } = await listProducts({
      pageParam: 1,
      queryParams: { ...baseQueryParams, limit: 200 },
      countryCode,
    })

    let filtered = products

    if (hasPublisherFilter) {
      filtered = filtered.filter(
        (p) =>
          typeof p.metadata?.publisher === "string" &&
          publisherSlugs!.includes(p.metadata.publisher)
      )
    }

    if (isPriceSort) {
      filtered = sortProducts(filtered, sortBy)
    }

    const filteredCount = filtered.length
    const pageStart = (page - 1) * limit
    return {
      response: {
        products: filtered.slice(pageStart, pageStart + limit),
        count: filteredCount,
      },
      nextPage: filteredCount > pageStart + limit ? page + 1 : null,
      queryParams,
    }
  }

  const orderMap: Record<string, string> = {
    created_at: "-created_at",
    title: "title",
  }

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: page,
    queryParams: {
      ...baseQueryParams,
      limit,
      order: orderMap[sortBy] || "-created_at",
    },
    countryCode,
  })

  const pageStart = (page - 1) * limit
  return {
    response: { products, count },
    nextPage: count > pageStart + limit ? page + 1 : null,
    queryParams,
  }
}
