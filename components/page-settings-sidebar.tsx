"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface PageFormData {
  title: string
  content: string
  excerpt: string
  slug: string
  status: "draft" | "published" | "scheduled"
  featuredImage: string
  metaDescription: string
  publishDate: string
  isFeatured: boolean
}

interface PageSettingsSidebarProps {
  formData: PageFormData
  setFormData: React.Dispatch<React.SetStateAction<PageFormData>>
}

export function PageSettingsSidebar({ formData, setFormData }: PageSettingsSidebarProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-4">
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

      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <span className="text-sm">⭐</span>
          <span className="text-sm font-medium">Feature this page</span>
        </div>
        <button
          onClick={() => setFormData(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
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
    </div>
  )
}

