import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type StoreEvent = {
  id: string
  slug: string
  title: string
  description: string
  starts_at: string
  ends_at: string | null
  location: string | null
  cover_image_url: string | null
}

export const listEvents = async ({
  when = "upcoming",
  locale = "de",
}: {
  when?: "upcoming" | "past" | "all"
  locale?: string
}): Promise<StoreEvent[]> => {
  const next = await getCacheOptions("events")

  const result = await sdk.client
    .fetch<{ events: StoreEvent[] }>("/store/events", {
      method: "GET",
      query: { when, locale },
      next,
      cache: "force-cache",
    })
    .catch(() => ({ events: [] as StoreEvent[] }))

  return result.events
}

export const getEventBySlug = async (
  slug: string,
  locale = "de"
): Promise<StoreEvent | null> => {
  const next = await getCacheOptions("events")

  const result = await sdk.client
    .fetch<{ event: StoreEvent }>(`/store/events/${slug}`, {
      method: "GET",
      query: { locale },
      next,
      cache: "force-cache",
    })
    .catch(() => null)

  return result?.event ?? null
}
