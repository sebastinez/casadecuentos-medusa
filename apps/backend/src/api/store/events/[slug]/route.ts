import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { EVENTS_MODULE } from "../../../../modules/events"
import EventsModuleService from "../../../../modules/events/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const eventsService: EventsModuleService = req.scope.resolve(EVENTS_MODULE)
  const { slug } = req.params
  const { locale = "de" } = req.query as Record<string, string>

  const [event] = await eventsService.listEvents({ slug, is_published: true })

  if (!event) {
    return res.status(404).json({ message: "Event not found." })
  }

  const lang = locale === "es" ? "es" : "de"

  return res.json({
    event: {
      id: event.id,
      slug: event.slug,
      title: lang === "es" ? event.title_es : event.title_de,
      description: lang === "es" ? event.description_es : event.description_de,
      starts_at: event.starts_at,
      ends_at: event.ends_at,
      location: event.location,
      cover_image_url: event.cover_image_url,
    },
  })
}
