import { getTranslations } from "next-intl/server"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = async () => {
  const t = await getTranslations("home")

  return (
    <section className="relative w-full overflow-hidden bg-brand-cream">
      <Squiggle className="absolute -left-10 top-12 hidden small:block text-brand-accent-soft" />
      <Sun className="absolute right-8 top-10 hidden small:block text-brand-mustard/80" />
      <div className="content-container flex flex-col items-center text-center gap-6 py-20 small:py-32">
        <span className="txt-small-plus uppercase tracking-[0.25em] text-brand-accent">
          {t("heroEyebrow")}
        </span>
        <h1 className="font-display text-5xl small:text-7xl leading-[1.05] text-brand-ink max-w-3xl animate-fade-in-top">
          {t("heroTitle")}
        </h1>
        <p className="text-base small:text-lg text-brand-ink70 max-w-xl">
          {t("heroSubtitle")}
        </p>
        <div className="flex flex-col xsmall:flex-row gap-3 mt-2">
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center justify-center h-12 px-6 rounded-circle bg-brand-ink text-brand-paper font-medium hover:bg-brand-accent transition-colors"
          >
            {t("heroCtaCatalog")}
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/events"
            className="inline-flex items-center justify-center h-12 px-6 rounded-circle border border-brand-ink/15 text-brand-ink hover:bg-brand-accent-soft hover:border-brand-accent-soft transition-colors"
          >
            {t("heroCtaEvents")}
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

const Squiggle = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    width="220"
    height="60"
    viewBox="0 0 220 60"
    fill="none"
    className={className}
  >
    <path
      d="M2 30 C 30 5, 60 55, 90 30 S 150 5, 180 30 S 218 55, 218 30"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
)

const Sun = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    className={className}
  >
    <circle cx="40" cy="40" r="14" fill="currentColor" />
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * Math.PI) / 4
      const x1 = 40 + Math.cos(angle) * 22
      const y1 = 40 + Math.sin(angle) * 22
      const x2 = 40 + Math.cos(angle) * 32
      const y2 = 40 + Math.sin(angle) * 32
      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      )
    })}
  </svg>
)

export default Hero
