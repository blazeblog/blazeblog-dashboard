"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { WebhookForm } from "@/components/webhook-form"
import { Skeleton } from "@/components/ui/skeleton"
import { useClientApi, type Webhook } from "@/lib/client-api"
import { usePageTitle } from "@/hooks/use-page-title"
import { useToast } from "@/hooks/use-toast"
import { copyToClipboard } from "@/lib/utils"

export default function EditWebhookPage() {
  usePageTitle("Edit Webhook - BlazeBlog Admin")

  const api = useClientApi()
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams<{ id: string }>()
  const webhookId = Number(params.id)

  const [webhook, setWebhook] = useState<Webhook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [newSecret, setNewSecret] = useState<string | null>(null)

  useEffect(() => {
    let done = false
    const run = async () => {
      try {
        setLoading(true)
        const w = await api.webhooks.get(webhookId)
        if (!done) setWebhook(w)
      } catch (e: any) {
        if (!done) setError(e?.message || "Failed to load webhook")
      } finally {
        if (!done) setLoading(false)
      }
    }
    if (!isNaN(webhookId)) run()
    return () => { done = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webhookId])

  const handleUpdate = async (data: Partial<Webhook>) => {
    if (!webhook) return
    try {
      setSaving(true)
      setError(null)
      const updated = await api.webhooks.update(webhook.id, {
        url: data.url!,
        events: data.events!,
        isActive: data.isActive!,
        description: data.description,
      })
      setWebhook(updated)
      toast({ title: 'Saved', description: 'Webhook updated successfully' })
    } catch (e: any) {
      setError(e?.message || "Failed to update webhook")
      toast({ title: 'Update failed', description: e?.message || 'Could not save changes', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleRotate = async () => {
    if (!webhook) return
    try {
      setRotating(true)
      setError(null)
      const res = await api.webhooks.rotateSecret(webhook.id)
      setNewSecret(res.secret)
    } catch (e: any) {
      setError(e?.message || "Failed to rotate secret")
    } finally {
      setRotating(false)
    }
  }

  const handleDelete = async () => {
    if (!webhook) return
    if (!confirm("Delete this webhook? This cannot be undone.")) return
    try {
      await api.webhooks.delete(webhook.id)
      router.push('/admin/webhooks')
    } catch (e: any) {
      alert(e?.message || "Failed to delete webhook")
    }
  }

  return (
    <AdminLayout title="Edit Webhook">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Edit Webhook</h1>
            <p className="text-sm text-muted-foreground">Update configuration and manage secret</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/webhooks">Back</Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Receiver Details</CardTitle>
            <CardDescription>Modify destination, events, and status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : webhook ? (
              <WebhookForm
                initial={webhook}
                onSubmit={(data) => handleUpdate(data as any)}
                submitting={saving}
                submitLabel="Save Changes"
              />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Attempts</CardTitle>
            <CardDescription>Inspect recent delivery attempts for this webhook</CardDescription>
          </CardHeader>
          <CardContent>
            {webhook && (
              <Button asChild variant="outline">
                <Link href={`/admin/webhooks/${webhook.id}/events`}>View Events</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Secret</CardTitle>
            <CardDescription>Rotate the signing secret for future deliveries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Button onClick={handleRotate} disabled={rotating || loading}>Rotate Secret</Button>
              <Button variant="outline" asChild>
                <Link href="/admin/webhooks/docs">Verification Docs</Link>
              </Button>
            </div>
            {newSecret && (
              <div className="space-y-2">
                <div className="text-sm font-medium">New Secret</div>
                <div className="flex items-center justify-between p-3 rounded border bg-muted">
                  <code className="text-xs break-all">{newSecret}</code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const ok = await copyToClipboard(newSecret!)
                      toast({ title: ok ? 'Copied' : 'Copy failed', description: ok ? 'Secret copied to clipboard' : 'Your browser blocked clipboard access', variant: ok ? undefined : 'destructive' })
                    }}
                  >Copy</Button>
                </div>
                <p className="text-xs text-muted-foreground">Copy now — it’s only shown once.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  )
}
