import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { EVENTS_MODULE } from "../../../modules/events"
import EventsModuleService from "../../../modules/events/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const eventsService: EventsModuleService = req.scope.resolve(EVENTS_MODULE)
  const { when = "upcoming", locale = "de" } = req.query as Record<string, string>

  const now = new Date()

  let events = await eventsService.listEvents(
    { is_published: true },
    { order: { starts_at: "ASC" } }
  )

  if (when === "upcoming") {
    events = events.filter((e) => new Date(e.starts_at) >= now)
  } else if (when === "past") {
    events = events.filter((e) => new Date(e.starts_at) < now)
  }

  const lang = locale === "es" ? "es" : "de"

  return res.json({
    events: events.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: lang === "es" ? e.title_es : e.title_de,
      description: lang === "es" ? e.description_es : e.description_de,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
      location: e.location,
      cover_image_url: e.cover_image_url,
    })),
  })
}
