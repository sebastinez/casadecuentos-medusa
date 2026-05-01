import { getTranslations } from "next-intl/server"
import { listEvents, StoreEvent } from "@lib/data/events"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

function EventTeaser({ event }: { event: StoreEvent }) {
  const date = new Date(event.starts_at)
  return (
    <LocalizedClientLink
      href={`/events/${event.slug}`}
      className="group flex flex-col gap-2 p-5 border border-brand-ink/10 rounded-large bg-white hover:border-brand-accent/30 transition-colors"
    >
      <time
        dateTime={event.starts_at}
        className="text-xs uppercase tracking-widest text-brand-accent"
      >
        {date.toLocaleDateString("default", { day: "numeric", month: "long" })}
      </time>
      <p className="font-display text-lg text-brand-ink group-hover:text-brand-accent transition-colors leading-snug">
        {event.title}
      </p>
      {event.location && (
        <p className="text-xs text-brand-ink50">{event.location}</p>
      )}
    </LocalizedClientLink>
  )
}

export default async function EventsTeaser({
  countryCode,
}: {
  countryCode: string
}) {
  const [t, tEvents] = await Promise.all([
    getTranslations("home"),
    getTranslations("events"),
  ])

  const events = await listEvents({ when: "upcoming", locale: countryCode }).catch(
    () => [] as StoreEvent[]
  )
  const preview = events.slice(0, 3)

  return (
    <section className="content-container py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl text-brand-ink">
            {t("eventsTeaserTitle")}
          </h2>
          <p className="mt-1 text-brand-ink70">{t("eventsTeaserSubtitle")}</p>
        </div>
        <LocalizedClientLink
          href="/events"
          className="text-sm text-brand-accent hover:underline underline-offset-2 shrink-0 ml-4"
        >
          {t("heroCtaEvents")} →
        </LocalizedClientLink>
      </div>
      {preview.length === 0 ? (
        <p className="text-brand-ink50 text-sm">{tEvents("noUpcoming")}</p>
      ) : (
        <ul className="grid small:grid-cols-3 gap-4">
          {preview.map((e) => (
            <li key={e.id}>
              <EventTeaser event={e} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
