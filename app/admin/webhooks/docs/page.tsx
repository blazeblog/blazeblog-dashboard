"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { usePageTitle } from "@/hooks/use-page-title"

export default function WebhooksDocsPage() {
  usePageTitle("Webhooks API - BlazeBlog Admin")

  return (
    <AdminLayout title="Webhooks API">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Webhooks API</CardTitle>
            <CardDescription>
              Admin endpoints to manage webhooks and inspect delivery attempts, plus payload and signature format for receivers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Base path prefix: <code className="px-1 py-0.5 rounded bg-muted text-foreground">/api/v1</code>
            </div>

            <Separator />

            <section className="space-y-2">
              <h3 className="font-semibold">Events</h3>
              <ul className="list-disc pl-6 text-sm">
                <li><code>newsletter.subscribed</code></li>
                <li><code>comment.added</code></li>
              </ul>
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="font-semibold">Delivery Payload</h3>
              <div className="text-sm space-y-1">
                <div>Method: <code>POST</code></div>
                <div>Headers:</div>
                <ul className="list-disc pl-6">
                  <li><code>Content-Type: application/json</code></li>
                  <li><code>User-Agent: BlazeBlog-Webhooks/1.0</code></li>
                  <li><code>X-Blaze-Signature: t=&lt;unix_ts&gt;,v1=&lt;hex_hmac&gt;</code></li>
                </ul>
              </div>
              <div>
                <div className="text-xs font-medium mb-1">Body</div>
                <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-xs overflow-auto"><code>{`{
  "event": "newsletter.subscribed" | "comment.added",
  "data": { ...event-specific fields }
}`}</code></pre>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="font-semibold">Signature Verification (Receiver)</h4>
              <ol className="list-decimal pl-6 text-sm space-y-1">
                <li>Parse <code>t</code> and <code>v1</code> from <code>X-Blaze-Signature</code> header.</li>
                <li>Recompute HMAC-SHA256 with your stored <code>secret</code> over the string: <code>{`"<t>." + raw_request_body`}</code>.</li>
                <li>Compare computed hex digest to <code>v1</code> in constant time; reject if mismatch or <code>t</code> is too old.</li>
              </ol>
              <div>
                <div className="text-xs font-medium mb-1">Example (Node)</div>
                <pre className="rounded bg-muted p-3 text-xs overflow-auto"><code>{`const crypto = require('crypto');
function verify(secret, header, rawBody) {
  const [tPart, v1Part] = header.split(',');
  const t = tPart.split('=')[1];
  const v1 = v1Part.split('=')[1];
  const base = t + '.' + rawBody;
  const expected = crypto.createHmac('sha256', secret).update(base).digest('hex');
  const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  return ok;
}`}</code></pre>
              </div>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin API</CardTitle>
            <CardDescription>All routes require admin auth and a current customerId.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-2">
              <h4 className="font-semibold">Create Webhook</h4>
              <div className="text-sm">POST <code>/webhooks</code></div>
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <div className="text-xs font-medium mb-1">Request</div>
                  <pre className="rounded bg-muted p-3 text-xs overflow-auto"><code>{`{
  "url": "https://example.com/webhooks/blaze",
  "events": ["newsletter.subscribed", "comment.added"],
  "isActive": true,
  "description": "My primary receiver"
}`}</code></pre>
                </div>
                <div>
                  <div className="text-xs font-medium mb-1">Response (201)</div>
                  <pre className="rounded bg-muted p-3 text-xs overflow-auto"><code>{`{
  "id": 12,
  "customerId": 3,
  "url": "https://example.com/webhooks/blaze",
  "events": ["newsletter.subscribed", "comment.added"],
  "isActive": true,
  "description": "My primary receiver",
  "secret": "<base64url-secret>",
  "createdAt": "2025-09-01T00:00:00.000Z",
  "updatedAt": "2025-09-01T00:00:00.000Z"
}`}</code></pre>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Note: The secret is only returned on create and when rotated.</p>
            </section>

            <Separator />

            <section className="space-y-2">
              <h4 className="font-semibold">List Webhooks</h4>
              <div className="text-sm">GET <code>/webhooks</code></div>
              <pre className="rounded bg-muted p-3 text-xs overflow-auto"><code>{`[
  {
    "id": 12,
    "customerId": 3,
    "url": "https://example.com/webhooks/blaze",
    "events": ["newsletter.subscribed", "comment.added"],
    "isActive": true,
    "description": "My primary receiver",
    "createdAt": "2025-09-01T00:00:00.000Z",
    "updatedAt": "2025-09-01T00:00:00.000Z"
  }
]`}</code></pre>
            </section>

            <Separator />

            <section className="space-y-2">
              <h4 className="font-semibold">Get Webhook</h4>
              <div className="text-sm">GET <code>/webhooks/:id</code></div>
              <div className="text-xs text-muted-foreground">Response shape matches list item.</div>
            </section>

            <Separator />

            <section className="space-y-2">
              <h4 className="font-semibold">Update Webhook</h4>
              <div className="text-sm">PATCH <code>/webhooks/:id</code></div>
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <div className="text-xs font-medium mb-1">Request</div>
                  <pre className="rounded bg-muted p-3 text-xs overflow-auto"><code>{`{
  "url": "https://example.com/new-path",
  "events": ["comment.added"],
  "isActive": false,
  "description": "Temporarily disabled"
}`}</code></pre>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Response (200): updated webhook (no secret)</div>
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-2">
              <h4 className="font-semibold">Delete Webhook</h4>
              <div className="text-sm">DELETE <code>/webhooks/:id</code> → 204 No Content</div>
            </section>

            <Separator />

            <section className="space-y-2">
              <h4 className="font-semibold">Rotate Secret</h4>
              <div className="text-sm">POST <code>/webhooks/:id/rotate-secret</code></div>
              <pre className="rounded bg-muted p-3 text-xs overflow-auto"><code>{`{
  "secret": "<new-base64url-secret>"
}`}</code></pre>
            </section>

            <Separator />

            <section className="space-y-2">
              <h4 className="font-semibold">List Delivery Attempts</h4>
              <div className="text-sm">GET <code>/webhooks/:id/events?page=1&amp;limit=10</code></div>
              <pre className="rounded bg-muted p-3 text-xs overflow-auto"><code>{`{
  "data": [
    {
      "id": 101,
      "webhookId": 12,
      "customerId": 3,
      "event": "comment.added",
      "payload": { "id": 55, "postId": 9, "content": "..." },
      "url": "https://example.com/webhooks/blaze",
      "attempt": 1,
      "httpStatus": 200,
      "responseTimeMs": 142,
      "signature": "t=1735752400,v1=<hex>",
      "responseBody": "{\"ok\":true}",
      "error": null,
      "deliveredAt": "2025-09-01T00:10:05.123Z",
      "createdAt": "2025-09-01T00:10:05.123Z",
      "updatedAt": "2025-09-01T00:10:05.123Z"
    }
  ],
  "meta": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 }
}`}</code></pre>
            </section>

            <Separator />

            <section className="space-y-2">
              <h4 className="font-semibold">Notes</h4>
              <ul className="list-disc pl-6 text-sm">
                <li>Delivery uses BullMQ with retry + exponential backoff.</li>
                <li>Webhook caches are stored in Redis HMAP keyed by customer and event for fast lookup.</li>
                <li>Secrets are generated using 32 random bytes (base64url) and should be stored securely by the receiver.</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
