"use server"

import { sdk } from "@lib/config"

type FormState = { success: boolean } | null

export async function submitContact(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = formData.get("name")?.toString().trim()
  const email = formData.get("email")?.toString().trim()
  const subject = formData.get("subject")?.toString().trim()
  const message = formData.get("message")?.toString().trim()

  if (!name || !email || !subject || !message) {
    return { success: false }
  }

  try {
    await sdk.client.fetch("/store/contact", {
      method: "POST",
      body: { name, email, subject, message },
    })
    return { success: true }
  } catch {
    return { success: false }
  }
}
