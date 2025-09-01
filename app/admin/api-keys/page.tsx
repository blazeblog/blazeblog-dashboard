"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useClientApi } from "@/lib/client-api"
import { usePageTitle } from "@/hooks/use-page-title"
import type { ApiKey } from "@/lib/client-api"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Key, Plus, MoreHorizontal, Trash2, Copy, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function ApiKeysPage() {
  usePageTitle("API Keys - BlazeBlog Admin")
  
  const router = useRouter()
  const { toast } = useToast()
  const api = useClientApi()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingKey, setDeletingKey] = useState<number | null>(null)

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get<{ message: string; data: ApiKey[] }>('/customer/api-keys')
      setApiKeys(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const handleCreateNew = () => {
    router.push('/admin/api-keys/create')
  }

  const handleCopyKey = async (prefix: string) => {
    try {
      await navigator.clipboard.writeText(`${prefix}***`)
      toast({
        title: "Copied",
        description: "API key prefix copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy API key to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleDeleteKey = async (keyId: number) => {
    try {
      setDeletingKey(keyId)
      await api.delete(`/customer/api/v1/api-keys/${keyId}`)
      setApiKeys(prev => prev.filter(key => key.id !== keyId))
      toast({
        title: "Success",
        description: "API key deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete API key',
        variant: "destructive",
      })
    } finally {
      setDeletingKey(null)
    }
  }

  const isKeyExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const getKeyStatus = (key: ApiKey) => {
    if (!key.isActive) return { label: "Inactive", variant: "secondary" as const }
    if (isKeyExpired(key.expiresAt)) return { label: "Expired", variant: "destructive" as const }
    return { label: "Active", variant: "default" as const }
  }

  return (
    <AdminLayout title="API Keys">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">Manage your API keys for programmatic access</p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : apiKeys.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
              <Key className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : apiKeys.filter(key => key.isActive && !isKeyExpired(key.expiresAt)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month Usage</CardTitle>
              <Key className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : apiKeys.reduce((sum, key) => sum + (key.usageCount || 0), 0)}
              </div>
            </CardContent>
          </Card>
                <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <Key className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : apiKeys.reduce((sum, key) => sum + (key.usageCount || 0) + (key.usageCountTotal || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Security Notice</p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Keep your API keys secure. Never expose them in client-side code or version control.
                  API keys provide full access to your account - treat them like passwords.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Table */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys ({apiKeys.length})</CardTitle>
            <CardDescription>
              Manage your API keys for programmatic access to your blog. 
              Usage updates every 2 hours, resets 1st of month 12PM UTC.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                // Loading skeleton
                <div className="space-y-3">
                  <div className="flex space-x-4 py-2 border-b">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  ))}
                </div>
              ) : apiKeys.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => {
                      const status = getKeyStatus(key)
                      return (
                        <TableRow key={key.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Key className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{key.keyName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{(key.usageCount || 0).toLocaleString()} calls</div>
                              <div className="text-muted-foreground text-xs">
                                Limit: {key.rateLimitDaily || 0}/day, {key.rateLimitPerMinute || 0}/min
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {key.lastUsedAt ? (
                              <div className="text-sm">
                                {new Date(key.lastUsedAt).toLocaleDateString()}
                                <div className="text-muted-foreground text-xs">
                                  {new Date(key.lastUsedAt).toLocaleTimeString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {key.expiresAt ? (
                              <div className="text-sm">
                                {new Date(key.expiresAt).toLocaleDateString()}
                                {isKeyExpired(key.expiresAt) && (
                                  <div className="text-destructive text-xs">Expired</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleCopyKey(key.prefix)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Key
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete the API key "{key.keyName}"? 
                                        This action cannot be undone and will immediately revoke access.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteKey(key.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        disabled={deletingKey === key.id}
                                      >
                                        {deletingKey === key.id ? 'Deleting...' : 'Delete'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 space-y-4">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">No API Keys</h3>
                    <p className="text-muted-foreground">Create your first API key to get started with programmatic access.</p>
                  </div>
                  <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create API Key
                  </Button>
                </div>
              )}

              {!loading && error && (
                <div className="text-center p-8 space-y-4">
                  <div className="text-destructive">
                    <p className="font-medium">Error loading API keys</p>
                    <p className="text-sm">{error}</p>
                  </div>
                  <Button onClick={fetchApiKeys} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}