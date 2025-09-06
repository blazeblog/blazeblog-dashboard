"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, RotateCcw, Clock, User, Crown, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostLayout } from "@/components/post-layout"
import { useRevisionService, RevisionUtils } from "@/lib/revision-service"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { PostRevision } from "@/lib/client-api"

interface RevisionViewerProps {
  postId: number
  versionNumber: number
}

export function RevisionViewer({ postId, versionNumber }: RevisionViewerProps) {
  const [revision, setRevision] = useState<PostRevision | null>(null)
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const revisionService = useRevisionService()
  const { toast } = useToast()

  useEffect(() => {
    fetchRevision()
  }, [postId, versionNumber])

  const fetchRevision = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await revisionService.getRevision(postId, versionNumber)
      setRevision(data)
    } catch (error) {
      console.error('Error fetching revision:', error)
      setError('Failed to load revision. The revision may not exist.')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!revision) return
    
    try {
      setRestoring(true)
      await revisionService.restoreRevision(postId, versionNumber)
      
      toast({
        title: "Success!",
        description: `Post restored to version ${versionNumber} successfully.`,
        variant: "default",
        duration: 3000
      })
      
      // Navigate back to edit page after restore
      setTimeout(() => {
        router.push(`/admin/posts/edit/${postId}`)
      }, 1500)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore revision. Please try again.",
        variant: "destructive"
      })
    } finally {
      setRestoring(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <PostLayout 
        title="Loading revision..."
        content=""
        onTitleChange={() => {}}
        onContentChange={() => {}}
        isLoading={true}
        onSave={async () => {}}
        onPublish={async () => {}}
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/admin/posts/edit/${postId}`)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Edit
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading revision...</p>
          </div>
        </div>
      </PostLayout>
    )
  }

  if (error || !revision) {
    return (
      <PostLayout 
        title="Revision not found"
        content=""
        onTitleChange={() => {}}
        onContentChange={() => {}}
        isLoading={false}
        onSave={async () => {}}
        onPublish={async () => {}}
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/admin/posts/edit/${postId}`)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Edit
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Revision Not Found</h2>
              <p className="text-muted-foreground">
                {error || `Version ${versionNumber} of this post could not be found.`}
              </p>
            </div>
            <Button onClick={() => router.push(`/admin/posts/edit/${postId}`)}>
              Return to Post Editor
            </Button>
          </div>
        </div>
      </PostLayout>
    )
  }

  return (
    <PostLayout 
      title={revision.title}
      content={revision.content}
      onTitleChange={() => {}} // Read-only
      onContentChange={() => {}} // Read-only
      isLoading={false}
      onSave={async () => {}} // Disabled for revisions
      onPublish={async () => {}} // Disabled for revisions
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/posts/edit/${postId}`)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Edit
            </Button>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-mono">
                Version {revision.versionNumber}
              </Badge>
              
              {revision.isPublishedVersion && (
                <Badge className="text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <Crown className="h-3 w-3 mr-1" />
                  Published Version
                </Badge>
              )}
              
              <Badge 
                variant={revision.status === 'published' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {revision.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {revision.creator?.username || 'Unknown'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDate(revision.createdAt)}
              </span>
            </div>

            <Button
              onClick={handleRestore}
              disabled={restoring}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {restoring ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore This Version
                </>
              )}
            </Button>
          </div>
        </div>
      }
      sidebar={
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revision Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-mono">{revision.versionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={revision.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                    {revision.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Author:</span>
                  <span>{revision.creator?.username || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{RevisionUtils.formatTimestamp(revision.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Words:</span>
                  <span>{RevisionUtils.stripHtml(revision.content).split(' ').filter(w => w.length > 0).length}</span>
                </div>
              </div>
            </div>

            {revision.excerpt && (
              <div>
                <h4 className="text-sm font-medium mb-2">Excerpt</h4>
                <p className="text-sm text-muted-foreground">
                  {revision.excerpt}
                </p>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-3">
                This is a read-only view of version {revision.versionNumber}. 
                Use "Restore This Version" to make it the current version.
              </p>
              
              <Button
                onClick={handleRestore}
                disabled={restoring}
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {restoring ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent mr-2"></div>
                    Restoring...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3 w-3 mr-2" />
                    Restore This Version
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      {/* The content is displayed in read-only mode through PostLayout */}
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">
          📖 Read-only view of version {revision.versionNumber}
        </p>
      </div>
    </PostLayout>
  )
}