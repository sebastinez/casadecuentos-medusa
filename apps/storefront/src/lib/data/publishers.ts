import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion } from "./regions"

export const listPublishers = async (countryCode: string): Promise<string[]> => {
  const region = await getRegion(countryCode)
  if (!region) return []

  const headers = await getAuthHeaders()
  const next = await getCacheOptions("products")

  const result = await sdk.client
    .fetch<{ products: Array<{ metadata?: Record<string, unknown> }> }>(
      `/store/products`,
      {
        method: "GET",
        query: { limit: 200, region_id: region.id, fields: "+metadata" },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .catch(() => ({ products: [] as Array<{ metadata?: Record<string, unknown> }> }))

  const seen = new Set<string>()
  for (const p of result.products) {
    if (typeof p.metadata?.publisher === "string" && p.metadata.publisher) {
      seen.add(p.metadata.publisher)
    }
  }

  return Array.from(seen).sort((a, b) => a.localeCompare(b))
}
