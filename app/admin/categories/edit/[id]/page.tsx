"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useClientApi, type Category } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { ArrowLeft, Save, X, Trash2, AlertTriangle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string
  const api = useClientApi()
  const { toast } = useToast()

  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    isActive: true,
    sortOrder: 1,
  })

  useEffect(() => {
    fetchCategory()
  }, [categoryId])

  const fetchCategory = async () => {
    try {
      const response = await api.get<Category>(`/categories/${categoryId}`)
      setCategory(response)
      setFormData({
        name: response.name,
        description: response.description || "",
        slug: response.slug,
        isActive: response.isActive,
        sortOrder: response.sortOrder || 1,
      })
    } catch (error) {
      console.error('Error fetching category:', error)
      setError('Failed to load category')
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    const originalSlug = category?.name ? generateSlug(category.name) : ''
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === originalSlug ? generateSlug(name) : prev.slug
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    
    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || undefined,
        slug: formData.slug,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      }
      
      await api.put(`/categories/${categoryId}`, categoryData)
      
      toast({
        title: "Success!",
        description: `Category "${formData.name}" has been updated successfully.`,
        variant: "default",
        duration: 3000
      })
      
      // Refresh the category data
      await fetchCategory()
      
    } catch (error) {
      console.error('Error updating category:', error)
      setError('Failed to update category. Please try again.')
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/categories/${categoryId}`)
      
      toast({
        title: "Success!",
        description: `Category "${category?.name}" has been deleted successfully.`,
        variant: "default",
        duration: 3000
      })
      
      // After deletion, redirect to categories list is appropriate
      router.push('/admin/categories')
      
    } catch (error) {
      console.error('Error deleting category:', error)
      setError('Failed to delete category. Please try again.')
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Edit Category">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading category...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!category) {
    return (
      <AdminLayout title="Edit Category">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Category not found</p>
          <Button asChild className="mt-4">
            <a href="/admin/categories">Back to Categories</a>
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Edit Category">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <a href="/admin/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </a>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Category</h2>
            <p className="text-muted-foreground">Update category information</p>
          </div>
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
                  This action cannot be undone. This will permanently delete the category
                  and may affect posts that belong to this category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Category'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/categories">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </a>
          </Button>
          <Button 
            onClick={handleSubmit} 
            size="sm" 
            disabled={isSaving || !formData.name.trim()}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Update Category'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update the basic details for your category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="slug">Slug</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="h-4 w-4 text-amber-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold text-amber-600">⚠️ URL Impact Warning</p>
                      <p className="text-sm mt-1">
                        Changing the slug affects the category URL (/categories/your-slug). 
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
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="URL-friendly identifier"
              />
              <p className="text-xs text-muted-foreground">
                URL: /categories/{formData.slug}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure category settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  When active, this category will be available for posts
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })}
                min="1"
                placeholder="Sort order (lower numbers appear first)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Statistics</CardTitle>
            <CardDescription>Information about this category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-lg">{category.posts?.length || 0}</div>
                <div className="text-muted-foreground">Posts</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-lg">
                  {new Date(category.createdAt).toLocaleDateString()}
                </div>
                <div className="text-muted-foreground">Created</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </AdminLayout>
  )
}