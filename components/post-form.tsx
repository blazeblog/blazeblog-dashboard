"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, X, FileText, Settings, Eye, Focus } from "lucide-react"
import { useClientApi, type Category, type Post, type Tag } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"
import { useAutoSave } from "@/hooks/use-auto-save"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AdvancedTiptapEditor } from "@/components/advanced-tiptap-editor"
import { PostPreview } from "@/components/post-preview"
import { TagsInput } from "@/components/tags-input"
import { SEOSuggestionsSidebar } from "@/components/seo-suggestions-sidebar"
import { RelatedPostsSelector } from "@/components/related-posts-selector"
import { generateSlug, ensureTagsExist } from "@/lib/auto-create-utils"
import { cn } from "@/lib/utils"
import { ConnectivityIndicator } from "@/components/connectivity-indicator"
import { AutoSaveIndicator } from "@/components/auto-save-indicator"

interface PostFormProps {
  mode: "add" | "edit"
  postId?: number
  initialData?: Partial<Post>
}

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
}

export function PostForm({ mode, postId, initialData }: PostFormProps) {
  // All the shared state and logic goes here
  const router = useRouter()
  const api = useClientApi()
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    slug: initialData?.slug || "",
    status: (initialData?.status as any) || "draft",
    categoryId: initialData?.categoryId || "",
    tags: initialData?.tags || [],
    featuredImage: initialData?.featuredImage || "",
    metaDescription: initialData?.metaDescription || "",
    publishDate: initialData?.publishDate || "",
    relatedPosts: initialData?.relatedPosts?.map(rp => rp.relatedPost) || [],
  })

  // UI state
  const [activeTab, setActiveTab] = useState("editor")
  const [showSEOSidebar, setShowSEOSidebar] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Auto-save functionality
  const {
    lastSaved,
    isSaving,
    isOnline,
    autoSaveEnabled
  } = useAutoSave({
    postId: mode === "edit" ? postId?.toString() || "new" : "new",
    title: formData.title,
    content: formData.content,
    heroImage: formData.featuredImage,
    categoryId: formData.categoryId?.toString() || "",
    excerpt: formData.excerpt,
    status: formData.status
  })

  // Load initial data for edit mode
  useEffect(() => {
    if (mode === "edit" && postId && !initialData) {
      loadPost()
    }
    loadCategories()
  }, [mode, postId])

  const loadPost = async () => {
    if (!postId) return
    
    try {
      setIsLoading(true)
      const post = await api.get<Post>(`/posts/${postId}`)
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        slug: post.slug || "",
        status: post.status as any,
        categoryId: post.categoryId || "",
        tags: post.tags || [],
        featuredImage: post.featuredImage || "",
        metaDescription: post.metaDescription || "",
        publishDate: post.publishDate || "",
        relatedPosts: post.relatedPosts?.map(rp => rp.relatedPost) || [],
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await api.getPaginated<Category>('/categories', { limit: 100 })
      setCategories(response.data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Ensure tags exist
      const tagsWithIds = await ensureTagsExist(formData.tags.map(t => t.name), { api, toast })

      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        metaDescription: formData.metaDescription || undefined,
        status: formData.status,
        featuredImage: formData.featuredImage || undefined,
        categoryId: formData.categoryId && formData.categoryId !== "" ? formData.categoryId : undefined,
        slug: formData.slug,
        userId: 1, // TODO: Get from auth context
        tagIds: tagsWithIds.map(tag => tag.id),
        relatedPostIds: formData.relatedPosts.map(post => post.id),
        publishDate: formData.status === 'scheduled' ? formData.publishDate : undefined
      }

      let result
      if (mode === "add") {
        result = await api.post('/posts', postData)
        toast({
          title: "Success",
          description: "Post created successfully",
        })
      } else {
        result = await api.put(`/posts/${postId}`, postData)
        toast({
          title: "Success", 
          description: "Post updated successfully",
        })
      }

      if (formData.status === "published") {
        router.push(`/admin/posts`)
      } else {
        router.push(`/admin/posts/edit/${result.id}`)
      }
    } catch (error: any) {
      setError(error.message || `Failed to ${mode === "add" ? "create" : "update"} post`)
    } finally {
      setIsLoading(false)
    }
  }

  // Extract title from content and auto-generate slug
  useEffect(() => {
    let extractedTitle = ''
    let updatedContent = formData.content
    
    if (formData.content) {
      // First try to get h1 tag and remove it from content
      const h1Match = formData.content.match(/<h1[^>]*>(.*?)<\/h1>/i)
      if (h1Match) {
        extractedTitle = h1Match[1].replace(/<[^>]*>/g, '').trim()
        // Remove the h1 tag from content
        updatedContent = formData.content.replace(/<h1[^>]*>.*?<\/h1>\s*/i, '').trim()
      } else {
        // Get the very first paragraph as title and remove it from content
        const firstParagraphMatch = formData.content.match(/<p[^>]*>(.*?)<\/p>/)
        if (firstParagraphMatch) {
          const firstParagraphText = firstParagraphMatch[1].replace(/<[^>]*>/g, '').trim()
          // Use first paragraph if it looks like a title (not too long, not empty)
          if (firstParagraphText.length > 0 && firstParagraphText.length <= 150) {
            extractedTitle = firstParagraphText
            // Remove the first paragraph from content
            updatedContent = formData.content.replace(/<p[^>]*>.*?<\/p>\s*/i, '').trim()
          }
        }
      }
    }
    
    console.log('Content start:', formData.content.substring(0, 200))
    console.log('Extracted title:', extractedTitle)
    console.log('Updated content start:', updatedContent.substring(0, 200))
    
    if (extractedTitle && extractedTitle !== formData.title) {
      setFormData(prev => ({ 
        ...prev, 
        title: extractedTitle,
        content: updatedContent
      }))
    }
    
    // Auto-generate slug from title
    if (extractedTitle && (!formData.slug || mode === "add")) {
      const newSlug = generateSlug(extractedTitle)
      setFormData(prev => ({ ...prev, slug: newSlug }))
    }
  }, [formData.content, formData.title, formData.slug, mode])

  // SEO suggestion handlers
  const handleTitleSuggestion = (title: string) => {
    setFormData(prev => ({ ...prev, title }))
  }

  const handleSlugSuggestion = (slug: string) => {
    setFormData(prev => ({ ...prev, slug }))
  }

  const handleTagSuggestions = async (tagNames: string[]) => {
    try {
      const newTags = await ensureTagsExist(tagNames, { api, toast })
      const uniqueTags = [...formData.tags]
      newTags.forEach(tag => {
        if (!uniqueTags.find(t => t.id === tag.id)) {
          uniqueTags.push(tag)
        }
      })
      setFormData(prev => ({ ...prev, tags: uniqueTags.slice(0, 10) }))
    } catch (error) {
      console.error('Error handling tag suggestions:', error)
    }
  }

  const handleExcerptSuggestion = (excerpt: string) => {
    setFormData(prev => ({ ...prev, excerpt }))
  }

  const handleMetaDescriptionSuggestion = (metaDescription: string) => {
    setFormData(prev => ({ ...prev, metaDescription }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const pageTitle = mode === "add" ? "Create New Post" : "Edit Post"
  const pageDescription = mode === "add" ? "Write and publish your content" : "Edit and update your content"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">{pageDescription}</p>
            <Badge 
              variant="outline" 
              className="text-xs h-5 px-2 font-normal"
            >
              {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Status indicators */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <ConnectivityIndicator isOnline={isOnline} />
            <AutoSaveIndicator
              lastSaved={lastSaved}
              isSaving={isSaving}
              autoSaveEnabled={autoSaveEnabled}
            />
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSEOSidebar(!showSEOSidebar)}
              className={cn("h-9 text-muted-foreground hover:text-foreground text-sm", 
                showSEOSidebar && "bg-muted text-foreground")}
            >
              <Focus className="w-4 h-4 mr-2" />
              SEO
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="h-9 text-sm flex-1 sm:flex-none"
            >
              <a href="/admin/posts">Cancel</a>
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              size="sm" 
              disabled={isLoading || !formData.title.trim()}
              className="h-9 px-4 sm:px-6 bg-primary text-primary-foreground hover:bg-primary/90 text-sm flex-1 sm:flex-none"
            >
              {isLoading ? 'Saving...' : 
               formData.status === 'published' ? 'Publish' :
               formData.status === 'scheduled' ? 'Schedule' :
               'Save Draft'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className={`flex-1 min-w-0 ${!showSEOSidebar ? 'w-full max-w-none px-0' : ''}`}>
          <div className="space-y-6">
            {/* Editor Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 h-10 text-sm">
                <TabsTrigger value="editor" className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4" />
                  Metadata
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="mt-4">
                <AdvancedTiptapEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  heroImage={formData.featuredImage}
                  onHeroImageChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                  enableAutoSave={autoSaveEnabled}
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <PostPreview
                  title={formData.title}
                  content={formData.content}
                  featuredImage={formData.featuredImage}
                  tags={formData.tags}
                  publishDate={formData.publishDate}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="space-y-6 max-w-4xl">
                  {/* Content Overview */}
                  <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                    {/* Publishing Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Publish Settings</CardTitle>
                        <CardDescription>
                          {formData.status === 'draft' && 'Save as draft to work on later'}
                          {formData.status === 'published' && 'Publish immediately when saved'}
                          {formData.status === 'scheduled' && 'Schedule for automatic publishing'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Publish Now</SelectItem>
                              <SelectItem value="scheduled">Schedule for Later</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={formData.categoryId ? formData.categoryId.toString() : "0"}
                            onValueChange={(value) => setFormData(prev => ({ 
                              ...prev, 
                              categoryId: value === "0" ? "" : parseInt(value) 
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
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
                        
                        {formData.status === 'scheduled' && (
                          <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="publishDate">Schedule Date & Time</Label>
                                <span className="text-xs text-red-500 font-medium">Required</span>
                              </div>
                              <Input
                                id="publishDate"
                                type="datetime-local"
                                value={formData.publishDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                                className="w-auto max-w-xs cursor-pointer"
                              />
                              <p className="text-xs text-muted-foreground">
                                Select when you want this post to be automatically published
                              </p>
                            </div>
                            
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const tomorrow = new Date()
                                  tomorrow.setDate(tomorrow.getDate() + 1)
                                  tomorrow.setHours(9, 0, 0, 0)
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    publishDate: tomorrow.toISOString().slice(0, 16) 
                                  }))
                                }}
                              >
                                Tomorrow
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const sixHours = new Date()
                                  sixHours.setHours(sixHours.getHours() + 6)
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    publishDate: sixHours.toISOString().slice(0, 16) 
                                  }))
                                }}
                              >
                                6 Hours
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const twoDays = new Date()
                                  twoDays.setDate(twoDays.getDate() + 2)
                                  twoDays.setHours(9, 0, 0, 0)
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    publishDate: twoDays.toISOString().slice(0, 16) 
                                  }))
                                }}
                              >
                                2 Days
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* SEO Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>SEO Settings</CardTitle>
                        <CardDescription>Optimize your post for search engines</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="slug">URL Slug</Label>
                          <Input
                            id="slug"
                            placeholder="url-friendly-slug"
                            value={formData.slug}
                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                          />
                          <p className="text-xs text-muted-foreground">URL: /posts/{formData.slug || 'your-slug'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="metaDescription">Meta Description</Label>
                          <Textarea
                            id="metaDescription"
                            placeholder="Brief description for SEO and social sharing..."
                            rows={3}
                            value={formData.metaDescription}
                            onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                          />
                          <p className="text-xs text-muted-foreground">{formData.metaDescription.length}/160 characters</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Tags (max 10)</Label>
                          <TagsInput
                            value={formData.tags}
                            onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                            maxTags={10}
                            placeholder="Add relevant tags..."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        Excerpt
                      </CardTitle>
                      <Textarea
                        id="excerpt"
                        placeholder="Write a brief excerpt for your post...."
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      />
                    </CardHeader>
                  </Card>

                  {/* Related Posts */}
                  <RelatedPostsSelector
                    currentPostId={postId}
                    selectedPosts={formData.relatedPosts}
                    onChange={(posts) => setFormData(prev => ({ ...prev, relatedPosts: posts }))}
                    maxSelection={5}
                  />

                         <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Content Overview</CardTitle>
                      <CardDescription>Quick stats about your post</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg border bg-card">
                          <div className="text-2xl font-semibold">
                            {formData.content
                              .replace(/<[^>]*>/g, "")
                              .split(" ")
                              .filter((word) => word.length > 0).length
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">Words</div>
                        </div>
                        <div className="text-center p-4 rounded-lg border bg-card">
                          <div className="text-2xl font-semibold">
                            {Math.ceil(formData.content.replace(/<[^>]*>/g, "").split(" ").length / 200)}
                          </div>
                          <div className="text-sm text-muted-foreground">Min read</div>
                        </div>
                        <div className="text-center p-4 rounded-lg border bg-card">
                          <div className="text-2xl font-semibold">
                            {(formData.content.match(/<h[1-6][^>]*>/g) || []).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Headings</div>
                        </div>
                        <div className="text-center p-4 rounded-lg border bg-card">
                          <div className="text-2xl font-semibold">{formData.tags.length}</div>
                          <div className="text-sm text-muted-foreground">Tags</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* SEO Suggestions Sidebar */}
        {showSEOSidebar && (
          <div className="w-full lg:w-72 flex-shrink-0 order-last">
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              <SEOSuggestionsSidebar
                title={formData.title}
                content={formData.content}
                excerpt={formData.metaDescription}
                slug={formData.slug}
                tags={formData.tags}
                featuredImage={formData.featuredImage}
                onTitleSuggestion={handleTitleSuggestion}
                onSlugSuggestion={handleSlugSuggestion}
                onTagSuggestions={handleTagSuggestions}
                onExcerptSuggestion={handleExcerptSuggestion}
                onMetaDescriptionSuggestion={handleMetaDescriptionSuggestion}
                className="pr-2"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}