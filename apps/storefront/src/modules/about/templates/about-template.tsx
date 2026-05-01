import { getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui"

export default async function AboutTemplate() {
  const t = await getTranslations("about")

  return (
    <div className="content-container py-16 small:py-24 animate-fade-in">
      {/* Header */}
      <header className="max-w-2xl mb-16">
        <h1 className="font-display text-4xl small:text-5xl text-brand-ink mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-brand-ink70 leading-relaxed">{t("subtitle")}</p>
      </header>

      {/* Founder section */}
      <section className="grid small:grid-cols-2 gap-12 mb-20 items-start">
        {/* Photo placeholder — replace src with a real portrait */}
        <div className="aspect-[4/5] bg-brand-paper rounded-large overflow-hidden border border-brand-ink/5 flex items-end">
          <div className="w-full bg-gradient-to-t from-brand-accent-soft/60 to-transparent p-6">
            <p className="font-display text-lg text-brand-ink">María Eugenia Raffo</p>
            <p className="text-xs text-brand-ink50">Casa de Cuentos</p>
          </div>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-6 justify-center">
          <h2 className="font-display text-3xl text-brand-ink">{t("founderTitle")}</h2>
          <p className="text-brand-ink70 leading-relaxed">{t("founderBio1")}</p>
          <p className="text-brand-ink70 leading-relaxed">{t("founderBio2")}</p>
        </div>
      </section>

      {/* Store section */}
      <section className="bg-brand-paper rounded-large p-10 small:p-14 flex flex-col small:flex-row gap-10 items-start">
        <div className="flex-1">
          <h2 className="font-display text-2xl text-brand-ink mb-4">{t("storeTitle")}</h2>
          <p className="text-brand-ink70 leading-relaxed">{t("storeBody")}</p>
        </div>
        <div className="shrink-0">
          <LocalizedClientLink href="/store">
            <Button variant="secondary">{t("storeCta")}</Button>
          </LocalizedClientLink>
        </div>
      </section>
    </div>
  )
}
