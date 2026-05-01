"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { submitContact } from "../actions"

type FormState = { success: boolean } | null

export default function ContactForm() {
  const t = useTranslations("contact")
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    submitContact,
    null
  )

  if (state?.success) {
    return (
      <p className="py-6 text-brand-accent font-medium">{t("success")}</p>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid small:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-brand-ink">
            {t("fieldName")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="px-4 py-2.5 border border-brand-ink/15 rounded-large text-sm focus:outline-none focus:border-brand-accent bg-white text-brand-ink"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-brand-ink">
            {t("fieldEmail")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="px-4 py-2.5 border border-brand-ink/15 rounded-large text-sm focus:outline-none focus:border-brand-accent bg-white text-brand-ink"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-sm font-medium text-brand-ink">
          {t("fieldSubject")}
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          className="px-4 py-2.5 border border-brand-ink/15 rounded-large text-sm focus:outline-none focus:border-brand-accent bg-white text-brand-ink"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-brand-ink">
          {t("fieldMessage")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="px-4 py-2.5 border border-brand-ink/15 rounded-large text-sm focus:outline-none focus:border-brand-accent bg-white text-brand-ink resize-none"
        />
      </div>
      {state !== null && !state.success && (
        <p className="text-sm text-red-600">{t("error")}</p>
      )}
      <div>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-brand-accent text-white font-medium rounded-large text-sm hover:bg-brand-accent/90 transition-colors disabled:opacity-60"
        >
          {isPending ? t("submitting") : t("submit")}
        </button>
      </div>
    </form>
  )
}
