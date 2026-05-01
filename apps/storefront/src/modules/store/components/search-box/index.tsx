"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { MagnifyingGlassMini, XMark } from "@medusajs/icons"

export default function SearchBox() {
  const t = useTranslations("store")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get("q") ?? ""
  const [value, setValue] = useState(initialQ)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(searchParams.get("q") ?? "")
  }, [searchParams])

  const pushQ = (q: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (q) {
      params.set("q", q)
    } else {
      params.delete("q")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setValue(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => pushQ(next), 300)
  }

  const handleClear = () => {
    setValue("")
    pushQ("")
  }

  return (
    <div className="relative flex items-center">
      <MagnifyingGlassMini className="absolute left-3 text-brand-ink50 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={t("searchPlaceholder")}
        className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-brand-ink/15 rounded-large focus:outline-none focus:border-brand-accent placeholder:text-brand-ink50 text-brand-ink"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-brand-ink50 hover:text-brand-ink"
          aria-label="Clear search"
        >
          <XMark />
        </button>
      )}
    </div>
  )
}
