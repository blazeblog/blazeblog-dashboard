"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useClientApi, type Category, type Post } from "@/lib/client-api"
import { Save, X, FileText, Settings, Eye, ArrowLeft, Trash2 } from "lucide-react"

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
    featuredImage: "",
  })

  const [activeTab, setActiveTab] = useState("editor")

  useEffect(() => {
    Promise.all([fetchPost(), fetchCategories()])
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await api.get<Post>(`/posts/${postId}`)
      setPost(response)
      setFormData({
        title: response.title,
        content: response.content,
        categoryId: response.categoryId?.toString() || "",
        status: response.status,
        excerpt: response.excerpt || "",
        featuredImage: response.featuredImage || "",
      })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    
    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        status: formData.status,
        featuredImage: formData.featuredImage || undefined,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
      }
      
      await api.put(`/posts/${postId}`, postData)
      router.push('/admin/posts')
    } catch (error) {
      console.error('Error updating post:', error)
      setError('Failed to update post. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/posts/${postId}`)
      router.push('/admin/posts')
    } catch (error) {
      console.error('Error deleting post:', error)
      setError('Failed to delete post. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500"
      case "draft":
        return "bg-yellow-500"
      case "archived":
        return "bg-gray-500"
      default:
        return "bg-blue-500"
    }
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
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
                </CardContent>
              </Card>
            </div>

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
      </form>
    </AdminLayout>
  )
}