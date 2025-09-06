"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
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
import { useToast } from "@/hooks/use-toast"
import { 
  Clock, 
  User, 
  MoreVertical, 
  RotateCcw, 
  Eye, 
  GitCompare, 
  Crown,
  FileText,
  Activity,
  Users,
  TrendingUp
} from "lucide-react"
import { useRevisionService, RevisionUtils, type PostRevision } from "@/lib/revision-service"
import { cn } from "@/lib/utils"

interface RevisionListProps {
  postId: string | number
  onRevisionSelect?: (revision: PostRevision) => void
  onRevisionRestore?: (revision: PostRevision) => void
  onRevisionCompare?: (revision1: PostRevision, revision2: PostRevision) => void
  onRevisionCountChange?: (count: number) => void
  className?: string
}

export function RevisionList({ 
  postId, 
  onRevisionSelect, 
  onRevisionRestore,
  onRevisionCompare,
  onRevisionCountChange,
  className = "" 
}: RevisionListProps) {
  const [revisions, setRevisions] = useState<PostRevision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restoring, setRestoring] = useState<number | null>(null)
  const [selectedRevisions, setSelectedRevisions] = useState<PostRevision[]>([])
  
  const revisionService = useRevisionService()
  const { toast } = useToast()

  useEffect(() => {
    fetchRevisions()
  }, [postId])

  const fetchRevisions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await revisionService.getPostRevisions(postId)
      setRevisions(data)
      onRevisionCountChange?.(data.length)
    } catch (err) {
      console.error('Error fetching revisions:', err)
      setError('Failed to load revisions')
      toast({
        title: "Error",
        description: "Failed to load revisions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (revision: PostRevision) => {
    try {
      setRestoring(revision.versionNumber)
      await revisionService.restoreRevision(postId, revision.versionNumber)
      
      toast({
        title: "Success!",
        description: `Post restored to version ${revision.versionNumber} successfully.`,
        variant: "default",
        duration: 3000
      })
      
      onRevisionRestore?.(revision)
      // Refresh revisions to get the latest state
      await fetchRevisions()
    } catch (err) {
      console.error('Error restoring revision:', err)
      toast({
        title: "Error",
        description: "Failed to restore revision. Please try again.",
        variant: "destructive"
      })
    } finally {
      setRestoring(null)
    }
  }

  const handleRevisionClick = (revision: PostRevision) => {
    if (selectedRevisions.length === 0) {
      setSelectedRevisions([revision])
    } else if (selectedRevisions.length === 1) {
      if (selectedRevisions[0].id === revision.id) {
        setSelectedRevisions([])
      } else {
        setSelectedRevisions([...selectedRevisions, revision])
        // Auto-trigger comparison if two are selected
        if (onRevisionCompare) {
          onRevisionCompare(selectedRevisions[0], revision)
        }
      }
    } else {
      setSelectedRevisions([revision])
    }
  }

  const getStatusBadge = (status: string, isPublished: boolean) => {
    if (isPublished) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <Crown className="h-3 w-3 mr-1" />
          Published
        </Badge>
      )
    }
    
    switch (status) {
      case "published":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Published</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRevisionStats = () => {
    if (revisions.length === 0) return null
    return revisionService.getRevisionStats(revisions)
  }

  const stats = getRevisionStats()

  if (loading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Revisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
              <p className="text-muted-foreground text-sm">Loading revisions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Revisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button type="button" onClick={fetchRevisions} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Revisions
            </CardTitle>
            <CardDescription>
              Track changes and restore previous versions
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {revisions.length} version{revisions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="font-semibold text-blue-600 dark:text-blue-400">{stats.totalRevisions}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="font-semibold text-green-600 dark:text-green-400">{stats.publishedVersions}</div>
              <div className="text-xs text-muted-foreground">Published</div>
            </div>
            <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="font-semibold text-purple-600 dark:text-purple-400">{stats.contributors}</div>
              <div className="text-xs text-muted-foreground">Contributors</div>
            </div>
            <div className="text-center p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="font-semibold text-orange-600 dark:text-orange-400">
                {stats.lastModified ? RevisionUtils.formatTimestamp(stats.lastModified) : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Last Edit</div>
            </div>
          </div>
        )}

        {selectedRevisions.length === 2 && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <GitCompare className="h-4 w-4" />
                Comparing versions {selectedRevisions[0].versionNumber} and {selectedRevisions[1].versionNumber}
              </div>
              <Button 
                type="button"
                onClick={() => setSelectedRevisions([])} 
                variant="ghost" 
                size="sm"
                className="text-blue-700 dark:text-blue-300"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-3">
            {revisions.map((revision, index) => (
              <div
                key={revision.id}
                className={cn(
                  "group relative p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                  selectedRevisions.some(r => r.id === revision.id) && "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
                  revision.isPublishedVersion && "ring-2 ring-green-500/20"
                )}
                onClick={() => handleRevisionClick(revision)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        v{revision.versionNumber}
                      </Badge>
                      {getStatusBadge(revision.status, revision.isPublishedVersion)}
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Latest
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1 truncate" title={revision.title}>
                      {revision.title}
                    </h4>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {RevisionUtils.truncateText(RevisionUtils.stripHtml(revision.content), 120)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {revision.creator?.username || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {RevisionUtils.formatTimestamp(revision.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {RevisionUtils.stripHtml(revision.content).split(' ').filter(w => w.length > 0).length} words
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {selectedRevisions.some(r => r.id === revision.id) && (
                      <Badge variant="secondary" className="text-xs">
                        Selected
                      </Badge>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          onRevisionSelect?.(revision)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        
                        {index !== 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restore
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Restore to version {revision.versionNumber}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will create a new revision with the content from version {revision.versionNumber}. 
                                    The current content will not be lost and can be restored later.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRestore(revision)}
                                    disabled={restoring === revision.versionNumber}
                                  >
                                    {restoring === revision.versionNumber ? 'Restoring...' : 'Restore'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
            
            {revisions.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No revisions found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Revisions will appear here when you make changes to your post
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default RevisionList