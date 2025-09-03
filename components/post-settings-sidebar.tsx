"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { TagsInput } from "@/components/tags-input"
import { RelatedPostsSelector } from "@/components/related-posts-selector"
import { useAIMetadata } from "@/hooks/use-ai-metadata"
import { CheckCircle, XCircle, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { Category, Tag } from "@/lib/client-api"

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

      {/* Post URL */}
      <div>
        <h4 className="text-sm font-medium mb-3">Post URL</h4>
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">🔗</span>
            <span className="text-sm font-mono truncate">
              {formData.slug || "untitled-post"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            example.com/posts/{formData.slug || "untitled-post"}
          </p>
        </div>
      </div>


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


      {/* SEO Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">SEO & Social</CardTitle>
        </CardHeader>
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
                  (formData.title.length > 10 ? 25 : 0) +
                  (formData.content.length > 100 ? 25 : 0) +
                  (formData.metaDescription.length > 10 ? 25 : 0) +
                  (formData.tags.length > 0 ? 25 : 0)
                )) : 0}
              </span>
            </div>
            <Progress 
              value={formData.title && formData.content ? Math.min(100, Math.floor(
                (formData.title.length > 10 ? 25 : 0) +
                (formData.content.length > 100 ? 25 : 0) +
                (formData.metaDescription.length > 10 ? 25 : 0) +
                (formData.tags.length > 0 ? 25 : 0)
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
          </div>
        </CardContent>
      </Card>

    </div>
  )
}