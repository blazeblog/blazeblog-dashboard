"use client"

import { useState, useEffect } from "react"
import { useClientApi } from "@/lib/client-api"
import type { NotionIntegration, NotionConnection } from "@/lib/client-api"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { NotionWizard } from "@/components/notion-wizard"
import { NotionDashboard } from "@/components/notion-dashboard"

export default function NotionIntegrationPage() {
  const api = useClientApi()
  const { toast } = useToast()
  
  const [integrations, setIntegrations] = useState<NotionIntegration[]>([])
  const [currentIntegration, setCurrentIntegration] = useState<NotionIntegration | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    setLoading(true)
    try {
      const response = await api.notion.getIntegrations()
      
      // Transform API response to match frontend types
      const transformedIntegrations: NotionIntegration[] = response.map(integration => ({
        id: integration.id.toString(),
        name: integration.integration_partial 
          ? integration.workspace_info?.name || integration.database_title
          : integration.database_title,
        databaseId: integration.database_id,
        databaseTitle: integration.database_title,
        isActive: integration.status === 'active',
        lastSyncAt: integration.last_sync_at || undefined,
        notionToken: '', // Don't expose token on frontend
        customerId: integration.customer_id,
        createdAt: integration.created_at,
        updatedAt: integration.updated_at,
        fieldMappings: integration.field_mappings,
        syncConfig: {
          enabled: integration.sync_config.enabled,
          intervalMinutes: integration.sync_config.interval_minutes,
          autoPublish: integration.sync_config.auto_publish,
          draftStatusProperty: integration.sync_config.draft_status_property,
          draftStatusValue: integration.sync_config.draft_status_value,
          publishedStatusValue: integration.sync_config.published_status_value,
        },
        // Add partial integration info
        isPartial: integration.integration_partial || false,
        workspaceInfo: integration.workspace_info,
        expiresAt: integration.expires_at,
      }))
      
      setIntegrations(transformedIntegrations)
      
      // Check if there's a partial integration to resume
      const partialIntegration = transformedIntegrations.find(i => i.isPartial)
      if (partialIntegration) {
        setCurrentIntegration(partialIntegration)
        setShowWizard(true) // Show wizard to complete the setup
      } else {
        const activeIntegration = transformedIntegrations[0] || null
        setCurrentIntegration(activeIntegration)
        
        // Pass the full integration data to avoid extra API calls
        if (activeIntegration && response[0]) {
          activeIntegration.fullIntegrationData = response[0]
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load Notion integrations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWizardComplete = async (connection: NotionConnection) => {
    try {
      setLoading(true)
      
      // Validate required data
      if (!connection.databaseId || !connection.fieldMappings || connection.fieldMappings.length === 0) {
        toast({
          title: "Incomplete Setup",
          description: "Please ensure you've selected a database and configured field mappings.",
          variant: "destructive",
        })
        return
      }
      
      // Create integration via API (backend handles token from temp storage)
      const integrationData = {
        database_id: connection.databaseId,
        database_title: connection.workspaceName || 'Notion Integration',
        field_mappings: connection.fieldMappings.reduce((acc, mapping) => {
          acc[mapping.blazeblogField] = mapping.notionPropertyName
          return acc
        }, {} as Record<string, string>),
        sync_config: {
          enabled: connection.syncSettings?.autoSync || true,
          interval_minutes: connection.syncSettings?.syncInterval || 60,
          auto_publish: false,
          draft_status_property: 'Status',
          draft_status_value: 'Draft',
          published_status_value: 'Published'
        }
      }
      
      const response = await api.notion.createIntegration(integrationData)
      
      // Transform and add to state
      const newIntegration: NotionIntegration = {
        id: response.id.toString(),
        name: response.database_title,
        databaseId: response.database_id,
        databaseTitle: response.database_title,
        isActive: response.status === 'active',
        lastSyncAt: response.last_sync_at || undefined,
        notionToken: '',
        customerId: response.customer_id,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        fieldMappings: response.field_mappings,
        syncConfig: {
          enabled: response.sync_config.enabled,
          intervalMinutes: response.sync_config.interval_minutes,
          autoPublish: response.sync_config.auto_publish,
          draftStatusProperty: response.sync_config.draft_status_property,
          draftStatusValue: response.sync_config.draft_status_value,
          publishedStatusValue: response.sync_config.published_status_value,
        },
      }

      setIntegrations(prev => [...prev, newIntegration])
      setCurrentIntegration(newIntegration)
      setShowWizard(false)
      
      toast({
        title: "Success",
        description: "Notion integration created successfully!",
        duration: 3000
      })
    } catch (error) {
      console.error('Failed to create integration:', error)
      toast({
        title: "Error",
        description: "Failed to create Notion integration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!currentIntegration) return
    
    try {
      await api.notion.deleteIntegration(Number(currentIntegration.id))
      
      setIntegrations(integrations.filter(i => i.id !== currentIntegration.id))
      setCurrentIntegration(null)
      setShowWizard(true)
      
      toast({
        title: "Disconnected",
        description: "Notion integration has been disconnected.",
      })
    } catch (error) {
      console.error('Failed to disconnect integration:', error)
      toast({
        title: "Error",
        description: "Failed to disconnect Notion integration",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Notion Integration">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading integrations...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (integrations.length === 0 || showWizard) {
    const partialIntegration = currentIntegration?.isPartial ? currentIntegration : null
    
    return (
      <AdminLayout title="Notion Integration">
        <div className="space-y-6">
          <div>
            <p className="text-muted-foreground">
              {partialIntegration 
                ? "Complete your Notion integration setup" 
                : "Connect your Notion workspace to sync posts automatically"
              }
            </p>
          </div>
          
          {partialIntegration && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Resume Your Setup</h3>
                  <p className="text-sm text-blue-700">
                    You've already connected to <strong>{partialIntegration.workspaceInfo?.name}</strong>. 
                    Complete your integration by selecting a database and configuring field mappings.
                  </p>
                  {partialIntegration.expiresAt && (
                    <p className="text-xs text-blue-600 mt-1">
                      Session expires: {new Date(partialIntegration.expiresAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <NotionWizard 
            onComplete={handleWizardComplete}
            onCancel={() => setShowWizard(false)}
            existingConnection={partialIntegration ? {
              id: partialIntegration.id,
              token: '', // Never store tokens on frontend
              workspaceName: partialIntegration.workspaceInfo?.name || partialIntegration.name,
              databaseId: partialIntegration.databaseId !== 'pending' ? partialIntegration.databaseId : null,
              createdAt: new Date(partialIntegration.createdAt),
              updatedAt: new Date(partialIntegration.updatedAt),
            } : undefined}
            isResumingPartial={!!partialIntegration}
          />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Notion Integration">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Manage your Notion sync settings and view sync status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Connected
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowWizard(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Reconfigure
            </Button>
          </div>
        </div>

        {currentIntegration && (
          <NotionDashboard
            connection={{
              id: currentIntegration.id,
              token: currentIntegration.notionToken,
              workspaceName: currentIntegration.name,
              databaseId: currentIntegration.databaseId,
              databaseTitle: currentIntegration.databaseTitle,
              createdAt: new Date(currentIntegration.createdAt),
              updatedAt: new Date(currentIntegration.updatedAt),
              fullIntegrationData: currentIntegration.fullIntegrationData
            }}
            onDisconnect={handleDisconnect}
          />
        )}
      </div>
    </AdminLayout>
  )
}