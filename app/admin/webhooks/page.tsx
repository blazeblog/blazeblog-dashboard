"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useClientApi, type Webhook } from "@/lib/client-api"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { usePageTitle } from "@/hooks/use-page-title"

export default function WebhooksListPage() {
  usePageTitle("Webhooks - BlazeBlog Admin")

  const api = useClientApi()
  const router = useRouter()
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Prevent duplicate fetches (e.g., React strict mode dev re-renders)
  useEffect(() => {
    let done = false
    const run = async () => {
      try {
        setLoading(true)
        const list = await api.webhooks.list()
        if (!done) setWebhooks(list)
      } catch (e: any) {
        if (!done) setError(e?.message || "Failed to load webhooks")
      } finally {
        if (!done) setLoading(false)
      }
    }
    run()
    return () => { done = true }
    // Intentionally omit `api` to avoid unstable dependency retriggers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this webhook? This cannot be undone.")) return
    try {
      await api.webhooks.delete(id)
      setWebhooks(prev => prev.filter(w => w.id !== id))
    } catch (e: any) {
      alert(e?.message || "Failed to delete webhook")
    }
  }

  return (
    <AdminLayout title="Webhooks">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">Manage webhook endpoints and inspect deliveries</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/webhooks/docs">Docs</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/webhooks/create">Create Webhook</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Webhooks</CardTitle>
            <CardDescription>Existing webhook receivers for your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-3 items-center">
                      <Skeleton className="h-4 col-span-2" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-8" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : webhooks.length === 0 ? (
              <div className="text-sm text-muted-foreground">No webhooks yet. Create one to get started.</div>
            ) : (
              <div className="overflow-x-auto">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[36%]">URL</TableHead>
                    <TableHead className="w-[24%]">Events</TableHead>
                    <TableHead className="w-[10%]">Status</TableHead>
                    <TableHead className="w-[20%]">Description</TableHead>
                    <TableHead className="w-[10%]">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map(w => (
                    <TableRow
                      key={w.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/admin/webhooks/${w.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          router.push(`/admin/webhooks/${w.id}`)
                        }
                      }}
                    >
                      <TableCell className="font-medium max-w-[360px] truncate" title={w.url}>{w.url}</TableCell>
                      <TableCell className="max-w-[280px]">
                        <div className="flex flex-wrap gap-1 overflow-hidden">
                          {w.events.map(ev => (
                            <Badge key={ev} variant="outline" className="text-xs">
                              {ev}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={w.isActive ? "secondary" : "outline"} className="text-xs">
                          {w.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate" title={w.description || undefined}>{w.description || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(w.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={`/admin/webhooks/${w.id}/events`}>Events</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleDelete(w.id) }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />
      </div>
    </AdminLayout>
  )
}
