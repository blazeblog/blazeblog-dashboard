"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useClientApi, type Category, type Post, type PostRevision, type Tag, type RelatedPost } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"
import { Save, X, FileText, Settings, Eye, ArrowLeft, Trash2, Activity, Info, Focus, BookOpen, AlertTriangle } from "lucide-react"

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
import { RevisionList } from "@/components/revision-list"
import { RevisionDiffViewer } from "@/components/revision-diff-viewer"
import { TagsInput } from "@/components/tags-input"
import { SEOSuggestionsSidebar } from "@/components/seo-suggestions-sidebar"
import { RelatedPostsSelector } from "@/components/related-posts-selector"
// import { FocusModeToggle, FocusModeContext, useFocusMode } from "@/components/focus-mode-toggle"
import { generateSlug, generateMetaDescription, ensureTagsExist, suggestTagsFromContent } from "@/lib/auto-create-utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const api = useClientApi()
  const { toast } = useToast()

  const [post, setPost] = useState<Post | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    status: "draft" as 'draft' | 'published' | 'archived',
    excerpt: "",
    metaDescription: "", // Added meta description field
    featuredImage: "",
    slug: "",
    tags: [] as Tag[],
    relatedPosts: [] as Post[], // Add this if not present
  })

  const [activeTab, setActiveTab] = useState("editor")
  
  // Revision state
  const [selectedRevision, setSelectedRevision] = useState<PostRevision | null>(null)
  const [showDiffViewer, setShowDiffViewer] = useState(false)
  const [diffRevisions, setDiffRevisions] = useState<{rev1: PostRevision, rev2: PostRevision} | null>(null)
  const [revisionCount, setRevisionCount] = useState<number>(0)
  // const { isFocusMode, toggleFocusMode, setFocusMode } = useFocusMode(false)
  const [showSEOSidebar, setShowSEOSidebar] = useState(true)

  useEffect(() => {
    Promise.all([fetchPost(), fetchCategories()])
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await api.get<Post>(`/posts/${postId}`)
      setPost(response)
      
      // Extract related posts from the API response
      // The API returns relatedPosts array with nested relatedPost objects
      let relatedPosts: Post[] = []
      if (response.relatedPosts && Array.isArray(response.relatedPosts)) {
        relatedPosts = response.relatedPosts
          .sort((a: any, b: any) => a.sortOrder - b.sortOrder) // Sort by sortOrder
          .map((rel: any) => rel.relatedPost) // Extract the actual post data
          .filter(Boolean) // Remove any null/undefined entries
      }
      
      setFormData(prev => ({
        ...prev,
        title: response.title,
        content: response.content,
        categoryId: response.categoryId?.toString() || "",
        status: response.status,
        excerpt: response.excerpt || "",
        metaDescription: response.excerpt || "", // Use excerpt as meta description for now
        featuredImage: response.featuredImage || "",
        slug: generateSlug(response.title),
        tags: response.tags?.map(tag => ({ 
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          createdAt: new Date().toISOString(),
          postCount: 0
        })) || [],
        relatedPosts, 
      }))
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to load post')
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    setError("")
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
        tagIds: formData.tags.map(tag => tag.id), // Optimized: Send only tag IDs instead of full objects
        relatedPostIds: formData.relatedPosts.map(post => post.id), // Optimized: Send only post IDs instead of full objects
      }
      await api.put(`/posts/${postId}`, postData)
      toast({
        title: "Success!",
        description: `Post "${formData.title}" has been updated successfully.`,
        variant: "default"
      })
    } catch (error) {
      console.error('Error updating post:', error)
      
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
        description = `Failed to update post: ${errorMessage}`
      }
      
      toast({
        title,
        description,
        variant: "destructive",
        duration: 8000
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/posts/${postId}`)
      
      toast({
        title: "Success!",
        description: `Post "${post?.title}" has been deleted successfully.`,
        variant: "default"
      })
      
      // After deletion, redirect to posts list is appropriate
      router.push('/admin/posts')
      
    } catch (error) {
      console.error('Error deleting post:', error)
      setError('Failed to delete post. Please try again.')
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Revision handlers
  const handleRevisionSelect = (revision: PostRevision) => {
    setSelectedRevision(revision)
    setShowDiffViewer(false)
  }

  const handleRevisionRestore = async (revision: PostRevision) => {
    setFormData(prev => ({
      ...prev,
      title: revision.title,
      content: revision.content,
      categoryId: revision.categoryId?.toString() || "",
      status: revision.status,
      excerpt: revision.excerpt || "",
      featuredImage: "",
      slug: generateSlug(revision.title),
      tags: [],
      relatedPosts: [],
    }))
    setActiveTab("editor")
    await fetchPost()
  }

  const handleRevisionCompare = (revision1: PostRevision, revision2: PostRevision) => {
    setDiffRevisions({ rev1: revision1, rev2: revision2 })
    setShowDiffViewer(true)
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
  const handleTitleSuggestion = (title: string) => {
    console.log('handleTitleSuggestion called with:', title)
    setFormData(prev => ({ ...prev, title }))
  }
  const handleSlugSuggestion = (slug: string) => {
    console.log('handleSlugSuggestion called with:', slug)
    setFormData(prev => ({ ...prev, slug }))
  }

  const handleTagSuggestions = (tagNames: string[]) => {
    ensureTagsExist(tagNames, { api, toast }).then(newTags => {
      const uniqueTags = [...formData.tags]
      newTags.forEach(tag => {
        if (!uniqueTags.find(t => t.id === tag.id)) {
          uniqueTags.push(tag)
        }
      })
      setFormData(prev => ({ ...prev, tags: uniqueTags.slice(0, 10) }))
    })
  }

  const handleExcerptSuggestion = (excerpt: string) => {
    console.log('handleExcerptSuggestion called with:', excerpt)
    setFormData(prev => ({ ...prev, excerpt }))
  }

  const handleMetaDescriptionSuggestion = (metaDescription: string) => {
    console.log('handleMetaDescriptionSuggestion called with:', metaDescription)
    setFormData(prev => ({ ...prev, metaDescription }))
  }

  if (isLoading) {
    return (
      <AdminLayout title="Edit Post">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading post...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!post) {
    return (
      <AdminLayout title="Edit Post">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Post not found</p>
          <Button asChild className="mt-4">
            <a href="/admin/posts">Back to Posts</a>
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Edit Post">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <a href="/admin/posts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </a>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Post</h2>
            <p className="text-muted-foreground">Update your content</p>
          </div>
          <Badge className={getStatusColor(formData.status)}>
            {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the post.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/posts">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </a>
          </Button>
          <Button onClick={handleSubmit} size="sm" disabled={isSaving || !formData.title.trim()}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Update Post'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className={`flex flex-col lg:flex-row gap-6`}>
        {/* Main Content */}
        <div className={`flex-1 min-w-0 ${!showSEOSidebar ? 'w-full max-w-none px-0' : ''}`}>
          <div className={`space-y-6 ${!showSEOSidebar ? 'px-0' : ''}`}>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TooltipProvider>
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
                  {/* <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="revisions" className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Revisions
                        {revisionCount > 0 && (
                          <Badge variant="secondary" className="text-xs h-5 min-w-[20px] px-1 ml-1">
                            {revisionCount}
                          </Badge>
                        )}
                        <Info className="h-3 w-3 ml-1 text-muted-foreground" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View revision history, compare versions, and restore previous versions</p>
                    </TooltipContent>
                  </Tooltip> */}
                </TabsList>
              </TooltipProvider>

              <TabsContent value="editor" className="mt-4">
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
                  placeholder="Start with your title..."
                  heroImage={formData.featuredImage}
                  onHeroImageChange={(url) => setFormData({ ...formData, featuredImage: url })}
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <PostPreview title={formData.title} content={formData.content} excerpt={formData.excerpt} />
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="grid gap-6 lg:grid-cols-2 max-w-4xl">
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
                    </CardContent>
                  </Card>

                  <Card>
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
                                  and SEO rankings if already published.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="slug"
                          placeholder="url-friendly-slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">URL: /posts/{formData.slug}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <Textarea
                          id="metaDescription"
                          placeholder="Brief description for SEO and social sharing..."
                          rows={3}
                          value={formData.metaDescription}
                          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">{formData.metaDescription.length}/160 characters</p>
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
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      />
                    </CardHeader>
                  </Card>

                {/* Related Posts */}
                <RelatedPostsSelector
                  currentPostId={parseInt(postId)}
                  selectedPosts={formData.relatedPosts}
                  onChange={(posts) => setFormData(prev => ({ ...prev, relatedPosts: posts }))}
                  maxSelection={5}
                />

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

              <TabsContent value="revisions" className="mt-4">
                {showDiffViewer && diffRevisions ? (
                  <RevisionDiffViewer
                    postId={postId}
                    revision1={diffRevisions.rev1}
                    revision2={diffRevisions.rev2}
                    onClose={() => {
                      setShowDiffViewer(false)
                      setDiffRevisions(null)
                    }}
                    onRestore={handleRevisionRestore}
                    className="h-[800px]"
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RevisionList
                      postId={postId}
                      onRevisionSelect={handleRevisionSelect}
                      onRevisionRestore={handleRevisionRestore}
                      onRevisionCompare={handleRevisionCompare}
                      onRevisionCountChange={setRevisionCount}
                      className="h-[800px]"
                    />
                    
                    {selectedRevision && (
                      <Card className="h-[800px]">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Revision v{selectedRevision.versionNumber}
                          </CardTitle>
                          <CardDescription>
                            {selectedRevision.creator?.username || 'Unknown'} • {selectedRevision.createdAt}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Title</h4>
                            <p className="text-sm bg-muted p-3 rounded-md">{selectedRevision.title}</p>
                          </div>
                          
                          {selectedRevision.excerpt && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Excerpt</h4>
                              <p className="text-sm bg-muted p-3 rounded-md">{selectedRevision.excerpt}</p>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Content Preview</h4>
                            <div 
                              className="text-sm bg-muted p-3 rounded-md prose prose-sm max-w-none overflow-auto max-h-[400px]"
                              dangerouslySetInnerHTML={{ __html: selectedRevision.content }}
                            />
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <Button
                              type="button"
                              onClick={() => handleRevisionRestore(selectedRevision)}
                              className="flex-1"
                            >
                              Restore This Version
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                if (diffRevisions?.rev1.id !== selectedRevision.id) {
                                  // Find current version for comparison
                                  const currentRevision = { ...selectedRevision, versionNumber: 999 } as PostRevision // Mock current
                                  handleRevisionCompare(selectedRevision, currentRevision)
                                }
                              }}
                            >
                              Compare
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
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
                excerpt={formData.metaDescription} // Use metaDescription for SEO analysis
                slug={formData.slug}
                tags={formData.tags}
                featuredImage={formData.featuredImage}
                onTitleSuggestion={handleTitleSuggestion}
                onSlugSuggestion={handleSlugSuggestion}
                onTagSuggestions={handleTagSuggestions}
                onExcerptSuggestion={handleExcerptSuggestion}
                onMetaDescriptionSuggestion={handleMetaDescriptionSuggestion}
                className="space-y-4"
              />
            </div>
          </div>
        )}
      </div>
      {/* End flex container */}
    </AdminLayout>
  )
}