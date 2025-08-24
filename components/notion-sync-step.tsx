"use client"

import { useState, useEffect } from "react"
import { useClientApi } from "@/lib/client-api"
import type { NotionConnection, NotionSyncSettings } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Loader2,
  CheckCircle,
  Play,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NotionSyncStepProps {
  connection: NotionConnection | null
  syncSettings: NotionSyncSettings | null
  onSettingsChange: (settings: NotionSyncSettings) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

const SYNC_INTERVALS = [
  { value: 15, label: "Every 15 minutes" },
  { value: 30, label: "Every 30 minutes" },
  { value: 60, label: "Every hour" },
  { value: 120, label: "Every 2 hours" },
  { value: 240, label: "Every 4 hours" },
  { value: 480, label: "Every 8 hours" },
  { value: 1440, label: "Daily" },
]

export function NotionSyncStep({ 
  connection,
  syncSettings, 
  onSettingsChange,
  loading, 
  setLoading 
}: NotionSyncStepProps) {
  const api = useClientApi()
  const { toast } = useToast()
  
  const [autoSync, setAutoSync] = useState(true)
  const [syncInterval, setSyncInterval] = useState(15)
  const [hasChanges, setHasChanges] = useState(false)
  const [testSyncing, setTestSyncing] = useState(false)

  useEffect(() => {
    if (connection && !syncSettings) {
      loadSyncSettings()
    } else if (syncSettings) {
      setAutoSync(syncSettings.autoSync)
      setSyncInterval(syncSettings.syncInterval)
    }
  }, [connection, syncSettings])

  const loadSyncSettings = () => {
    if (!connection) return
    
    // Use existing settings or create default ones
    const existingSettings = connection.syncSettings
    if (existingSettings) {
      setAutoSync(existingSettings.autoSync)
      setSyncInterval(existingSettings.syncInterval)
      onSettingsChange(existingSettings)
    } else {
      const defaultSettings: NotionSyncSettings = {
        id: `settings-${Date.now()}`,
        connectionId: connection.id,
        autoSync: true,
        syncInterval: 60,
        isRunning: false
      }
      setAutoSync(defaultSettings.autoSync)
      setSyncInterval(defaultSettings.syncInterval)
      onSettingsChange(defaultSettings)
    }
  }

  const handleAutoSyncChange = (enabled: boolean) => {
    setAutoSync(enabled)
    setHasChanges(true)
  }

  const handleIntervalChange = (interval: string) => {
    setSyncInterval(Number(interval))
    setHasChanges(true)
  }

  const saveSettings = () => {
    if (!connection) return
    
    const updatedSettings: NotionSyncSettings = {
      id: syncSettings?.id || `settings-${Date.now()}`,
      connectionId: connection.id,
      autoSync,
      syncInterval,
      lastSyncAt: syncSettings?.lastSyncAt,
      nextSyncAt: autoSync ? new Date(Date.now() + syncInterval * 60 * 1000).toISOString() : undefined,
      isRunning: false
    }
    
    onSettingsChange(updatedSettings)
    setHasChanges(false)
    
    toast({
      title: "Settings saved",
      description: "Sync settings have been configured successfully",
    })
  }

  const triggerTestSync = () => {
    // This would trigger an actual sync via API in production
    // For now, just show a message
    toast({
      title: "Sync configured",
      description: "Sync settings are ready. Integration will sync according to your settings.",
    })
  }

  const getNextSyncTime = () => {
    if (!autoSync || !syncSettings?.lastSyncAt) return null
    
    const lastSync = new Date(syncSettings.lastSyncAt)
    const nextSync = new Date(lastSync.getTime() + syncInterval * 60 * 1000)
    
    return nextSync > new Date() ? nextSync : new Date()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!connection) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please complete the previous steps first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Sync Settings</h3>
        <p className="text-muted-foreground">
          Configure how often your Notion content should be synced to Blazeblog.
        </p>
      </div>

      <div className="space-y-6">
        {/* Auto Sync Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Automatic Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-sync" className="text-sm font-medium">
                  Enable automatic syncing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync content from Notion at regular intervals
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={handleAutoSyncChange}
              />
            </div>

            {autoSync && (
              <div className="space-y-3 border-t pt-4">
                <Label className="text-sm font-medium">Sync Interval</Label>
                <Select value={syncInterval.toString()} onValueChange={handleIntervalChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SYNC_INTERVALS.map((interval) => (
                      <SelectItem key={interval.value} value={interval.value.toString()}>
                        {interval.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {syncSettings?.lastSyncAt && (
                  <div className="text-sm text-muted-foreground">
                    <div>Last sync: {formatTime(new Date(syncSettings.lastSyncAt))}</div>
                    {getNextSyncTime() && (
                      <div>Next sync: {formatTime(getNextSyncTime()!)}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="h-5 w-5" />
              Manual Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Trigger a manual sync to immediately pull the latest content from Notion.
            </p>
            
            <Button 
              onClick={triggerTestSync} 
              disabled={testSyncing}
              variant="outline"
              className="w-full"
            >
              {testSyncing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Play className="h-4 w-4 mr-2" />
              Sync Now
            </Button>

            {syncSettings?.isRunning && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Sync is currently running. Please wait for it to complete.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Sync Status */}
        {syncSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sync Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Auto Sync:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant={autoSync ? "default" : "secondary"}>
                      {autoSync ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Interval:</span>
                  <div className="mt-1">
                    {SYNC_INTERVALS.find(i => i.value === syncInterval)?.label || `${syncInterval} minutes`}
                  </div>
                </div>
              </div>

              {syncSettings.lastSyncAt && (
                <div className="border-t pt-3">
                  <span className="text-muted-foreground text-sm">Last successful sync:</span>
                  <div className="mt-1 text-sm">
                    {formatTime(new Date(syncSettings.lastSyncAt))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Important Notes */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Only published pages in your selected Notion database will be synced. 
            Make sure your content is properly formatted according to your field mappings.
          </AlertDescription>
        </Alert>
      </div>

      {hasChanges && (
        <div className="flex justify-center">
          <Button onClick={saveSettings} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
        </div>
      )}

      {syncSettings && !hasChanges && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Sync settings are configured and ready. Your Notion integration is now complete!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}