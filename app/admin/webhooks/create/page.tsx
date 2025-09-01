"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { WebhookForm } from "@/components/webhook-form"
import { useClientApi, type CreateWebhookRequest, type CreateWebhookResponse } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"
import { copyToClipboard } from "@/lib/utils"
import { usePageTitle } from "@/hooks/use-page-title"

export default function CreateWebhookPage() {
  usePageTitle("Create Webhook - BlazeBlog Admin")

  const api = useClientApi()
  const router = useRouter()
  const { toast } = useToast()
  const [creating, setCreating] = useState(false)
  const [secret, setSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (data: CreateWebhookRequest) => {
    try {
      setCreating(true)
      setError(null)
      const created = await api.webhooks.create(data) as CreateWebhookResponse
      setSecret(created.secret)
    } catch (e: any) {
      setError(e?.message || "Failed to create webhook")
    } finally {
      setCreating(false)
    }
  }

  return (
    <AdminLayout title="Create Webhook">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Create Webhook</h1>
            <p className="text-sm text-muted-foreground">Add a new webhook receiver</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/webhooks">Back to Webhooks</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Receiver Details</CardTitle>
            <CardDescription>Configure the destination and events</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="text-sm text-destructive mb-4">{error}</div>}
            <WebhookForm onSubmit={handleCreate} submitting={creating} submitLabel="Create" />
          </CardContent>
        </Card>

        {secret && (
          <Card>
            <CardHeader>
              <CardTitle>Secret Created</CardTitle>
              <CardDescription>Copy this secret now. You won’t see it again.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded border bg-muted">
                <code className="text-xs break-all">{secret}</code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const ok = await copyToClipboard(secret)
                    toast({ title: ok ? 'Copied' : 'Copy failed', description: ok ? 'Secret copied to clipboard' : 'Your browser blocked clipboard access', variant: ok ? undefined : 'destructive' })
                  }}
                >Copy</Button>
              </div>
              <Separator className="my-4" />
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="font-medium text-foreground">Next step</div>
                <p>
                  Send the computed signature in the request header
                  <code className="mx-1 px-1 py-0.5 rounded bg-background border">X-Blaze-Signature</code>.
                </p>
                <pre className="rounded bg-muted p-3 text-[11px] overflow-auto"><code>{`X-Blaze-Signature: t=<unix_ts>,v1=<hex_hmac>`}</code></pre>
                <p>
                  Compute <code>v1</code> as HMAC-SHA256 of <code>{'`<t>.{raw_body}`'}</code> using this secret.
                </p>
              </div>
              <Separator className="my-4" />
              <div className="flex gap-2">
                <Button onClick={() => router.push('/admin/webhooks')}>Done</Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/webhooks/docs">View Docs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
