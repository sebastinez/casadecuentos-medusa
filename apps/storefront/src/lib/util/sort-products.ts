import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

interface MinPricedProduct extends HttpTypes.StoreProduct {
  _minPrice?: number
}

export function sortProducts(
  products: HttpTypes.StoreProduct[],
  sortBy: SortOptions
): HttpTypes.StoreProduct[] {
  const sortedProducts = products as MinPricedProduct[]

  if (sortBy === "price_asc" || sortBy === "price_desc") {
    sortedProducts.forEach((product) => {
      product._minPrice =
        product.variants && product.variants.length > 0
          ? Math.min(
              ...product.variants.map(
                (v) => v?.calculated_price?.calculated_amount || 0
              )
            )
          : Infinity
    })
    sortedProducts.sort((a, b) => {
      const diff = a._minPrice! - b._minPrice!
      return sortBy === "price_asc" ? diff : -diff
    })
  }

  if (sortBy === "created_at") {
    sortedProducts.sort(
      (a, b) =>
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
    )
  }

  if (sortBy === "title") {
    sortedProducts.sort((a, b) =>
      (a.title ?? "").localeCompare(b.title ?? "", undefined, {
        sensitivity: "base",
      })
    )
  }

  return sortedProducts
}
