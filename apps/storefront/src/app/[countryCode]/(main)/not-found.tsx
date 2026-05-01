import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import InteractiveLink from "@modules/common/components/interactive-link"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound")
  return {
    title: t("title"),
    description: t("body"),
  }
}

export default async function NotFound() {
  const t = await getTranslations("notFound")

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">{t("title")}</h1>
      <p className="text-small-regular text-ui-fg-base">{t("body")}</p>
      <InteractiveLink href="/">{t("back")}</InteractiveLink>
    </div>
  )
}
