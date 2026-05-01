import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Table, Text, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

// Inline minimal icons (avoids adding @medusajs/icons as a direct dep)
const IconCalendar = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
    <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 8h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconPencil = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)
const IconTrash = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path d="M2 4h12M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const config = defineRouteConfig({
  label: "Veranstaltungen",
  icon: IconCalendar,
})

type Event = {
  id: string
  slug: string
  title_de: string
  title_es: string
  description_de: string
  description_es: string
  starts_at: string
  ends_at?: string
  location?: string
  is_published: boolean
}

type FormState = Omit<Event, "id"> & { id?: string }

const emptyForm = (): FormState => ({
  slug: "",
  title_de: "",
  title_es: "",
  description_de: "",
  description_es: "",
  starts_at: "",
  ends_at: "",
  location: "",
  is_published: false,
})

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("_medusa_auth_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...(opts.headers as Record<string, string> | undefined),
    },
    credentials: "include",
  })

export default function EventsAdminPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)

  const loadEvents = async () => {
    setLoading(true)
    try {
      const res = await apiFetch("/admin/events")
      const data = await res.json() as { events?: Event[] }
      setEvents(data.events ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEvents() }, [])

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    try {
      const url = form.id ? `/admin/events/${form.id}` : "/admin/events"
      const res = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Save failed")
      toast.success("Gespeichert!")
      setForm(null)
      loadEvents()
    } catch {
      toast.error("Fehler beim Speichern.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Veranstaltung wirklich löschen?")) return
    await apiFetch(`/admin/events/${id}`, { method: "DELETE" })
    loadEvents()
  }

  const handleTogglePublish = async (event: Event) => {
    await apiFetch(`/admin/events/${event.id}`, {
      method: "POST",
      body: JSON.stringify({ is_published: !event.is_published }),
    })
    loadEvents()
  }

  const FIELDS: [keyof FormState, string][] = [
    ["slug", "Slug (URL)"],
    ["title_de", "Titel DE"],
    ["title_es", "Título ES"],
    ["description_de", "Beschreibung DE"],
    ["description_es", "Descripción ES"],
    ["starts_at", "Beginn (ISO, z.B. 2025-06-14T16:00)"],
    ["ends_at", "Ende (ISO, optional)"],
    ["location", "Ort"],
  ]

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>Veranstaltungen</Heading>
        <Button size="small" variant="secondary" onClick={() => setForm(emptyForm())}>
          + Neue Veranstaltung
        </Button>
      </div>

      {form && (
        <div className="px-6 py-4 bg-ui-bg-subtle">
          <Heading level="h3" className="mb-4">
            {form.id ? "Bearbeiten" : "Neue Veranstaltung"}
          </Heading>
          <div className="grid grid-cols-2 gap-4">
            {FIELDS.map(([key, label]) => (
              <div key={key} className={`flex flex-col gap-1 ${key.startsWith("description") ? "col-span-2" : ""}`}>
                <Text size="small" className="font-medium">{label}</Text>
                {key.startsWith("description") ? (
                  <textarea
                    rows={3}
                    className="border rounded px-3 py-1.5 text-sm bg-ui-bg-base resize-none"
                    value={(form[key] as string) ?? ""}
                    onChange={(e) => setForm((f) => f ? { ...f, [key]: e.target.value } : f)}
                  />
                ) : (
                  <input
                    className="border rounded px-3 py-1.5 text-sm bg-ui-bg-base"
                    value={(form[key] as string) ?? ""}
                    onChange={(e) => setForm((f) => f ? { ...f, [key]: e.target.value } : f)}
                  />
                )}
              </div>
            ))}
            <div className="flex items-center gap-2 col-span-2">
              <input
                type="checkbox"
                id="is_published"
                checked={form.is_published}
                onChange={(e) => setForm((f) => f ? { ...f, is_published: e.target.checked } : f)}
              />
              <label htmlFor="is_published" className="text-sm">Veröffentlicht</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="small" onClick={handleSave} disabled={saving}>
              {saving ? "Speichern…" : "Speichern"}
            </Button>
            <Button size="small" variant="secondary" onClick={() => setForm(null)}>
              Abbrechen
            </Button>
          </div>
        </div>
      )}

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Titel DE</Table.HeaderCell>
            <Table.HeaderCell>Slug</Table.HeaderCell>
            <Table.HeaderCell>Datum</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && (
            <Table.Row>
              <Table.Cell><Text className="text-ui-fg-subtle">Lädt…</Text></Table.Cell>
              <Table.Cell /><Table.Cell /><Table.Cell /><Table.Cell />
            </Table.Row>
          )}
          {!loading && events.length === 0 && (
            <Table.Row>
              <Table.Cell>
                <Text className="text-ui-fg-subtle">Noch keine Veranstaltungen.</Text>
              </Table.Cell>
              <Table.Cell /><Table.Cell /><Table.Cell /><Table.Cell />
            </Table.Row>
          )}
          {events.map((e) => (
            <Table.Row key={e.id}>
              <Table.Cell>{e.title_de}</Table.Cell>
              <Table.Cell>
                <Text size="small" className="text-ui-fg-subtle">{e.slug}</Text>
              </Table.Cell>
              <Table.Cell>
                <Text size="small">
                  {new Date(e.starts_at).toLocaleDateString("de-DE")}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <button onClick={() => handleTogglePublish(e)}>
                  <Badge size="xsmall" color={e.is_published ? "green" : "grey"}>
                    {e.is_published ? "Veröffentlicht" : "Entwurf"}
                  </Badge>
                </button>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setForm({ ...e })}
                    className="text-ui-fg-subtle hover:text-ui-fg-base"
                  >
                    <IconPencil />
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="text-ui-fg-subtle hover:text-red-500"
                  >
                    <IconTrash />
                  </button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  )
}
