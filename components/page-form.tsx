"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClientApi, type Post } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"
import { useAutoSave } from "@/hooks/use-auto-save"
import { PageLayout } from "@/components/page-layout"
import { PostEditor } from "@/components/post-editor"
import { PageSettingsSidebar } from "@/components/page-settings-sidebar"
import { generateSlug } from "@/lib/auto-create-utils"

interface PageFormProps {
  mode: "add" | "edit"
  pageId?: number
  initialData?: Partial<Post>
}

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

export function PageForm({ mode, pageId, initialData }: PageFormProps) {
  const router = useRouter()
  const api = useClientApi()
  const { toast } = useToast()

  const [formData, setFormData] = useState<PageFormData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    slug: initialData?.slug || "",
    status: (initialData?.status as any) || "draft",
    featuredImage: initialData?.featuredImage || "",
    metaDescription: initialData?.metaDescription || "",
    publishDate: initialData?.publishDate || "",
    isFeatured: initialData?.featuredImage ? true : false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { lastSaved, isSaving, isOnline, autoSaveEnabled } = useAutoSave({
    postId: mode === "edit" ? pageId?.toString() || "new" : "new",
    title: formData.title,
    content: formData.content,
    heroImage: formData.featuredImage,
    categoryId: "",
    excerpt: formData.excerpt,
    status: formData.status
  })

  useEffect(() => {
    if (mode === "edit" && pageId && !initialData) {
      loadPage()
    }
  }, [mode, pageId])

  const loadPage = async () => {
    if (!pageId) return
    try {
      setIsLoading(true)
      const page = await api.get<Post>(`/posts/${pageId}?isPage=true`)
      setFormData({
        title: page.title,
        content: page.content,
        excerpt: page.excerpt || "",
        slug: page.slug || "",
        status: page.status as any,
        featuredImage: page.featuredImage || "",
        metaDescription: page.metaDescription || "",
        publishDate: page.publishDate || "",
        isFeatured: page.featuredImage ? true : false,
      })
    } catch (error) {
      toast({ title: "Error", description: "Failed to load page", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (overrideStatus?: "draft" | "published" | "scheduled") => {
    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const finalStatus = overrideStatus || formData.status
      const data = {
        isPage: true,
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        metaDescription: formData.metaDescription || undefined,
        status: finalStatus,
        featuredImage: formData.featuredImage || undefined,
        slug: formData.slug,
        publishedAt: finalStatus === 'scheduled' ? formData.publishDate : undefined,
      }

      let result
      if (mode === "add") {
        result = await api.post('/posts', data)
        toast({ title: "Success", description: "Page created successfully", duration: 3000 })
      } else {
        result = await api.put(`/posts/${pageId}`, data)
        toast({ title: "Success", description: "Page updated successfully", duration: 3000 })
      }

      if (overrideStatus) {
        setFormData(prev => ({ ...prev, status: overrideStatus }))
      }

      if (finalStatus === "published") {
        router.push(`/admin/pages`)
      } else {
        const redirectId = mode === "edit" ? pageId : result.id
        router.push(`/admin/pages/edit/${redirectId}`)
      }
    } catch (error: any) {
      setError(error.message || `Failed to ${mode === "add" ? "create" : "update"} page`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (formData.title && (!formData.slug || mode === "add")) {
      const newSlug = generateSlug(formData.title)
      setFormData(prev => ({ ...prev, slug: newSlug }))
    }
  }, [formData.title, formData.slug, mode])

  const handlePreview = async () => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required for preview", variant: "destructive" })
      return
    }
    try {
      setIsLoading(true)
      const data = {
        isPage: true,
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        metaDescription: formData.metaDescription || undefined,
        status: "draft",
        featuredImage: formData.featuredImage || undefined,
        slug: formData.slug,
      }
      const response = await api.post('/posts/preview', data)
      if (response?.previewUrl) {
        window.open(`/admin/posts/preview?url=${encodeURIComponent(response.previewUrl)}`, '_blank')
      } else {
        toast({ title: "Error", description: "Failed to generate preview", variant: "destructive" })
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate preview", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout
      title={formData.title || "Untitled Page"}
      status={formData.status}
      mode={mode}
      onPreview={handlePreview}
      onPublish={handleSubmit}
      onStatusChange={(status) => setFormData(prev => ({ ...prev, status }))}
      isLoading={isLoading}
      isOnline={isOnline}
      isSaving={isSaving}
      lastSaved={lastSaved}
      autoSaveEnabled={autoSaveEnabled}
      sidebar={<PageSettingsSidebar formData={formData} setFormData={setFormData} />}
    >
      <PostEditor
        titlePlaceholder="Page title"
        title={formData.title}
        content={formData.content}
        featuredImage={formData.featuredImage}
        onTitleChange={(title) => setFormData(prev => ({ ...prev, title }))}
        onContentChange={(content) => setFormData(prev => ({ ...prev, content }))}
        onFeaturedImageChange={(featuredImage) => setFormData(prev => ({ ...prev, featuredImage }))}
      />
    </PageLayout>
  )
}
