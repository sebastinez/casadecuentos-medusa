import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { EVENTS_MODULE } from "../../../modules/events"
import EventsModuleService from "../../../modules/events/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const eventsService: EventsModuleService = req.scope.resolve(EVENTS_MODULE)

  const events = await eventsService.listEvents(
    {},
    { order: { starts_at: "ASC" } }
  )

  return res.json({ events })
}

type CreateEventBody = {
  slug: string
  title_de: string
  title_es: string
  description_de: string
  description_es: string
  starts_at: string
  ends_at?: string
  location?: string
  cover_image_url?: string
  is_published?: boolean
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const eventsService: EventsModuleService = req.scope.resolve(EVENTS_MODULE)
  const body = req.body as CreateEventBody

  const event = await eventsService.createEvents({
    slug: body.slug,
    title_de: body.title_de,
    title_es: body.title_es,
    description_de: body.description_de,
    description_es: body.description_es,
    starts_at: new Date(body.starts_at),
    ends_at: body.ends_at ? new Date(body.ends_at) : undefined,
    location: body.location,
    cover_image_url: body.cover_image_url,
    is_published: body.is_published ?? false,
  })

  return res.status(201).json({ event })
}
