import { getTranslations } from "next-intl/server"
import Image from "next/image"
import { StoreEvent } from "@lib/data/events"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui"

export default async function EventDetailTemplate({
  event,
}: {
  event: StoreEvent
}) {
  const t = await getTranslations("events")
  const tCommon = await getTranslations("common")

  const startDate = new Date(event.starts_at)
  const endDate = event.ends_at ? new Date(event.ends_at) : null

  return (
    <div className="content-container py-16 small:py-24 animate-fade-in">
      <LocalizedClientLink
        href="/events"
        className="inline-flex items-center gap-2 text-sm text-brand-ink70 hover:text-brand-ink mb-10 group"
      >
        ← {tCommon("back")}
      </LocalizedClientLink>

      <div className="grid small:grid-cols-3 gap-12 items-start">
        <div className="small:col-span-2">
          {event.cover_image_url && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-large bg-brand-paper mb-10">
              <Image
                src={event.cover_image_url}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="font-display text-4xl small:text-5xl text-brand-ink mb-6">
            {event.title}
          </h1>
          <p className="text-brand-ink70 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>

        <aside className="flex flex-col gap-6 text-sm sticky top-24">
          <div className="p-6 border border-brand-ink/10 rounded-large bg-brand-paper">
            <dl className="flex flex-col gap-4">
              <div>
                <dt className="font-medium text-brand-ink mb-1">{t("when")}</dt>
                <dd className="text-brand-ink70">
                  <time dateTime={event.starts_at}>
                    {startDate.toLocaleDateString("default", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {" "}
                    {startDate.toLocaleTimeString("default", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                  {endDate && (
                    <span className="block text-brand-ink50 text-xs mt-0.5">
                      {t("until")}{" "}
                      {endDate.toLocaleTimeString("default", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </dd>
              </div>
              {event.location && (
                <div>
                  <dt className="font-medium text-brand-ink mb-1">
                    {t("where")}
                  </dt>
                  <dd className="text-brand-ink70 whitespace-pre-line">
                    {event.location}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <LocalizedClientLink href="/contact">
            <Button variant="secondary" className="w-full">
              {t("rsvp")}
            </Button>
          </LocalizedClientLink>
        </aside>
      </div>
    </div>
  )
}
