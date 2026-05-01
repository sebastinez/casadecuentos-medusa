import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Resend } from "resend"

type ContactBody = {
  name?: string
  email?: string
  subject?: string
  message?: string
}

const RECIPIENT = "info@casadecuentos.ch"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { name, email, subject, message } = req.body as ContactBody

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." })
  }

  // Log for observability regardless of email provider
  console.info("[contact form]", { name, email, subject, message })

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    try {
      const resend = new Resend(resendKey)
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? `Casa de Cuentos <noreply@casadecuentos.ch>`,
        to: [RECIPIENT],
        replyTo: email,
        subject: `[Contact] ${subject}`,
        html: [
          `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
          `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
          `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>`,
          `<hr/>`,
          `<p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
        ].join("\n"),
      })
    } catch (err) {
      console.error("[contact form] Failed to send email via Resend", err)
      return res.status(500).json({ error: "Failed to send message." })
    }
  } else {
    console.warn(
      "[contact form] RESEND_API_KEY not set – email not sent. Set it in .env to enable delivery."
    )
  }

  return res.status(200).json({ success: true })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
