"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClientApi, type Category, type Tag, type Post } from "@/lib/client-api"
import { usePageTitle } from "@/hooks/use-page-title"
import { Save, X, FileText, Settings, Eye, Focus, BookOpen, Clock, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AdminLayout } from "@/components/admin-layout"
import { AdvancedTiptapEditor } from "@/components/advanced-tiptap-editor"
import { PostPreview } from "@/components/post-preview"
import { useAutoSave } from "@/hooks/use-auto-save"
import { AutoSaveIndicator } from "@/components/auto-save-indicator"
import { ConnectivityIndicator } from "@/components/connectivity-indicator"
import { TagsInput } from "@/components/tags-input"
import { SEOSuggestionsSidebar } from "@/components/seo-suggestions-sidebar"
import { RelatedPostsSelector } from "@/components/related-posts-selector"
// import { FocusModeToggle, FocusModeContext, useFocusMode } from "@/components/focus-mode-toggle"
import { generateSlug, ensureTagsExist } from "@/lib/auto-create-utils"
import { useToast } from "@/hooks/use-toast"
import { TourProvider } from "@/components/custom-tour"
import { cn } from "@/lib/utils"

function AddPostPage() {
  usePageTitle("Create New Post - BlazeBlog Admin")
  
  const api = useClientApi()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    status: "draft" as 'draft' | 'published' | 'archived' | 'scheduled',
    excerpt: "",
    metaDescription: "", // Added meta description field
    tags: [] as Tag[],
    featuredImage: "",
    publishDate: "",
    slug: "",
    relatedPosts: [] as Post[],
  })

  const [activeTab, setActiveTab] = useState("editor")
  // const { isFocusMode, toggleFocusMode } = useFocusMode(false)
  const [showSEOSidebar, setShowSEOSidebar] = useState(true)

  const {
    lastSaved,
    isSaving,
    isOnline,
    autoSaveEnabled
  } = useAutoSave({
    postId: 'new',
    title: formData.title,
    content: formData.content,
    heroImage: formData.featuredImage,
    categoryId: formData.categoryId,
    excerpt: formData.excerpt,
    status: formData.status
  })

  useEffect(() => {
    fetchCategories()
  }, []) // Only run once on mount

  const fetchCategories = async () => {
    try {
      const response = await api.getPaginated<Category>('/categories', {
        limit: 100,
        isActive: true
      })
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Failed to load categories')
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    // Validation for scheduled posts
    if (formData.status === 'scheduled') {
      if (!formData.publishDate) {
        setError('Please select a publish date and time for scheduled posts')
        setIsLoading(false)
        return
      }
      if (new Date(formData.publishDate) <= new Date()) {
        setError('Scheduled publish date must be in the future')
        setIsLoading(false)
        return
      }
    }

    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        metaDescription: formData.metaDescription || undefined,
        status: formData.status,
        featuredImage: formData.featuredImage || undefined,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        slug: formData.slug,
        userId: 1,
        tagIds: formData.tags.map(tag => tag.id), // Optimized: Send only tag IDs instead of full objects
        relatedPostIds: formData.relatedPosts.map(post => post.id), // Optimized: Send only post IDs instead of full objects
        publishDate: formData.status === 'scheduled' ? formData.publishDate : undefined
      }

      await api.post('/posts', postData)

      const getSuccessMessage = () => {
        switch (formData.status) {
          case 'published':
            return 'published successfully'
          case 'scheduled':
            return `scheduled for ${new Date(formData.publishDate).toLocaleDateString()} at ${new Date(formData.publishDate).toLocaleTimeString()}`
          case 'draft':
            return 'saved as draft'
          default:
            return 'saved successfully'
        }
      }

      toast({
        title: "Success!",
        description: `Post "${formData.title}" has been ${getSuccessMessage()}.`,
        variant: "default"
      })

      // Clear form data after successful save
      setFormData({
        title: "",
        content: "",
        categoryId: "",
        status: "draft",
        excerpt: "",
        metaDescription: "", // Reset meta description
        tags: [] as Tag[],
        featuredImage: "",
        publishDate: "",
        slug: "",
        relatedPosts: [],
      })

    } catch (error) {
      console.error('Error creating post:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const status = (error as any)?.status
      
      setError(errorMessage)
      
      // Show different messages based on status code
      let title = "Error"
      let description = errorMessage
      
      if (status === 400) {
        title = "Validation Error"
        description = errorMessage.includes('API Error:') 
          ? errorMessage.replace('API Error: 400 Bad Request', '').trim() || errorMessage
          : errorMessage
      } else {
        description = `Failed to save post: ${errorMessage}`
      }
      
      toast({
        title,
        description,
        variant: "destructive",
        duration: 8000
      })
    } finally {
      setIsLoading(false)
    }
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500 text-white"
      case "draft":
        return "bg-yellow-500 text-white"
      case "scheduled":
        return "bg-blue-500 text-white"
      case "archived":
        return "bg-gray-500 text-white"
      default:
        return "bg-blue-500 text-white"
    }
  }

  // SEO suggestion handlers
  const handleTitleSuggestion = (title: string) => {
    console.log('handleTitleSuggestion called with:', title)
    setFormData(prev => ({ ...prev, title }))
  }
  const handleSlugSuggestion = (slug: string) => {
    console.log('handleSlugSuggestion called with:', slug)
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
    console.log('handleExcerptSuggestion called with:', excerpt)
    setFormData(prev => ({ ...prev, excerpt }))
  }

  const handleMetaDescriptionSuggestion = (metaDescription: string) => {
    console.log('handleMetaDescriptionSuggestion called with:', metaDescription)
    setFormData(prev => ({ ...prev, metaDescription }))
  }

  return (
    <AdminLayout title="Create New Post">
      {/* Clean, professional header */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Post</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">Write and publish your content</p>
            <Badge 
              variant="outline" 
              className="text-xs h-5 px-2 font-normal"
            >
              {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Status indicators - minimal */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <ConnectivityIndicator isOnline={isOnline} />
            <AutoSaveIndicator
              lastSaved={lastSaved}
              isSaving={isSaving}
              autoSaveEnabled={autoSaveEnabled}
            />
          </div>
          
          {/* Clean button group */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSEOSidebar(!showSEOSidebar)}
              className={cn("h-9 text-muted-foreground hover:text-foreground", 
                showSEOSidebar && "bg-muted text-foreground")}
            >
              <Focus className="w-4 h-4 mr-2" />
              SEO
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="h-9 text-muted-foreground hover:text-foreground"
            >
              <a href="/admin/posts">Cancel</a>
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              size="sm" 
              disabled={isLoading || !formData.title.trim() || (formData.status === 'scheduled' && (!formData.publishDate || new Date(formData.publishDate) <= new Date()))}
              className="h-9 px-6 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 border-0"
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
          <div className={`space-y-6 ${!showSEOSidebar ? 'px-0' : ''}`}>

            {/* Editor Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 h-10" data-tour="editor-tabs">
                <TabsTrigger value="editor" className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2 text-sm" data-tour="settings-tab">
                  <Settings className="h-4 w-4" />
                  Metadata
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="mt-4">
                <div data-tour="rich-editor">
                  <AdvancedTiptapEditor
                    content={formData.content}
                    onChange={(content) => {
                      // Extract title from first paragraph
                      const tempDiv = document.createElement('div')
                      tempDiv.innerHTML = content
                      const firstP = tempDiv.querySelector('p')
                      const title = firstP?.textContent?.trim() || ''
                      
                      setFormData(prev => ({ 
                        ...prev, 
                        content,
                        title: title || prev.title // Keep existing title if first line is empty
                      }))
                    }}
                    placeholder="Title..."
                    heroImage={formData.featuredImage}
                    onHeroImageChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                    postId="new"
                    title={formData.title}
                    categoryId={formData.categoryId}
                    excerpt={formData.excerpt}
                    status={formData.status}
                    enableAutoSave={autoSaveEnabled}
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <PostPreview title={formData.title} content={formData.content} excerpt={formData.excerpt} />
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="space-y-6 max-w-4xl">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Publishing Settings */}
                    <Card data-tour="publish-settings">
                      <CardHeader>
                        <CardTitle>Publish Settings</CardTitle>
                        <CardDescription>
                          {formData.status === 'draft' && 'Save as draft to work on later'}
                          {formData.status === 'published' && 'Publish immediately when saved'}
                          {formData.status === 'scheduled' && 'Schedule for automatic publishing'}
                          {formData.status === 'archived' && 'Archive this post'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: 'draft' | 'published' | 'archived' | 'scheduled') => setFormData(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Publish Now</SelectItem>
                              <SelectItem value="scheduled">Schedule for Later</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={formData.categoryId}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {formData.status === 'scheduled' && (
                          <div className="space-y-2">
                            <Label htmlFor="publishDate" className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Schedule Date & Time</span>
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            </Label>
                            <Input
                              id="publishDate"
                              type="datetime-local"
                              value={formData.publishDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                              min={new Date().toISOString().slice(0, 16)}
                              className={!formData.publishDate ? 'border-red-300 focus:border-red-500' : ''}
                            />
                            <p className="text-xs text-muted-foreground">
                              {formData.publishDate ? (
                                `Post will be published on ${new Date(formData.publishDate).toLocaleDateString()} at ${new Date(formData.publishDate).toLocaleTimeString()}`
                              ) : (
                                'Select when you want this post to be automatically published'
                              )}
                            </p>
                            {formData.publishDate && new Date(formData.publishDate) <= new Date() && (
                              <p className="text-xs text-red-500">⚠️ Selected date must be in the future</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const tomorrow = new Date()
                                  tomorrow.setDate(tomorrow.getDate() + 1)
                                  tomorrow.setHours(9, 0, 0, 0)
                                  setFormData(prev => ({ ...prev, publishDate: tomorrow.toISOString().slice(0, 16) }))
                                }}
                                className="text-xs hover:bg-gray-100"
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
                                  setFormData(prev => ({ ...prev, publishDate: sixHours.toISOString().slice(0, 16) }))
                                }}
                                className="text-xs hover:bg-gray-100"
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
                                  setFormData(prev => ({ ...prev, publishDate: twoDays.toISOString().slice(0, 16) }))
                                }}
                                className="text-xs hover:bg-gray-100"
                              >
                                2 Days
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* SEO Settings */}
                    <Card data-tour="seo-settings">
                      <CardHeader>
                        <CardTitle>SEO Settings</CardTitle>
                        <CardDescription>Optimize your post for search engines</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Label htmlFor="slug">URL Slug</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangle className="h-4 w-4 text-amber-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="font-semibold text-amber-600">⚠️ URL Impact Warning</p>
                                  <p className="text-sm mt-1">
                                    Changing the slug affects the post URL (/posts/your-slug). 
                                    This may break existing bookmarks, social media shares, 
                                    and SEO rankings if the post is already published.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
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
                        <BookOpen className="h-5 w-5" />
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
                    selectedPosts={formData.relatedPosts}
                    onChange={(posts) => setFormData(prev => ({ ...prev, relatedPosts: posts }))}
                    maxSelection={5}
                  />

                  {/* Post Statistics */}
                  <Card className="mt-6 max-w-4xl">
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

        {/* SEO Suggestions Sidebar - Only show when enabled */}
        {showSEOSidebar && (
          <div className="w-full lg:w-72 flex-shrink-0">
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
      {/* End flex container */}

      {/* DraftRecoveryDialog
      <DraftRecoveryDialog
        isOpen={showDraftDialog}
        onClose={() => setShowDraftDialog(false)}
        drafts={availableDrafts}
        onRecover={handleDraftRecover}
        onDelete={handleDeleteDraft}
      />
      */}
    </AdminLayout>
  )
}

// Wrap the component with the tour provider
function AddPostPageWithTour() {
  return (
    <TourProvider>
      <AddPostPage />
    </TourProvider>
  )
}

export default AddPostPageWithTour
