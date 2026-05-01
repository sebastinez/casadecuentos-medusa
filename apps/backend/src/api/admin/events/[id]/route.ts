import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { EVENTS_MODULE } from "../../../../modules/events"
import EventsModuleService from "../../../../modules/events/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const eventsService: EventsModuleService = req.scope.resolve(EVENTS_MODULE)
  const event = await eventsService.retrieveEvent(req.params.id)
  return res.json({ event })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const eventsService: EventsModuleService = req.scope.resolve(EVENTS_MODULE)
  const body = req.body as Record<string, unknown>

  const update: Record<string, unknown> = { id: req.params.id }

  const dateFields = ["starts_at", "ends_at"] as const
  for (const field of dateFields) {
    if (field in body) {
      update[field] = body[field] ? new Date(body[field] as string) : null
    }
  }

  const textFields = [
    "slug", "title_de", "title_es", "description_de", "description_es",
    "location", "cover_image_url",
  ] as const
  for (const field of textFields) {
    if (field in body) update[field] = body[field]
  }

  if ("is_published" in body) update["is_published"] = body["is_published"]

  const event = await eventsService.updateEvents(update as Parameters<typeof eventsService.updateEvents>[0])
  return res.json({ event })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const eventsService: EventsModuleService = req.scope.resolve(EVENTS_MODULE)
  await eventsService.deleteEvents([req.params.id])
  return res.status(200).json({ id: req.params.id, deleted: true })
}
