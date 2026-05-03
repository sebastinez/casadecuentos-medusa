import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Text, toast } from "@medusajs/ui"
import { useState } from "react"

type ProductDetailWidgetProps = {
  data: {
    id: string
    metadata?: Record<string, unknown> | null
  }
}

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("_medusa_auth_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function ProductPublisherWidget({ data }: ProductDetailWidgetProps) {
  const currentPublisher =
    typeof data.metadata?.publisher === "string" ? data.metadata.publisher : ""
  const [publisher, setPublisher] = useState(currentPublisher)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/admin/products/${data.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        credentials: "include",
        body: JSON.stringify({ metadata: { publisher } }),
      })
      if (!res.ok) throw new Error("Save failed")
      toast.success("Verlag gespeichert")
    } catch {
      toast.error("Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Verlag</Heading>
      </div>
      <div className="flex flex-col gap-y-4 px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle">
          Name des Verlags (z. B. Anaya, SM, Alfaguara)
        </Text>
        <Input
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
          placeholder="Verlag eingeben…"
        />
        <div className="flex justify-end">
          <Button size="small" onClick={handleSave} disabled={saving}>
            {saving ? "Speichern…" : "Speichern"}
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
})

export default ProductPublisherWidget
