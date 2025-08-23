"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useClientApi, type Tag } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"
import { usePageTitle } from "@/hooks/use-page-title"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { ArrowLeft, Save, Trash2, AlertTriangle, Hash, FileText, Calendar, Eye, Edit, ExternalLink } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LoadingState } from "@/components/loading-state"
import { ErrorState } from "@/components/error-state"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"

export default function EditTagPage() {
  usePageTitle("Edit Tag - BlazeBlog Admin")
  
  const router = useRouter()
  const params = useParams()
  const tagId = params.id as string
  const api = useClientApi()
  const { toast } = useToast()

  const [tag, setTag] = useState<Tag | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  })

  useEffect(() => {
    fetchTag()
  }, [tagId])

  const fetchTag = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await api.get<Tag>(`/tags/${tagId}`)
      setTag(response)
      setFormData({
        name: response.name,
        slug: response.slug,
        description: response.description || "",
        isActive: response.isActive,
      })
    } catch (error) {
      console.error('Error fetching tag:', error)
      setError('Failed to load tag')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Tag name is required",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSaving(true)
      
      const updateData = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
        description: formData.description.trim() || null,
        isActive: formData.isActive,
      }

      const updatedTag = await api.patch<Tag>(`/tags/${tagId}`, updateData)
      setTag(updatedTag)
      
      toast({
        title: "Success!",
        description: "Tag updated successfully.",
        variant: "default"
      })
    } catch (error) {
      console.error('Error updating tag:', error)
      setError('Failed to update tag')
      toast({
        title: "Error",
        description: "Failed to update tag. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await api.delete(`/tags/${tagId}`)
      
      toast({
        title: "Success!",
        description: "Tag deleted successfully.",
        variant: "default"
      })
      
      router.push('/admin/tags')
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast({
        title: "Error",
        description: "Failed to delete tag. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === generateSlug(tag?.name || '') ? generateSlug(name) : prev.slug
    }))
  }

  if (isLoading) return <LoadingState message="Loading Tag Details" />
  if (error && !tag) return <ErrorState message={error} onRetry={fetchTag} />
  if (!tag) return <ErrorState message="Tag not found" />

  return (
    <AdminLayout title={`Edit Tag: ${tag.name}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/tags')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tags
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Tag</h1>
              <p className="text-muted-foreground">
                Modify tag information and URL slug
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the tag "{tag.name}"
                    and remove it from all associated posts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Tag'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Tag Information
            </CardTitle>
            <CardDescription>
              Update the tag details. Be careful when changing the slug as it affects URLs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Tag Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Tag Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter tag name"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  The display name for this tag
                </p>
              </div>

              {/* URL Slug with Warning */}
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
                          Changing the slug affects the tag URL (/tags/your-slug). 
                          This may break existing bookmarks, social media shares, 
                          and SEO rankings if already published.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                  className={formData.slug !== tag.slug ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  URL: /tags/{formData.slug || 'your-slug'}
                </p>
                {formData.slug !== tag.slug && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Slug change detected - tag URLs will be affected
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter a brief description of this tag (optional)"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Optional description to help explain what this tag is about
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive tags won't appear in public listings but remain on existing posts
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            {/* Tag Stats */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">Tag Information</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {tag.posts?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Created</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {formatDistanceToNow(new Date(tag.updatedAt))} ago
                  </div>
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    #{tag.id}
                  </div>
                  <div className="text-sm text-muted-foreground">Tag ID</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Using This Tag */}
        {tag.posts && tag.posts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Posts Using This Tag ({tag.posts.length})
              </CardTitle>
              <CardDescription>
                All posts currently using this tag. Click on any post to edit it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tag.posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => router.push(`/admin/posts/edit/${post.id}`)}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{post.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`/posts/${post.id}`, '_blank')
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Posts Message */}
        {tag.posts && tag.posts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Posts Using This Tag</h3>
              <p className="text-muted-foreground mb-4">
                This tag hasn't been used on any posts yet.
              </p>
              <Button onClick={() => router.push('/admin/posts/add')} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Create New Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}