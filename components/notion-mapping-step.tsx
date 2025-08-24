"use client"

import { useState, useEffect } from "react"
import { useClientApi } from "@/lib/client-api"
import type { 
  NotionConnection, 
  NotionDatabase, 
  NotionFieldMapping 
} from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NotionMappingStepProps {
  connection: NotionConnection | null
  selectedDatabase: NotionDatabase | null
  fieldMappings: NotionFieldMapping[]
  onMappingsChange: (mappings: NotionFieldMapping[]) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  tempToken?: string
}

type BlazeblogField = {
  key: string
  label: string
  description: string
  required: boolean
  acceptedTypes: string[]
}

const BLAZEBLOG_FIELDS: BlazeblogField[] = [
  {
    key: 'title',
    label: 'Post Title',
    description: 'The main title of the blog post',
    required: true,
    acceptedTypes: ['title', 'rich_text']
  },
  {
    key: 'content',
    label: 'Post Content',
    description: 'The main body/content of the post',
    required: true,
    acceptedTypes: ['rich_text']
  },
  {
    key: 'excerpt',
    label: 'Post Excerpt',
    description: 'Short summary or description of the post',
    required: false,
    acceptedTypes: ['rich_text']
  },
  {
    key: 'status',
    label: 'Publish Status',
    description: 'Draft, published, or archived status',
    required: false,
    acceptedTypes: ['select', 'status', 'checkbox']
  },
  {
    key: 'categoryId',
    label: 'Category',
    description: 'The category this post belongs to',
    required: false,
    acceptedTypes: ['select', 'relation']
  },
  {
    key: 'tags',
    label: 'Tags',
    description: 'Tags or labels for the post',
    required: false,
    acceptedTypes: ['multi_select', 'relation']
  },
  {
    key: 'featuredImage',
    label: 'Featured Image',
    description: 'URL to the featured image',
    required: false,
    acceptedTypes: ['rich_text', 'title']
  },
  {
    key: 'publishedAt',
    label: 'Publish Date',
    description: 'When the post should be/was published',
    required: false,
    acceptedTypes: ['date']
  }
]

export function NotionMappingStep({ 
  connection,
  selectedDatabase, 
  fieldMappings,
  onMappingsChange,
  loading, 
  setLoading,
  tempToken 
}: NotionMappingStepProps) {
  const api = useClientApi()
  const { toast } = useToast()
  
  const [mappings, setMappings] = useState<NotionFieldMapping[]>(fieldMappings)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (fieldMappings.length === 0 && connection && selectedDatabase) {
      // Initialize with existing mappings or create empty ones
      loadExistingMappings()
    }
  }, [connection, selectedDatabase, fieldMappings.length])

  const loadExistingMappings = () => {
    // Initialize with existing field mappings or empty array
    const existingMappings = connection?.fieldMappings || []
    setMappings(existingMappings)
    onMappingsChange(existingMappings)
  }

  const handleMappingChange = (blazeblogField: string, notionPropertyId: string) => {
    if (!connection || !selectedDatabase) return
    
    const notionProperty = Object.entries(selectedDatabase.properties || {})
      .find(([name, prop]) => prop.id === notionPropertyId)
    if (!notionProperty && notionPropertyId !== 'none') return

    const newMappings = mappings.filter(m => m.blazeblogField !== blazeblogField)
    
    if (notionPropertyId !== 'none' && notionProperty) {
      const [propertyName, property] = notionProperty
      const blazeblogFieldInfo = BLAZEBLOG_FIELDS.find(f => f.key === blazeblogField)
      if (!blazeblogFieldInfo) return

      const newMapping: NotionFieldMapping = {
        id: `mapping-${Date.now()}`,
        connectionId: connection.id,
        notionPropertyId,
        notionPropertyName: propertyName,
        blazeblogField: blazeblogField as any,
        blazeblogFieldLabel: blazeblogFieldInfo.label,
        createdAt: new Date().toISOString()
      }
      
      newMappings.push(newMapping)
    }
    
    setMappings(newMappings)
    setHasChanges(true)
  }

  const saveMappings = () => {
    if (!connection) return
    
    onMappingsChange(mappings)
    setHasChanges(false)
    
    toast({
      title: "Mappings saved",
      description: "Field mappings have been configured successfully",
    })
  }

  const getMappingForField = (blazeblogField: string) => {
    return mappings.find(m => m.blazeblogField === blazeblogField)
  }

  const isPropertyMapped = (notionPropertyId: string) => {
    return mappings.some(m => m.notionPropertyId === notionPropertyId)
  }

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'title': return 'bg-blue-100 text-blue-800'
      case 'rich_text': return 'bg-green-100 text-green-800'
      case 'select': return 'bg-purple-100 text-purple-800'
      case 'multi_select': return 'bg-purple-100 text-purple-800'
      case 'date': return 'bg-orange-100 text-orange-800'
      case 'checkbox': return 'bg-gray-100 text-gray-800'
      case 'number': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCompatibleProperties = (blazeblogField: BlazeblogField) => {
    if (!selectedDatabase) return []
    
    return Object.entries(selectedDatabase.properties || {})
      .filter(([name, prop]) => blazeblogField.acceptedTypes.includes(prop.type))
      .map(([name, prop]) => ({ ...prop, name }))
  }

  const requiredMappingsCount = BLAZEBLOG_FIELDS.filter(f => f.required).length
  const requiredMappingsMapped = BLAZEBLOG_FIELDS.filter(f => 
    f.required && getMappingForField(f.key)
  ).length

  if (!connection || !selectedDatabase) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please select a database first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Field Mapping</h3>
        <p className="text-muted-foreground">
          Map Notion properties to Blazeblog fields to sync your content correctly.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Database: <strong>{selectedDatabase.title}</strong>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Required mappings: </span>
          <span className={requiredMappingsMapped === requiredMappingsCount ? 'text-green-600' : 'text-orange-600'}>
            {requiredMappingsMapped}/{requiredMappingsCount}
          </span>
        </div>
      </div>

      {requiredMappingsMapped < requiredMappingsCount && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please map all required fields (Title and Content) to continue.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {BLAZEBLOG_FIELDS.map((field) => {
          const currentMapping = getMappingForField(field.key)
          const compatibleProperties = getCompatibleProperties(field)
          
          return (
            <Card key={field.key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{field.label}</span>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{field.description}</p>
                    <div className="flex gap-1 mt-2">
                      {field.acceptedTypes.map(type => (
                        <Badge 
                          key={type} 
                          variant="outline" 
                          className={`text-xs ${getPropertyTypeColor(type)}`}
                        >
                          {type.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                  <div className="flex-1">
                    <Select
                      value={currentMapping?.notionPropertyId || 'none'}
                      onValueChange={(value) => handleMappingChange(field.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Notion property..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-muted-foreground">No mapping</span>
                        </SelectItem>
                        {compatibleProperties.map((property) => (
                          <SelectItem 
                            key={property.id} 
                            value={property.id}
                            disabled={isPropertyMapped(property.id) && currentMapping?.notionPropertyId !== property.id}
                          >
                            <div className="flex items-center gap-2">
                              <span>{property.name}</span>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getPropertyTypeColor(property.type)}`}
                              >
                                {property.type.replace('_', ' ')}
                              </Badge>
                              {isPropertyMapped(property.id) && currentMapping?.notionPropertyId !== property.id && (
                                <span className="text-xs text-muted-foreground">(mapped)</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {currentMapping && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Mapped to "{currentMapping.notionPropertyName}"</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {hasChanges && (
        <div className="flex justify-center">
          <Button 
            onClick={saveMappings}
            disabled={loading || requiredMappingsMapped < requiredMappingsCount}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Mappings
          </Button>
        </div>
      )}

      {mappings.length > 0 && !hasChanges && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Field mappings are configured and saved. You can proceed to sync settings.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}