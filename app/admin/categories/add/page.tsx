"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClientApi } from "@/lib/client-api"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, X } from "lucide-react"

export default function AddCategoryPage() {
  const router = useRouter()
  const api = useClientApi()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    isActive: true,
    sortOrder: 1,
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === generateSlug(prev.name) ? generateSlug(name) : prev.slug
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || undefined,
        slug: formData.slug || generateSlug(formData.name),
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      }
      
      await api.post('/categories', categoryData)
      router.push('/admin/categories')
    } catch (error) {
      console.error('Error creating category:', error)
      setError('Failed to create category. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout title="Add Category">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <a href="/admin/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </a>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Create New Category</h2>
            <p className="text-muted-foreground">Add a new category to organize your content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/categories">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </a>
          </Button>
          <Button 
            onClick={handleSubmit} 
            size="sm" 
            disabled={isLoading || !formData.name.trim()}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Creating...' : 'Create Category'}
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
            <CardDescription>Enter the basic details for your category</CardDescription>
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
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="URL-friendly identifier (auto-generated if left empty)"
              />
              <p className="text-xs text-muted-foreground">
                This will be used in URLs. Leave empty to auto-generate from name.
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
      </form>
    </AdminLayout>
  )
}