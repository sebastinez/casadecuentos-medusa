"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { HttpTypes } from "@medusajs/types"

type CategoryFilterProps = {
  categories: HttpTypes.StoreProductCategory[]
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const t = useTranslations("store")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selected = searchParams.getAll("category")

  const toggle = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("category")
    const next = selected.includes(id)
      ? selected.filter((v) => v !== id)
      : [...selected, id]
    next.forEach((v) => params.append("category", v))
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  if (!categories.length) return null

  return (
    <div className="flex flex-col gap-y-3">
      <span className="txt-compact-small-plus text-ui-fg-muted">
        {t("filterCategories")}
      </span>
      <ul className="flex flex-col gap-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-x-2">
            <input
              type="checkbox"
              id={`cat-${c.id}`}
              checked={selected.includes(c.id)}
              onChange={() => toggle(c.id)}
              className="accent-brand-accent cursor-pointer"
            />
            <label
              htmlFor={`cat-${c.id}`}
              className="txt-compact-small text-ui-fg-subtle hover:cursor-pointer hover:text-ui-fg-base"
            >
              {c.name}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
