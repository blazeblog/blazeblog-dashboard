"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClientApi, type Category, type Tag } from "@/lib/client-api"
import { Save, X, FileText, Settings, Eye, ArrowLeft, Focus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { AdvancedTiptapEditor } from "@/components/advanced-tiptap-editor"
import { PostPreview } from "@/components/post-preview"
import { useAutoSave } from "@/hooks/use-auto-save"
import { DraftRecoveryDialog } from "@/components/draft-recovery-dialog"
import { AutoSaveIndicator } from "@/components/auto-save-indicator"
import { ConnectivityIndicator } from "@/components/connectivity-indicator"
import { TagsInput } from "@/components/tags-input"
import { SEOSuggestionsSidebar } from "@/components/seo-suggestions-sidebar"
// import { FocusModeToggle, FocusModeContext, useFocusMode } from "@/components/focus-mode-toggle"
import { generateSlug, ensureTagsExist } from "@/lib/auto-create-utils"
import { useToast } from "@/hooks/use-toast"
import type { DraftPost } from "@/lib/indexeddb"

export default function AddPostPage() {
  const router = useRouter()
  const api = useClientApi()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [availableDrafts, setAvailableDrafts] = useState<DraftPost[]>([])
  const [showDraftDialog, setShowDraftDialog] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    status: "draft" as 'draft' | 'published' | 'archived',
    excerpt: "",
    tags: [] as Tag[],
    featuredImage: "",
    publishDate: "",
    slug: "",
  })

  const [activeTab, setActiveTab] = useState("editor")
  // const { isFocusMode, toggleFocusMode } = useFocusMode(false)
  const [showSEOSidebar, setShowSEOSidebar] = useState(true) 

  const {
    lastSaved,
    isSaving,
    isOnline,
    autoSaveEnabled,
    setAutoSaveEnabled,
    loadDraft,
    deleteDraft,
    getAllDrafts
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
    checkForDrafts()
  }, [])

  const checkForDrafts = async () => {
    const drafts = await getAllDrafts()
    if (drafts.length > 0) {
      setAvailableDrafts(drafts)
      setShowDraftDialog(true)
    }
  }

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
    
    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        status: formData.status,
        featuredImage: formData.featuredImage || undefined,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        userId: 1, // This should come from auth context
      }
      
      await api.post('/posts', postData)
      
      toast({
        title: "Success!",
        description: `Post "${formData.title}" has been ${formData.status === 'published' ? 'published' : 'saved as draft'} successfully.`,
        variant: "default"
      })
      
      // Clear form data after successful save
      setFormData({
        title: "",
        content: "",
        categoryId: "",
        status: "draft",
        excerpt: "",
        tags: [] as Tag[],
        featuredImage: "",
        publishDate: "",
        slug: "",
      })
      
    } catch (error) {
      console.error('Error creating post:', error)
      setError('Failed to create post. Please try again.')
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDraftRecover = (draft: DraftPost) => {
    setFormData({
      title: draft.title,
      content: draft.content,
      categoryId: draft.categoryId || '',
      status: draft.status,
      excerpt: draft.excerpt || '',
      tags: [] as Tag[],
      featuredImage: draft.heroImage || '',
      publishDate: '',
      slug: generateSlug(draft.title),
    })
    setShowDraftDialog(false)
  }

  const handleDeleteDraft = async (draftId: string) => {
    await deleteDraft(draftId)
    const updatedDrafts = await getAllDrafts()
    setAvailableDrafts(updatedDrafts)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500 text-white"
      case "draft":
        return "bg-yellow-500 text-white"
      case "archived":
        return "bg-gray-500 text-white"
      default:
        return "bg-blue-500 text-white"
    }
  }

  // SEO suggestion handlers
  const handleSlugSuggestion = (slug: string) => {
    setFormData({ ...formData, slug })
  }

  const handleTagSuggestions = (tagNames: string[]) => {
    ensureTagsExist(tagNames, { api, toast }).then(newTags => {
      const uniqueTags = [...formData.tags]
      newTags.forEach(tag => {
        if (!uniqueTags.find(t => t.id === tag.id)) {
          uniqueTags.push(tag)
        }
      })
      setFormData({ ...formData, tags: uniqueTags.slice(0, 10) })
    })
  }

  const handleExcerptSuggestion = (excerpt: string) => {
    setFormData({ ...formData, excerpt })
  }

  return (
    <AdminLayout title="Create New Post">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* <Button variant="ghost" asChild>
            <a href="/admin/posts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </a>
          </Button> */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Create New Post</h2>
            <p className="text-muted-foreground">Write and publish your content</p>
          </div>
          <Badge className={getStatusColor(formData.status)}>
            {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <ConnectivityIndicator isOnline={isOnline} />
          <AutoSaveIndicator 
            lastSaved={lastSaved} 
            isSaving={isSaving} 
            autoSaveEnabled={autoSaveEnabled} 
          />
          {/* Focus mode temporarily disabled */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSEOSidebar(!showSEOSidebar)}
            className={showSEOSidebar ? "bg-blue-50 text-blue-600 border-blue-200" : ""}
            title="Toggle SEO Suggestions"
          >
            <Focus className="mr-2 h-4 w-4" />
            SEO
          </Button>
          {availableDrafts.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDraftDialog(true)}
            >
              Recover Drafts ({availableDrafts.length})
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/posts">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </a>
          </Button>
          <Button onClick={handleSubmit} size="sm" disabled={isLoading || !formData.title.trim()}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Post'}
          </Button>
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
        {/* Title */}
        <Card>
          <CardContent className={`pt${!showSEOSidebar ? ' px-6' : 'px-2'}`}>
            <div className="space-y-2">
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                placeholder="Enter an engaging title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-lg font-medium"
              />
            </div>
          </CardContent>
        </Card>

        {/* Editor Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="mt-4">
            <AdvancedTiptapEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Start writing your amazing post..."
              heroImage={formData.featuredImage}
              onHeroImageChange={(url) => setFormData({ ...formData, featuredImage: url })}
              postId="new"
              title={formData.title}
              categoryId={formData.categoryId}
              excerpt={formData.excerpt}
              status={formData.status}
              enableAutoSave={autoSaveEnabled}
              onDraftRecover={handleDraftRecover}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <PostPreview title={formData.title} content={formData.content} excerpt={formData.excerpt} />
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-2 max-w-4xl">
              {/* Publishing Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Publish Settings</CardTitle>
                  <CardDescription>Configure how and when to publish</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
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
                  <div className="space-y-2">
                    <Label htmlFor="publishDate">Publish Date</Label>
                    <Input
                      id="publishDate"
                      type="datetime-local"
                      value={formData.publishDate}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    />
                  </div>
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
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">URL: /posts/{formData.slug}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Meta Description</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Brief description for SEO and social sharing..."
                      rows={3}
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">{formData.excerpt.length}/160 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags (max 10)</Label>
                    <TagsInput
                      value={formData.tags}
                      onChange={(tags) => setFormData({ ...formData, tags })}
                      maxTags={10}
                      placeholder="Add relevant tags..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Post Statistics */}
            <Card className="mt-6 max-w-4xl">
              <CardHeader>
                <CardTitle>Post Statistics</CardTitle>
                <CardDescription>Overview of your post content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border">
                    <div className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                      {
                        formData.content
                          .replace(/<[^>]*>/g, "")
                          .split(" ")
                          .filter((word) => word.length > 0).length
                      }
                    </div>
                    <div className="text-muted-foreground font-medium">Words</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg border">
                    <div className="font-bold text-2xl text-green-600 dark:text-green-400">{formData.content.replace(/<[^>]*>/g, "").length}</div>
                    <div className="text-muted-foreground font-medium">Characters</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg border">
                    <div className="font-bold text-2xl text-purple-600 dark:text-purple-400">
                      {Math.ceil(formData.content.replace(/<[^>]*>/g, "").split(" ").length / 200)}
                    </div>
                    <div className="text-muted-foreground font-medium">Min read</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg border">
                    <div className="font-bold text-2xl text-orange-600 dark:text-orange-400">{(formData.content.match(/<h[1-6][^>]*>/g) || []).length}</div>
                    <div className="text-muted-foreground font-medium">Headings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>

      {/* SEO Suggestions Sidebar - Only show when enabled */}
      {showSEOSidebar && (
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-4 max-h-screen overflow-y-auto">
            <SEOSuggestionsSidebar
              title={formData.title}
              content={formData.content}
              excerpt={formData.excerpt}
              slug={formData.slug}
              tags={formData.tags}
              featuredImage={formData.featuredImage}
              onSlugSuggestion={handleSlugSuggestion}
              onTagSuggestions={handleTagSuggestions}
              onExcerptSuggestion={handleExcerptSuggestion}
              className="space-y-4"
            />
          </div>
        </div>
      )}
      </div>
      {/* End flex container */}

      <DraftRecoveryDialog
        isOpen={showDraftDialog}
        onClose={() => setShowDraftDialog(false)}
        drafts={availableDrafts}
        onRecover={handleDraftRecover}
        onDelete={handleDeleteDraft}
      />
    </AdminLayout>
  )
}
