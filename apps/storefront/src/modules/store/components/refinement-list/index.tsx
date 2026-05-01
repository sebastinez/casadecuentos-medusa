"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { HttpTypes } from "@medusajs/types"
import { ChevronDown } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"

import SearchBox from "@modules/store/components/search-box"
import SortProducts, { SortOptions } from "./sort-products"
import CategoryFilter from "./category-filter"
import PublisherFilter from "./publisher-filter"

type RefinementListProps = {
  sortBy: SortOptions
  categories?: HttpTypes.StoreProductCategory[]
  publishers?: string[]
  "data-testid"?: string
}

const RefinementList = ({
  sortBy,
  categories = [],
  publishers = [],
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("store")
  const [open, setOpen] = useState(false)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  const filtersContent = (
    <div className="flex flex-col gap-y-8">
      <SearchBox />
      <SortProducts
        sortBy={sortBy}
        setQueryParams={setQueryParams}
        data-testid={dataTestId}
      />
      <CategoryFilter categories={categories} />
      <PublisherFilter publishers={publishers} />
    </div>
  )

  return (
    <>
      {/* Mobile disclosure */}
      <div className="small:hidden w-full mb-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-between w-full px-4 py-2 border border-brand-ink/15 rounded-large text-sm text-brand-ink bg-white"
        >
          <span className="font-medium">{t("filtersTitle")}</span>
          <ChevronDown
            className={clx("transition-transform duration-200", {
              "rotate-180": open,
            })}
          />
        </button>
        {open && (
          <div className="mt-3 px-4 py-4 border border-brand-ink/10 rounded-large bg-white">
            {filtersContent}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div
        className="hidden small:flex flex-col gap-y-8 py-4 small:min-w-[220px] small:ml-[1.675rem]"
        data-testid="refinement-container"
      >
        {filtersContent}
      </div>
    </>
  )
}

export default RefinementList
