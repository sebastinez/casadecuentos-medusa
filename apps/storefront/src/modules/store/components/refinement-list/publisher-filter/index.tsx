"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

type PublisherFilterProps = {
  publishers: string[]
}

export default function PublisherFilter({ publishers }: PublisherFilterProps) {
  const t = useTranslations("store")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selected = searchParams.getAll("publisher")

  const toggle = (name: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("publisher")
    const next = selected.includes(name)
      ? selected.filter((v) => v !== name)
      : [...selected, name]
    next.forEach((v) => params.append("publisher", v))
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  if (!publishers.length) return null

  return (
    <div className="flex flex-col gap-y-3">
      <span className="txt-compact-small-plus text-ui-fg-muted">
        {t("filterPublishers")}
      </span>
      <ul className="flex flex-col gap-y-2">
        {publishers.map((pub) => (
          <li key={pub} className="flex items-center gap-x-2">
            <input
              type="checkbox"
              id={`pub-${pub}`}
              checked={selected.includes(pub)}
              onChange={() => toggle(pub)}
              className="accent-brand-accent cursor-pointer"
            />
            <label
              style={{ transform: "none" }}
              htmlFor={`pub-${pub}`}
              className="txt-compact-small text-ui-fg-subtle hover:cursor-pointer hover:text-ui-fg-base"
            >
              {pub}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
