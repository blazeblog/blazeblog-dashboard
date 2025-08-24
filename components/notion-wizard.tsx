"use client"

import { useState, useEffect } from "react"
import { useClientApi } from "@/lib/client-api"
import type { 
  NotionConnection, 
  NotionDatabase, 
  NotionFieldMapping,
  NotionSyncSettings 
} from "@/lib/client-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  ExternalLink, 
  Loader2,
  Database,
  Settings,
  Clock
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { NotionConnectionStep } from "@/components/notion-connection-step"
import { NotionDatabaseStep } from "@/components/notion-database-step"
import { NotionMappingStep } from "@/components/notion-mapping-step"
import { NotionSyncStep } from "@/components/notion-sync-step"

interface NotionWizardProps {
  onComplete: (connection: NotionConnection) => void
  onCancel: () => void
  existingConnection?: NotionConnection | null
  isResumingPartial?: boolean
}

type WizardStep = 'connect' | 'database' | 'mapping' | 'sync'

const STEPS: { key: WizardStep; title: string; description: string; icon: any }[] = [
  {
    key: 'connect',
    title: 'Connect Notion',
    description: 'Authenticate with your Notion workspace',
    icon: ExternalLink,
  },
  {
    key: 'database',
    title: 'Choose Database',
    description: 'Select the database to sync from',
    icon: Database,
  },
  {
    key: 'mapping',
    title: 'Field Mapping',
    description: 'Map Notion properties to Blazeblog fields',
    icon: Settings,
  },
  {
    key: 'sync',
    title: 'Sync Settings',
    description: 'Configure sync preferences',
    icon: Clock,
  },
]

export function NotionWizard({ onComplete, onCancel, existingConnection, isResumingPartial }: NotionWizardProps) {
  const api = useClientApi()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('connect')
  const [loading, setLoading] = useState(false)
  const [connection, setConnection] = useState<NotionConnection | null>(existingConnection || null)
  const [selectedDatabase, setSelectedDatabase] = useState<NotionDatabase | null>(null)
  const [databases, setDatabases] = useState<NotionDatabase[]>([])
  const [fieldMappings, setFieldMappings] = useState<NotionFieldMapping[]>([])
  const [syncSettings, setSyncSettings] = useState<NotionSyncSettings | null>(null)
  const [tempToken, setTempToken] = useState<string>('')

  const handleTokenValidated = (token: string, workspaceName?: string) => {
    const newConnection: NotionConnection = {
      id: connection?.id || `temp-${Date.now()}`,
      token: '', // Never store the actual token for security
      workspaceName: workspaceName,
      databaseId: null,
      fieldMappings: [],
      syncSettings: null,
      createdAt: connection?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    setConnection(newConnection);
    
    // Store the token temporarily only for database fetching
    setTempToken(token);
  };

  // Skip to appropriate step if we already have a connection
  useEffect(() => {
    if (existingConnection) {
      if (existingConnection.databaseId) {
        setCurrentStep('mapping')
      } else {
        // For any existing connection without database, start from connect step
        // This covers both partial integrations and regular flow
        setCurrentStep('connect')
      }
    }
  }, [existingConnection])

  const getCurrentStepIndex = () => {
    return STEPS.findIndex(step => step.key === currentStep)
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 'connect':
        return !!connection
      case 'database':
        return !!selectedDatabase
      case 'mapping':
        return fieldMappings.length > 0
      case 'sync':
        return !!syncSettings
      default:
        return false
    }
  }

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].key)
    }
  }

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].key)
    }
  }

  const handleComplete = async () => {
    if (!connection) return
    
    setLoading(true)
    try {
      // Ensure all settings are saved and create final connection object
      if (syncSettings && fieldMappings.length > 0 && selectedDatabase) {
        const finalConnection: NotionConnection = {
          ...connection,
          databaseId: selectedDatabase.id,
          workspaceName: selectedDatabase.title, // Use database title as workspace name
          fieldMappings: fieldMappings,
          syncSettings: syncSettings,
          updatedAt: new Date(),
        }
        onComplete(finalConnection)
        
        // Clear sensitive data
        setTempToken('')
      }
    } catch (error) {
      console.error('Failed to complete setup:', error)
      toast({
        title: "Error",
        description: "Failed to complete Notion integration setup",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'connect':
        return (
          <NotionConnectionStep
            onTokenValidated={handleTokenValidated}
            loading={loading}
            setLoading={setLoading}
            existingWorkspaceName={existingConnection?.workspaceName || undefined}
          />
        )
      case 'database':
        return (
          <NotionDatabaseStep
            notionToken={tempToken}
            selectedDatabase={selectedDatabase}
            databases={databases}
            onDatabaseSelect={setSelectedDatabase}
            onDatabasesLoad={setDatabases}
            loading={loading}
            setLoading={setLoading}
            isResumingPartial={isResumingPartial}
          />
        )
      case 'mapping':
        return (
          <NotionMappingStep
            connection={connection}
            selectedDatabase={selectedDatabase}
            fieldMappings={fieldMappings}
            onMappingsChange={setFieldMappings}
            loading={loading}
            setLoading={setLoading}
            tempToken={tempToken}
          />
        )
      case 'sync':
        return (
          <NotionSyncStep
            connection={connection}
            syncSettings={syncSettings}
            onSettingsChange={setSyncSettings}
            loading={loading}
            setLoading={setLoading}
          />
        )
      default:
        return null
    }
  }

  const progressPercentage = ((getCurrentStepIndex() + 1) / STEPS.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Notion Integration Setup</CardTitle>
              <CardDescription>
                Follow these steps to connect your Notion workspace
              </CardDescription>
            </div>
            <Badge variant="outline">
              Step {getCurrentStepIndex() + 1} of {STEPS.length}
            </Badge>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
          
          <div className="flex items-center justify-between mt-4">
            {STEPS.map((step, index) => {
              const isActive = step.key === currentStep
              const isCompleted = index < getCurrentStepIndex()
              const Icon = step.icon
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-100 border-green-500 text-green-700' 
                      : isActive 
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-4 hidden sm:block" />
                  )}
                </div>
              )
            })}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>
          
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              {getCurrentStepIndex() > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {currentStep === 'sync' ? (
                <Button
                  onClick={handleComplete}
                  disabled={!canGoNext() || loading}
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Complete Setup
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext() || loading}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}