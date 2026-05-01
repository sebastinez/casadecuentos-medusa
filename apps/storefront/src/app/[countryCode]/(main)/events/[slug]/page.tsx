import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getEventBySlug } from "@lib/data/events"
import EventDetailTemplate from "@modules/events/templates/event-detail"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryCode, slug } = await params
  const event = await getEventBySlug(slug, countryCode)
  if (!event) return {}
  return { title: event.title, description: event.description.slice(0, 160) }
}

export default async function EventDetailPage({ params }: Props) {
  const { countryCode, slug } = await params
  const event = await getEventBySlug(slug, countryCode)

  if (!event) return notFound()

  return <EventDetailTemplate event={event} />
}
