import { model } from "@medusajs/framework/utils"

const Event = model.define("event", {
  id: model.id().primaryKey(),
  slug: model.text(),
  title_de: model.text(),
  title_es: model.text(),
  description_de: model.text(),
  description_es: model.text(),
  starts_at: model.dateTime(),
  ends_at: model.dateTime().nullable(),
  location: model.text().nullable(),
  cover_image_url: model.text().nullable(),
  is_published: model.boolean().default(false),
})

export default Event
