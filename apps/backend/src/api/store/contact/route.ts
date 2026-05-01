import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

type ContactBody = {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { name, email, subject, message } = req.body as ContactBody

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." })
  }

  // TODO: replace with a notification provider (Resend / SMTP) to email María.
  console.info("[contact form]", { name, email, subject, message })

  return res.status(200).json({ success: true })
}
