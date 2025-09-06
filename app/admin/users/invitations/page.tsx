"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useClientApi, type Invitation } from "@/lib/client-api"

export default function InvitationsPage() {
  const api = useClientApi()

  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [invLoading, setInvLoading] = useState(false)
  const [invError, setInvError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteExpiresInDays, setInviteExpiresInDays] = useState<number>(7)
  const [inviteStatusFilter, setInviteStatusFilter] = useState<'pending' | 'accepted' | 'revoked' | 'expired' | undefined>('pending')

  const fetchInvitations = async () => {
    try {
      setInvLoading(true)
      setInvError(null)
      const data = await api.invitations.list({ status: inviteStatusFilter })
      setInvitations(data)
    } catch (err) {
      setInvError(err instanceof Error ? err.message : 'Failed to fetch invitations')
    } finally {
      setInvLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteStatusFilter])

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return
    try {
      setInvError(null)
      setInvLoading(true)
      await api.invitations.create({ email: inviteEmail.trim(), expiresInDays: inviteExpiresInDays })
      setInviteEmail("")
      await fetchInvitations()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create invitation'
      setInvError(message)
      alert(message)
    } finally {
      setInvLoading(false)
    }
  }

  const handleRevokeInvitation = async (inv: Invitation) => {
    if (!confirm(`Revoke invitation for ${inv.email}?`)) return
    try {
      setInvError(null)
      setInvLoading(true)
      await api.invitations.revoke(inv.id)
      await fetchInvitations()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to revoke invitation'
      setInvError(message)
      alert(message)
    } finally {
      setInvLoading(false)
    }
  }

  return (
    <AdminLayout title="Invitations">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">Create, track, and revoke pending invitations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send Invitation</CardTitle>
            <CardDescription>We’ll email the recipient a secure join link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreateInvitation} className="grid gap-3 md:grid-cols-4 items-end">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Expires In (days)</label>
                <Select value={String(inviteExpiresInDays)} onValueChange={(v) => setInviteExpiresInDays(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Expiry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button type="submit" disabled={invLoading || !inviteEmail} className="w-full">Send Invite</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
            <CardDescription>Track status and revoke pending invitations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {invLoading ? 'Loading invitations…' : `${invitations.length} invitation${invitations.length === 1 ? '' : 's'}`}
              </div>
              <Select value={inviteStatusFilter || 'pending'} onValueChange={(v) => setInviteStatusFilter(v as any)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {invError && (
              <div className="text-sm text-destructive">{invError}</div>
            )}

            <div className="space-y-2">
              {invLoading && invitations.length === 0 ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                      <Skeleton className="h-4 w-48" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  ))}
                </>
              ) : invitations.length === 0 ? (
                <div className="text-sm text-muted-foreground">No invitations found.</div>
              ) : (
                invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{inv.email}</div>
                      <Badge variant="outline" className="capitalize">{inv.status}</Badge>
                      <div className="text-sm text-muted-foreground">Expires {new Date(inv.expiresAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {inv.status === 'pending' && (
                        <Button variant="outline" size="sm" onClick={() => handleRevokeInvitation(inv)}>Revoke</Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

