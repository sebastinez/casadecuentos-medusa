import { getTranslations } from "next-intl/server"
import ContactForm from "../components/contact-form"

export default async function ContactTemplate() {
  const t = await getTranslations("contact")

  return (
    <div className="content-container py-16 small:py-24 animate-fade-in">
      <header className="max-w-2xl mb-14">
        <h1 className="font-display text-4xl small:text-5xl text-brand-ink mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-brand-ink70 leading-relaxed">{t("subtitle")}</p>
      </header>

      <div className="grid small:grid-cols-3 gap-16 items-start">
        {/* Form */}
        <div className="small:col-span-2">
          <ContactForm />
        </div>

        {/* Sidebar info */}
        <aside className="flex flex-col gap-8 text-sm text-brand-ink70">
          <div>
            <h3 className="font-medium text-brand-ink mb-2">{t("addressTitle")}</h3>
            <address className="not-italic whitespace-pre-line">
              {t("address")}
            </address>
            <p className="mt-2">
              <a
                href={`tel:${t("phone")}`}
                className="hover:text-brand-accent transition-colors"
              >
                {t("phone")}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${t("email")}`}
                className="hover:text-brand-accent transition-colors"
              >
                {t("email")}
              </a>
            </p>
          </div>
          <div>
            <h3 className="font-medium text-brand-ink mb-2">{t("hoursTitle")}</h3>
            <p className="whitespace-pre-line">{t("hours")}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
