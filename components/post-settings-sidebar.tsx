"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2 } from "lucide-react"
import { TagsInput } from "@/components/tags-input"
import { RelatedPostsSelector } from "@/components/related-posts-selector"
import { useAIMetadata } from "@/hooks/use-ai-metadata"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, TrendingUp, History, Clock, User, RotateCcw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useRevisionService, RevisionUtils } from "@/lib/revision-service"
import type { Category, Tag, PostRevision } from "@/lib/client-api"

interface PostFormData {
  title: string
  content: string
  excerpt: string
  slug: string
  status: "draft" | "published" | "scheduled"
  categoryId: number | ""
  tags: Tag[]
  featuredImage: string
  metaDescription: string
  publishDate: string
  relatedPosts: { id: number; title: string; slug?: string | null }[]
  isFeatured: boolean
}

interface PostSettingsSidebarProps {
  formData: PostFormData
  setFormData: React.Dispatch<React.SetStateAction<PostFormData>>
  categories: Category[]
  postId?: number
  onTitleSuggestion: (title: string) => void
  onSlugSuggestion: (slug: string) => void
  onTagSuggestions: (tags: string[]) => Promise<void>
  onExcerptSuggestion: (excerpt: string) => void
  onMetaDescriptionSuggestion: (metaDescription: string) => void
}

export function PostSettingsSidebar({
  formData,
  setFormData,
  categories,
  postId,
  onTitleSuggestion,
  onSlugSuggestion,
  onTagSuggestions,
  onExcerptSuggestion,
  onMetaDescriptionSuggestion,
}: PostSettingsSidebarProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const { generateMetadata, isGenerating, getRateLimitInfo } = useAIMetadata()
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null)

  React.useEffect(() => {
    getRateLimitInfo().then(setRateLimitInfo)
  }, [])

  React.useEffect(() => {
    console.log('Categories in sidebar:', categories)
  }, [categories])

  const handleAIGeneration = async () => {
    if (!formData.content.trim()) return

    try {
      const result = await generateMetadata(formData.content, formData.slug, formData.title)

      if (result && result.title && result.title !== formData.title) {
        onTitleSuggestion(result.title)
      }
      if (result && result.slug && result.slug !== formData.slug) {
        onSlugSuggestion(result.slug)
      }
      if (result && result.excerpt) {
        onExcerptSuggestion(result.excerpt)
      }
      if (result && result.metaDescription) {
        onMetaDescriptionSuggestion(result.metaDescription)
      }
      if (result && result.tags && result.tags.length > 0) {
        onTagSuggestions(result.tags)
      }

      // Refresh rate limit info
      const newRateLimit = await getRateLimitInfo()
      setRateLimitInfo(newRateLimit)
    } catch (error) {
      console.error('Error generating metadata:', error)
    }
  }


  return (
    <div className="space-y-6">
      {/* AI Generate Button - at top */}
      <Card className="border border-muted bg-accent/30">
        <CardContent className="pt-1.5 pb-1.5 space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm">AI Assistant</h3>
          </div>

          <Button
            onClick={handleAIGeneration}
            disabled={isGenerating || (rateLimitInfo && rateLimitInfo.availableRequests <= 0) || !formData.content.trim()}
            variant="default"
            size="sm"
            className="w-full h-7"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate SEO Metadata"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground h-4 flex items-center justify-center">
            {rateLimitInfo ? (
              rateLimitInfo.availableRequests > 0
                ? `${rateLimitInfo.availableRequests} uses left today`
                : "Daily limit reached"
            ) : (
              <span className="inline-block w-20 h-3 bg-muted/30 rounded animate-pulse" />
            )}
          </p>
        </CardContent>
      </Card>

      <Card>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-xs">URL Slug</Label>
            <Input
              id="slug"
              placeholder="url-friendly-slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription" className="text-xs">Meta Description</Label>
            <Textarea
              id="metaDescription"
              placeholder="Brief description for SEO..."
              rows={3}
              value={formData.metaDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
              className="text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">{formData.metaDescription.length}/160</p>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <div>
        <h4 className="text-sm font-medium mb-3">Tags</h4>
        <TagsInput
          value={formData.tags}
          onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
          maxTags={10}
          placeholder="Add tags..."
        />
      </div>

      {/* Category */}
      <div>
        <h4 className="text-sm font-medium mb-3">Category</h4>
        <Select
          value={formData.categoryId ? formData.categoryId.toString() : "0"}
          onValueChange={(value) => setFormData(prev => ({
            ...prev,
            categoryId: value === "0" ? "" : parseInt(value)
          }))}
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="No Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">No Category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Feature this post toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <span className="text-sm">⭐</span>
          <span className="text-sm font-medium">Feature this post</span>
        </div>
        <button
          onClick={() => setFormData(prev => ({
            ...prev,
            isFeatured: !prev.isFeatured
          }))}
          className={cn(
            "w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-200",
            formData.isFeatured ? "bg-primary" : "bg-muted"
          )}
        >
          <div className={cn(
            "w-4 h-4 bg-background rounded-full absolute top-1 transition-transform duration-200",
            formData.isFeatured ? "translate-x-5" : "translate-x-1"
          )}></div>
        </button>
      </div>

      {/* Excerpt */}
      <div>
        <h4 className="text-sm font-medium mb-3">Excerpt</h4>
        <Textarea
          placeholder="Optional excerpt..."
          value={formData.excerpt}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Related Posts */}
      <RelatedPostsSelector
        currentPostId={postId}
        selectedPosts={formData.relatedPosts}
        onChange={(posts) => setFormData(prev => ({ ...prev, relatedPosts: posts }))}
        maxSelection={5}
      />

      {/* Content Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Content Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded border bg-background">
              <div className="text-lg font-semibold">
                {formData.content
                  .replace(/<[^>]*>/g, "")
                  .split(" ")
                  .filter((word) => word.length > 0).length
                }
              </div>
              <div className="text-xs text-muted-foreground">words</div>
            </div>
            <div className="text-center p-3 rounded border bg-background">
              <div className="text-lg font-semibold">
                {Math.ceil(formData.content.replace(/<[^>]*>/g, "").split(" ").length / 200)}
              </div>
              <div className="text-xs text-muted-foreground">min read</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            SEO Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall optimization</span>
              <span className="font-medium">
                {formData.title && formData.content ? Math.min(100, Math.floor(
                  (formData.title.length > 10 ? 16.7 : 0) +
                  (formData.content.length > 100 ? 16.7 : 0) +
                  (formData.metaDescription.length > 10 ? 16.7 : 0) +
                  (formData.tags.length > 0 ? 16.7 : 0) +
                  (formData.featuredImage ? 16.7 : 0) +
                  (formData.content.includes('[') || formData.content.includes('<a') ? 16.5 : 0)
                )) : 0}
              </span>
            </div>
            <Progress
              value={formData.title && formData.content ? Math.min(100, Math.floor(
                (formData.title.length > 10 ? 16.7 : 0) +
                (formData.content.length > 100 ? 16.7 : 0) +
                (formData.metaDescription.length > 10 ? 16.7 : 0) +
                (formData.tags.length > 0 ? 16.7 : 0) +
                (formData.featuredImage ? 16.7 : 0) +
                (formData.content.includes('[') || formData.content.includes('<a') ? 16.5 : 0)
              )) : 0}
              className="h-2"
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              {formData.title.length > 10 ?
                <CheckCircle className="h-3 w-3 text-green-500" /> :
                <XCircle className="h-3 w-3 text-red-500" />
              }
              <span>Title length ({formData.title.length} chars)</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.content.length > 100 ?
                <CheckCircle className="h-3 w-3 text-green-500" /> :
                <XCircle className="h-3 w-3 text-red-500" />
              }
              <span>Content length ({formData.content.length} chars)</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.metaDescription.length > 10 ?
                <CheckCircle className="h-3 w-3 text-green-500" /> :
                <XCircle className="h-3 w-3 text-red-500" />
              }
              <span>Meta description ({formData.metaDescription.length}/160)</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.tags.length > 0 ?
                <CheckCircle className="h-3 w-3 text-green-500" /> :
                <XCircle className="h-3 w-3 text-red-500" />
              }
              <span>Tags ({formData.tags.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.featuredImage ?
                <CheckCircle className="h-3 w-3 text-green-500" /> :
                <XCircle className="h-3 w-3 text-red-500" />
              }
              <span>Featured image</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.content.includes('[') || formData.content.includes('<a') ?
                <CheckCircle className="h-3 w-3 text-green-500" /> :
                <XCircle className="h-3 w-3 text-red-500" />
              }
              <span>Internal links</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post History - Only show in edit mode */}
      {postId && <PostHistoryMinimal postId={postId} />}

    </div>
  )
}

// Minimal Post History Component for Sidebar
interface PostHistoryMinimalProps {
  postId: number
}

function PostHistoryMinimal({ postId }: PostHistoryMinimalProps) {
  const [revisions, setRevisions] = useState<PostRevision[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<number | null>(null)
  
  const revisionService = useRevisionService()
  const { toast } = useToast()

  useEffect(() => {
    fetchRevisions()
  }, [postId])

  const fetchRevisions = async () => {
    try {
      setLoading(true)
      const data = await revisionService.getPostRevisions(postId)
      setRevisions(data.slice(0, 5)) // Show only last 5 revisions
    } catch (error) {
      console.error('Error fetching revisions:', error)
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
        description: `Restored to version ${revision.versionNumber}`,
        variant: "default",
        duration: 3000
      })
      
      // Reload page to show updated content
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore revision",
        variant: "destructive"
      })
    } finally {
      setRestoring(null)
    }
  }

  const viewRevision = (revision: PostRevision) => {
    // Open revision in a new tab with full-screen view
    window.open(`/admin/posts/revision/${postId}/${revision.versionNumber}`, '_blank')
  }

  if (loading) {
    return (
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <History className="h-4 w-4" />
          Post History
        </h4>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mx-auto"></div>
        </div>
      </div>
    )
  }

  if (revisions.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <History className="h-4 w-4" />
          Post History
        </h4>
        <p className="text-xs text-muted-foreground">No previous versions</p>
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
        <History className="h-4 w-4" />
        Post History
        <Badge variant="outline" className="text-xs">{revisions.length}</Badge>
      </h4>
      
      <div className="space-y-2">
        {revisions.map((revision, index) => (
          <div
            key={revision.id}
            className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => viewRevision(revision)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs font-mono">
                    v{revision.versionNumber}
                  </Badge>
                  {index === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                  {revision.isPublishedVersion && (
                    <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Published
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mb-2 truncate">
                  {RevisionUtils.truncateText(revision.title, 40)}
                </p>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {revision.creator?.username || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {RevisionUtils.formatTimestamp(revision.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Click to view full details
              </div>
            </div>
          </div>
        ))}
        
        {revisions.length >= 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open(`/admin/posts/edit/${postId}/history`, '_blank')}
            className="w-full h-7 text-xs"
          >
            View All History
          </Button>
        )}
      </div>

    </div>
  )
}