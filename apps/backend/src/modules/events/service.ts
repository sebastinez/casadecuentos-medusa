import { MedusaService } from "@medusajs/framework/utils"
import Event from "./models/event"

class EventsModuleService extends MedusaService({ Event }) {}

export default EventsModuleService
