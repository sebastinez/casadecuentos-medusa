import { getTranslations } from "next-intl/server"
import Image from "next/image"
import { listEvents, StoreEvent } from "@lib/data/events"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

function EventCard({ event }: { event: StoreEvent }) {
  const date = new Date(event.starts_at)
  return (
    <LocalizedClientLink href={`/events/${event.slug}`} className="group block">
      <article className="flex flex-col gap-4 p-6 border border-brand-ink/10 rounded-large bg-white hover:border-brand-accent/40 transition-colors">
        {event.cover_image_url && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-large bg-brand-paper">
            <Image
              src={event.cover_image_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <time
            dateTime={event.starts_at}
            className="text-xs uppercase tracking-widest text-brand-accent"
          >
            {date.toLocaleDateString("default", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          <h3 className="font-display text-xl text-brand-ink group-hover:text-brand-accent transition-colors">
            {event.title}
          </h3>
          {event.location && (
            <p className="text-sm text-brand-ink50">{event.location}</p>
          )}
          <p className="text-sm text-brand-ink70 line-clamp-3">
            {event.description}
          </p>
        </div>
      </article>
    </LocalizedClientLink>
  )
}

export default async function EventListTemplate({
  countryCode,
}: {
  countryCode: string
}) {
  const t = await getTranslations("events")
  const locale = countryCode

  const [upcoming, past] = await Promise.all([
    listEvents({ when: "upcoming", locale }),
    listEvents({ when: "past", locale }),
  ])

  return (
    <div className="content-container py-16 small:py-24 animate-fade-in">
      <header className="max-w-2xl mb-14">
        <h1 className="font-display text-4xl small:text-5xl text-brand-ink mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-brand-ink70">{t("subtitle")}</p>
      </header>

      <section className="mb-16">
        <h2 className="font-display text-2xl text-brand-ink mb-8">
          {t("upcoming")}
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-brand-ink50">{t("noUpcoming")}</p>
        ) : (
          <ul className="grid small:grid-cols-2 medium:grid-cols-3 gap-6">
            {upcoming.map((e) => (
              <li key={e.id}>
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-brand-ink mb-8">
            {t("past")}
          </h2>
          <ul className="grid small:grid-cols-2 medium:grid-cols-3 gap-6 opacity-70">
            {past.map((e) => (
              <li key={e.id}>
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
