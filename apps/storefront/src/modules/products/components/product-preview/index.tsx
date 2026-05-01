import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const publisher =
    typeof product.metadata?.publisher === "string"
      ? product.metadata.publisher
      : null

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
    >
      <article
        data-testid="product-wrapper"
        className="flex flex-col gap-3 transition-transform duration-200 group-hover:-translate-y-1"
      >
        <div className="rounded-large overflow-hidden bg-brand-paper ring-1 ring-brand-ink/5">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
        </div>
        <div className="flex flex-col gap-1">
          {publisher && (
            <span className="text-[10px] uppercase tracking-widest text-brand-accent">
              {publisher}
            </span>
          )}
          <div className="flex items-start justify-between gap-3">
            <h3
              className="font-display text-lg leading-snug text-brand-ink"
              data-testid="product-title"
            >
              {product.title}
            </h3>
            <div className="text-sm text-brand-ink70 mt-0.5 whitespace-nowrap">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
          </div>
        </div>
      </article>
    </LocalizedClientLink>
  )
}
