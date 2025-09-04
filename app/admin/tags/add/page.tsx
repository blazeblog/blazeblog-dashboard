"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClientApi } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, X, AlertTriangle, Hash } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function AddTagPage() {
  const router = useRouter()
  const api = useClientApi()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    isActive: true,
    sortOrder: 1,
    color: "#3b82f6", // Default blue color
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
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Tag name is required')
      }

      const slug = formData.slug.trim() || generateSlug(formData.name)

      // Create the tag
      const response = await api.post('/tags', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        slug: slug,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
        color: formData.color,
      })

      toast({
        title: "Success!",
        description: "Tag created successfully",
      })

      // Redirect to tags list
      router.push('/admin/tags')

    } catch (err: any) {
      console.error('Error creating tag:', err)
      const errorMessage = err.message || err.error?.message || 'Failed to create tag'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/tags')
  }

  return (
    <AdminLayout title="Add Tag">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Add a new tag to organize your content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/tags">
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
            {isLoading ? 'Creating...' : 'Create Tag'}
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
              <CardDescription>
                Enter the basic details for your tag
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tag Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter tag name"
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
                  placeholder="URL-friendly identifier (auto-generated if left empty)"
                />
                <p className="text-xs text-muted-foreground">
                  URL: /tags/{formData.slug || 'your-slug'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this tag"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure tag settings and appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    When active, this tag will be available for posts
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
