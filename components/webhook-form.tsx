"use client"

import { useState } from "react"
import type { CreateWebhookRequest, Webhook, WebhookEvent } from "@/lib/client-api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const ALL_EVENTS: WebhookEvent[] = ["newsletter.subscribed", "comment.added"]

export interface WebhookFormProps {
  initial?: Partial<CreateWebhookRequest> & Partial<Webhook>
  submitting?: boolean
  onSubmit: (data: CreateWebhookRequest) => Promise<void> | void
  submitLabel?: string
}

export function WebhookForm({ initial, submitting, onSubmit, submitLabel = "Save" }: WebhookFormProps) {
  const [url, setUrl] = useState(initial?.url || "")
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true)
  const [description, setDescription] = useState(initial?.description || "")
  const [events, setEvents] = useState<WebhookEvent[]>(
    (Array.isArray(initial?.events) && (initial?.events as WebhookEvent[])) || []
  )
  const [error, setError] = useState<string | null>(null)

  const toggleEvent = (ev: WebhookEvent) => {
    setEvents(prev => (prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!url) {
      setError("URL is required")
      return
    }
    if (events.length === 0) {
      setError("Select at least one event")
      return
    }
    await onSubmit({ url, events, isActive, description: description || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="url">Receiver URL</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com/webhooks/blaze"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Subscribed Events</Label>
        <div className="flex flex-col gap-2">
          {ALL_EVENTS.map(ev => (
            <label key={ev} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={events.includes(ev)}
                onChange={() => toggleEvent(ev)}
              />
              <span className="font-medium">{ev}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="isActive">Active</Label>
          <div className="text-xs text-muted-foreground">Deliver events to this endpoint</div>
        </div>
        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="My primary receiver"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting}>{submitLabel}</Button>
      </div>
    </form>
  )
}

