"use client"

import { useState, useEffect, useCallback } from "react"
import { useClientApi } from "@/lib/client-api"
import type { 
  NotionConnection, 
  NotionSyncSettings, 
  NotionSyncLog,
  NotionFieldMapping,
  PaginatedResponse
} from "@/lib/client-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  Clock,
  Database,
  Settings,
  Play,
  Loader2,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  TrendingUp,
  Calendar,
  FileText
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface NotionDashboardProps {
  connection: NotionConnection & { fullIntegrationData?: any }
  onDisconnect: () => void
}

export function NotionDashboard({ connection, onDisconnect }: NotionDashboardProps) {
  const api = useClientApi()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [syncSettings, setSyncSettings] = useState<NotionSyncSettings | null>(null)
  const [syncLogs, setSyncLogs] = useState<NotionSyncLog[]>([])
  const [fieldMappings, setFieldMappings] = useState<NotionFieldMapping[]>([])
  const [syncStatus, setSyncStatus] = useState<{ 
    isRunning: boolean; 
    lastSync?: string; 
    nextSync?: string; 
    fieldMappingsCount?: number;
    integrationStatus?: string;
    errorMessage?: string | null;
  } | null>(null)

  // Define fetchSyncStatus first
  const fetchSyncStatus = useCallback(async () => {
    // For now, maintain the current status
    // In production, this would check real sync status
    setSyncStatus(prev => prev || { isRunning: false })
  }, [])

  useEffect(() => {
    initializeDashboardData()
  }, [connection])

  // Separate effect for polling to avoid recreation
  useEffect(() => {
    const interval = setInterval(fetchSyncStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [fetchSyncStatus])

  const initializeDashboardData = () => {
    const connectionId = Number(connection.id)
    const integrationDetails = connection.fullIntegrationData
    
    if (integrationDetails) {
      // Transform sync logs for display
      const transformedLogs = integrationDetails.sync_logs?.slice(0, 5).map(log => ({
        id: log.id.toString(),
        integrationId: connectionId.toString(),
        status: log.status === 'completed' ? 'success' : log.status === 'partial' ? 'partial' : 'error',
        pagesProcessed: log.pages_processed,
        pagesCreated: log.pages_created,
        pagesUpdated: log.pages_updated,
        errors: log.error_message ? [log.error_message] : [],
        startedAt: log.started_at,
        completedAt: log.completed_at || log.started_at
      })) || []
      
      setSyncLogs(transformedLogs)
      
      // Convert field mappings object to count
      const fieldMappingsCount = integrationDetails.field_mappings 
        ? Object.keys(integrationDetails.field_mappings).length 
        : 0
      
      // Convert sync config to legacy format for components
      const legacySyncSettings = integrationDetails.sync_config ? {
        id: `settings-${connectionId}`,
        connectionId: connectionId.toString(),
        autoSync: integrationDetails.sync_config.enabled,
        syncInterval: integrationDetails.sync_config.interval_minutes,
        lastSyncAt: integrationDetails.last_sync_at || undefined,
        isRunning: false
      } : null
      
      setSyncSettings(legacySyncSettings)
      setFieldMappings([]) // We don't need the array format anymore, just the count
      setSyncStatus({ 
        isRunning: false,
        fieldMappingsCount: fieldMappingsCount,
        integrationStatus: integrationDetails.status,
        errorMessage: integrationDetails.error_message,
        lastSync: integrationDetails.last_sync_at
      })
    }
  }

  const handleManualSync = async () => {
    setSyncing(true)
    try {
      const connectionId = Number(connection.id)
      if (connectionId) {
        await api.notion.triggerSync(connectionId, { force_full_sync: false })
        toast({
          title: "Sync started",
          description: "Manual sync has been triggered",
        })
        
        // Refresh status after a short delay
        setTimeout(fetchSyncStatus, 2000)
      }
    } catch (error) {
      console.error('Failed to trigger sync:', error)
      toast({
        title: "Error",
        description: "Failed to trigger sync",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      const connectionId = Number(connection.id)
      if (connectionId) {
        await api.notion.deleteIntegration(connectionId)
      }
      onDisconnect()
      toast({
        title: "Disconnected",
        description: "Notion integration has been disconnected",
      })
    } catch (error) {
      console.error('Failed to disconnect:', error)
      toast({
        title: "Error",
        description: "Failed to disconnect Notion integration",
        variant: "destructive",
      })
      setDisconnecting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'partial': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {syncStatus?.integrationStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Integration Error:</strong> {syncStatus.errorMessage || 'There was an error with your integration. Please check your sync logs for more details.'}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Connection Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connected Database</p>
                <p className="font-semibold">{connection.databaseTitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Field Mappings</p>
                <p className="font-semibold">{syncStatus?.fieldMappingsCount || 0} configured</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auto Sync</p>
                <div className="flex items-center gap-2">
                  <Badge variant={syncSettings?.autoSync ? "default" : "secondary"}>
                    {syncSettings?.autoSync ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status & Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Sync Status
              </CardTitle>
              <CardDescription>
                Monitor and control your Notion synchronization
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {syncStatus?.isRunning ? (
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Syncing...
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Ready
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Last Sync</p>
                <p className="text-sm text-muted-foreground">
                  {syncStatus?.lastSync 
                    ? formatDate(syncStatus.lastSync)
                    : "Never synced"
                  }
                </p>
              </div>
              {syncSettings?.autoSync && syncStatus?.nextSync && (
                <div>
                  <p className="text-sm font-medium mb-1">Next Sync</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(syncStatus.nextSync)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end">
              <Button 
                onClick={handleManualSync}
                disabled={syncing || syncStatus?.isRunning}
                className="w-full md:w-auto"
              >
                {(syncing || syncStatus?.isRunning) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Play className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sync History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Sync History
          </CardTitle>
          <CardDescription>
            View the latest synchronization results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No sync history yet</p>
              <p className="text-sm">Trigger a sync to see results here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                    <div className="text-sm">
                      <div className="flex items-center gap-4">
                        <span>{log.pagesProcessed} processed</span>
                        <span>{log.pagesCreated} created</span>
                        <span>{log.pagesUpdated} updated</span>
                      </div>
                      {log.errors && log.errors.length > 0 && (
                        <div className="text-red-600 mt-1">
                          {log.errors.length} error(s)
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(log.startedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Manage your Notion integration settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full" asChild>
              <a 
                href={`https://notion.so/${connection.databaseId}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Notion
              </a>
            </Button>
            
            <Button variant="outline" className="w-full" asChild>
              <a href={`/admin/notion/synced-pages?id=${connection.id}`}>
                <FileText className="h-4 w-4 mr-2" />
                View Synced Pages
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          <div className="border-t pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={disconnecting}
                >
                  {disconnecting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Trash2 className="h-4 w-4 mr-2" />
                  Disconnect Notion
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Notion Integration</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to disconnect your Notion integration? 
                    This will stop all future syncs, but your existing posts will remain unchanged.
                    You can reconnect at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDisconnect}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Connection Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Connected:</span>
              <div>{formatDate(connection.createdAt)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Active
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}