"use client"

import { useState, useEffect } from "react"
import { useClientApi } from "@/lib/client-api"
import type { SyncedPage } from "@/lib/client-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ExternalLink,
  FileText,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NotionSyncedPagesProps {
  integrationId: string
}

export function NotionSyncedPages({ integrationId }: NotionSyncedPagesProps) {
  const api = useClientApi()
  const { toast } = useToast()
  
  const [pages, setPages] = useState<SyncedPage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPages, setFilteredPages] = useState<SyncedPage[]>([])

  useEffect(() => {
    loadSyncedPages()
  }, [integrationId])

  useEffect(() => {
    if (searchTerm) {
      const filtered = pages.filter(page => 
        page.notion_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (page.blazeblog_title && page.blazeblog_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (page.blazeblog_slug && page.blazeblog_slug.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredPages(filtered)
    } else {
      setFilteredPages(pages)
    }
  }, [pages, searchTerm])

  const loadSyncedPages = async () => {
    setLoading(true)
    try {
      const syncedPages = await api.notion.getSyncedPages(Number(integrationId))
      setPages(syncedPages)
    } catch (error) {
      console.error('Failed to load synced pages:', error)
      toast({
        title: "Error",
        description: "Failed to load synced pages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading synced pages...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Synced Pages</h2>
          <p className="text-muted-foreground">
            View all pages synced from your Notion database
          </p>
        </div>
        <Button onClick={loadSyncedPages} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {pages.length}</span>
          <span>Synced: {pages.filter(p => p.sync_status === 'synced').length}</span>
          <span>Pending: {pages.filter(p => p.sync_status === 'pending').length}</span>
          <span>Errors: {pages.filter(p => p.sync_status === 'error').length}</span>
        </div>
      </div>

      {/* Pages List */}
      {filteredPages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No synced pages found</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "No pages match your search criteria" 
                : "No pages have been synced from your Notion database yet"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPages.map((page) => (
            <Card key={page.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(page.sync_status)}
                        <Badge className={getStatusColor(page.sync_status)}>
                          {page.sync_status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg">{page.notion_title}</h3>
                    </div>
                    
                    {page.blazeblog_title && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Blazeblog:</span> {page.blazeblog_title}
                        {page.blazeblog_slug && (
                          <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                            /{page.blazeblog_slug}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {page.error_message && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        {page.error_message}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {formatDate(page.created_at)}
                      </div>
                      {page.last_synced_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Last synced: {formatDate(page.last_synced_at)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={page.notion_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View in Notion
                      </a>
                    </Button>
                    
                    {page.post_id && page.blazeblog_slug && (
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={`/posts/${page.blazeblog_slug}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Post
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}