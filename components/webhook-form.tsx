"use client"

import { useState } from "react"
import type { CreateWebhookRequest, Webhook, WebhookEvent } from "@/lib/client-api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

const EVENT_GROUPS = {
  "Posts": {
    events: ["post.created", "post.updated", "post.deleted"] as WebhookEvent[],
    description: "Triggered when blog posts are created, updated, or deleted"
  },
  "Categories": {
    events: ["category.created", "category.updated", "category.deleted"] as WebhookEvent[],
    description: "Triggered when post categories are modified"
  },
  "Tags": {
    events: ["tag.created", "tag.updated", "tag.deleted"] as WebhookEvent[],
    description: "Triggered when post tags are modified"
  },
  "Engagement": {
    events: ["newsletter.subscribed", "comment.added"] as WebhookEvent[],
    description: "Triggered when users interact with your blog"
  }
}

const ALL_EVENTS: WebhookEvent[] = Object.values(EVENT_GROUPS).flatMap(group => group.events)

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

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>Subscribed Events</Label>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="max-h-64 overflow-y-auto border rounded-md p-3 bg-muted/20">
          <div className="space-y-4">
            {Object.entries(EVENT_GROUPS).map(([groupName, group]) => (
              <div key={groupName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">{groupName}</h4>
                  <Badge variant="outline" className="text-xs">
                    {group.events.filter(e => events.includes(e)).length}/{group.events.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{group.description}</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {group.events.map(ev => (
                    <label key={ev} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/30 p-1 rounded">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-blue-600"
                        checked={events.includes(ev)}
                        onChange={() => toggleEvent(ev)}
                      />
                      <span className="font-mono text-xs">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Selected {events.length} of {ALL_EVENTS.length} events
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

