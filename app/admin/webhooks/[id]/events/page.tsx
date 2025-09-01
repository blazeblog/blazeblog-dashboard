"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useClientApi, type WebhookDeliveryAttempt } from "@/lib/client-api"
import { Skeleton } from "@/components/ui/skeleton"
import { usePageTitle } from "@/hooks/use-page-title"

export default function WebhookEventsPage() {
  usePageTitle("Webhook Events - BlazeBlog Admin")

  const api = useClientApi()
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const webhookId = Number(params.id)

  const rawPage = searchParams.get('page')
  const rawLimit = searchParams.get('limit')
  const page = useMemo(() => {
    const n = Math.floor(Number(rawPage ?? 1))
    return Number.isFinite(n) && n >= 1 ? n : 1
  }, [rawPage])
  const limit = useMemo(() => {
    const n = Math.floor(Number(rawLimit ?? 10))
    return Number.isFinite(n) && n >= 1 ? n : 10
  }, [rawLimit])

  const [items, setItems] = useState<WebhookDeliveryAttempt[]>([])
  const [total, setTotal] = useState(0)
  const [successRate, setSuccessRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])
  const successPercent = useMemo(() => {
    if (typeof successRate !== 'number') return null
    const raw = successRate <= 1 ? successRate * 100 : successRate
    return Math.max(0, Math.min(100, Math.round(raw)))
  }, [successRate])

  // Normalize URL query if invalid to avoid confusion
  useEffect(() => {
    const expectedPage = String(page)
    const expectedLimit = String(limit)
    const currentPage = rawPage ?? '1'
    const currentLimit = rawLimit ?? '10'
    if (currentPage !== expectedPage || currentLimit !== expectedLimit) {
      const sp = new URLSearchParams(searchParams.toString())
      sp.set('page', expectedPage)
      sp.set('limit', expectedLimit)
      router.replace(`?${sp.toString()}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  useEffect(() => {
    let done = false
    const run = async () => {
      try {
        setLoading(true)
        // Wait until URL reflects normalized values to avoid double fetch
        if ((rawPage ?? '1') !== String(page) || (rawLimit ?? '10') !== String(limit)) {
          setLoading(false)
          return
        }
        const res = await api.webhooks.listEvents(webhookId, { page, limit })
        if (done) return
        setItems(res.data)
        const totalFromPagination = (res as any)?.pagination?.total
        const totalFromMeta = (res as any)?.meta?.total
        setTotal(totalFromPagination ?? totalFromMeta ?? 0)
        const sr = (res as any)?.meta?.successRate ?? (res as any)?.pagination?.successRate
        if (typeof sr === 'number') setSuccessRate(sr)
      } catch (e: any) {
        if (!done) setError(e?.message || "Failed to load events")
      } finally {
        if (!done) setLoading(false)
      }
    }
    if (!isNaN(webhookId)) run()
    return () => { done = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webhookId, page, limit, rawPage, rawLimit])

  const setPage = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString())
    const nextPage = Math.max(1, Math.floor(p))
    const nextLimit = Math.max(1, Math.floor(limit))
    sp.set('page', String(nextPage))
    sp.set('limit', String(nextLimit))
    router.push(`?${sp.toString()}`)
  }

  return (
    <AdminLayout title="Webhook Events">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Delivery Attempts</h1>
            <p className="text-sm text-muted-foreground">Recent events for webhook #{webhookId}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/admin/webhooks/${webhookId}`}>Back to Webhook</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>Paginated list of delivery attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Badge variant="secondary">Last 7 days</Badge>
              <div className="text-sm text-muted-foreground">Total attempts: <span className="font-medium text-foreground">{total}</span></div>
              {successPercent !== null && (
                <div className="flex items-center gap-3">
                  <div className="text-sm">Success: <span className="font-medium">{successPercent}%</span></div>
                  <div className="w-40">
                    <Progress value={successPercent} />
                  </div>
                </div>
              )}
            </div>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-3 items-center">
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4 col-span-2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-muted-foreground">No events yet.</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attempt</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Signature</TableHead>
                      <TableHead>Delivered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="text-xs">{e.event}</Badge>
                        </TableCell>
                        <TableCell>
                          {e.httpStatus ? (
                            <span className="text-sm">{e.httpStatus}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{e.attempt}</TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">{e.responseTimeMs ?? "—"} ms</div>
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate text-xs">{e.signature || "—"}</TableCell>
                        <TableCell className="text-sm">{e.deliveredAt ? new Date(e.deliveredAt).toLocaleString() : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
