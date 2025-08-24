"use client"

import { useState, useEffect } from "react"
import { useClientApi } from "@/lib/client-api"
import type { NotionConnection, NotionDatabase } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Search,
  ExternalLink,
  Loader2,
  CheckCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NotionDatabaseStepProps {
  notionToken: string
  selectedDatabase: NotionDatabase | null
  databases: NotionDatabase[]
  onDatabaseSelect: (database: NotionDatabase) => void
  onDatabasesLoad: (databases: NotionDatabase[]) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  isResumingPartial?: boolean
}

export function NotionDatabaseStep({ 
  notionToken,
  selectedDatabase, 
  databases,
  onDatabaseSelect, 
  onDatabasesLoad,
  loading, 
  setLoading,
  isResumingPartial 
}: NotionDatabaseStepProps) {
  const api = useClientApi()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingDatabases, setLoadingDatabases] = useState(false)
  const [databasesFetched, setDatabasesFetched] = useState(false)

  useEffect(() => {
    if ((notionToken || isResumingPartial) && databases.length === 0 && !databasesFetched) {
      fetchDatabases()
    }
  }, [notionToken, databases.length, databasesFetched, isResumingPartial])

  const fetchDatabases = async () => {
    if (!notionToken || databasesFetched) return
    
    setLoadingDatabases(true)
    try {
      const fetchedDatabases = await api.notion.getDatabases(notionToken)
      onDatabasesLoad(fetchedDatabases)
      setDatabasesFetched(true)
      
      if (fetchedDatabases.length === 0) {
        toast({
          title: "No databases found",
          description: "No databases found. Make sure your integration has access to databases in Notion.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to fetch databases:', error)
      setDatabasesFetched(true)
      
      toast({
        title: "Error",
        description: "Failed to load databases. Please check your token and try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingDatabases(false)
    }
  }

  const handleSelectDatabase = (database: NotionDatabase) => {
    onDatabaseSelect(database)
    toast({
      title: "Database selected",
      description: `Selected "${database.title}" for syncing`,
    })
  }

  const filteredDatabases = databases.filter(db =>
    db.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  if (!notionToken) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please connect to Notion first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Database className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Choose a Database</h3>
        <p className="text-muted-foreground">
          Select the Notion database you want to sync with your blog posts.
        </p>
      </div>

      {selectedDatabase && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Selected database: <strong>{selectedDatabase.title}</strong>
          </AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search databases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loadingDatabases ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading databases...</span>
        </div>
      ) : filteredDatabases.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {databases.length === 0 
              ? "No databases found in your Notion workspace" 
              : "No databases match your search"
            }
          </p>
          {databases.length === 0 && (
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={fetchDatabases}
            >
              Refresh
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredDatabases.map((database) => (
            <Card 
              key={database.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDatabase?.id === database.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : ''
              }`}
              onClick={() => !loading && handleSelectDatabase(database)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{database.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {Object.keys(database.properties || {}).length} properties
                        </span>
                        <a
                          href={database.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View in Notion
                        </a>
                      </div>
                    </div>
                  </div>
                  {selectedDatabase?.id === database.id && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(database.properties || {}).slice(0, 6).map(([name, property]) => (
                    <Badge 
                      key={property.id} 
                      variant="secondary"
                      className={`text-xs ${getPropertyTypeColor(property.type)}`}
                    >
                      {name}
                    </Badge>
                  ))}
                  {Object.keys(database.properties || {}).length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{Object.keys(database.properties || {}).length - 6} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {databases.length > 0 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => {
              setDatabasesFetched(false)
              fetchDatabases()
            }} 
            disabled={loadingDatabases}
          >
            {loadingDatabases && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Refresh Databases
          </Button>
        </div>
      )}
    </div>
  )
}