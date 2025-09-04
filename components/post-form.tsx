"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useClientApi, type Category, type Post, type Tag } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"
import { useAutoSave } from "@/hooks/use-auto-save"
import { PostLayout } from "@/components/post-layout"
import { PostEditor } from "@/components/post-editor"
import { PostSettingsSidebar } from "@/components/post-settings-sidebar"
import { generateSlug, ensureTagsExist } from "@/lib/auto-create-utils"

interface PostFormProps {
  mode: "add" | "edit"
  postId?: number
  initialData?: Partial<Post>
}

interface PostFormData {
  title: string
  content: string
  excerpt: string
  slug: string
  status: "draft" | "published" | "scheduled"
  categoryId: number | ""
  tags: Tag[]
  featuredImage: string
  metaDescription: string
  publishDate: string
  relatedPosts: { id: number; title: string; slug?: string | null }[]
  isFeatured: boolean
}

export function PostForm({ mode, postId, initialData }: PostFormProps) {
  const router = useRouter()
  const api = useClientApi()
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    slug: initialData?.slug || "",
    status: (initialData?.status as any) || "draft",
    categoryId: initialData?.categoryId || "",
    tags: initialData?.tags || [],
    featuredImage: initialData?.featuredImage || "",
    metaDescription: initialData?.metaDescription || "",
    publishDate: initialData?.publishDate || "",
    relatedPosts: initialData?.relatedPosts?.map(rp => rp.relatedPost) || [],
    isFeatured: initialData?.featuredImage ? true : false,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Auto-save functionality
  const {
    lastSaved,
    isSaving,
    isOnline,
    autoSaveEnabled
  } = useAutoSave({
    postId: mode === "edit" ? postId?.toString() || "new" : "new",
    title: formData.title,
    content: formData.content,
    heroImage: formData.featuredImage,
    categoryId: formData.categoryId?.toString() || "",
    excerpt: formData.excerpt,
    status: formData.status
  })

  // Load initial data for edit mode
  useEffect(() => {
    if (mode === "edit" && postId && !initialData) {
      loadPost()
    }
    loadCategories()
  }, [mode, postId])

  const loadPost = async () => {
    if (!postId) return
    
    try {
      setIsLoading(true)
      const post = await api.get<Post>(`/posts/${postId}`)
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        slug: post.slug || "",
        status: post.status as any,
        categoryId: post.categoryId || "",
        tags: post.tags || [],
        featuredImage: post.featuredImage || "",
        metaDescription: post.metaDescription || "",
        publishDate: post.publishDate || "",
        relatedPosts: post.relatedPosts?.map(rp => rp.relatedPost) || [],
        isFeatured: post.featuredImage ? true : false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await api.getPaginated<Category>('/categories', { limit: 100 })
      console.log('Categories loaded:', response.data)
      setCategories(response.data)
    } catch (error) {
      console.error('Error loading categories:', error)
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

      const tagsWithIds = await ensureTagsExist(formData.tags.map(t => t.name), { api, toast })

      const finalStatus = overrideStatus || formData.status

      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        metaDescription: formData.metaDescription || undefined,
        status: finalStatus,
        featuredImage: formData.featuredImage || undefined,
        categoryId: formData.categoryId && formData.categoryId !== "" ? Number(formData.categoryId) : undefined,
        slug: formData.slug,
        tagIds: tagsWithIds.map(tag => tag.id),
        relatedPostIds: formData.relatedPosts.map(post => post.id),
        publishedAt: finalStatus === 'scheduled' ? formData.publishDate : undefined
      }

      let result
      if (mode === "add") {
        result = await api.post('/posts', postData)
        toast({
          title: "Success",
          description: "Post created successfully",
          duration: 3000,
        })
      } else {
        result = await api.put(`/posts/${postId}`, postData)
        toast({
          title: "Success", 
          description: "Post updated successfully",
          duration: 3000,
        })
      }

      // Update local state to reflect the change
      if (overrideStatus) {
        setFormData(prev => ({ ...prev, status: overrideStatus }))
      }

      if (finalStatus === "published") {
        router.push(`/admin/posts`)
      } else {
        const redirectId = mode === "edit" ? postId : result.id
        router.push(`/admin/posts/edit/${redirectId}`)
      }
    } catch (error: any) {
      setError(error.message || `Failed to ${mode === "add" ? "create" : "update"} post`)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && (!formData.slug || mode === "add")) {
      const newSlug = generateSlug(formData.title)
      setFormData(prev => ({ ...prev, slug: newSlug }))
    }
  }, [formData.title, formData.slug, mode])

  // SEO suggestion handlers
  const handleTitleSuggestion = (title: string) => {
    setFormData(prev => ({ ...prev, title }))
  }

  const handleSlugSuggestion = (slug: string) => {
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
    setFormData(prev => ({ ...prev, excerpt }))
  }

  const handleMetaDescriptionSuggestion = (metaDescription: string) => {
    setFormData(prev => ({ ...prev, metaDescription }))
  }

  const handlePreview = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required for preview",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const tagsWithIds = await ensureTagsExist(formData.tags.map(t => t.name), { api, toast })

      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        metaDescription: formData.metaDescription || undefined,
        status: "draft", // Always preview as draft
        featuredImage: formData.featuredImage || undefined,
        categoryId: formData.categoryId && formData.categoryId !== "" ? Number(formData.categoryId) : undefined,
        slug: formData.slug,
        tagIds: tagsWithIds.map(tag => tag.id),
        relatedPostIds: formData.relatedPosts.map(post => post.id),
      }

      const response = await api.post('/posts/preview', postData)
      
      if (response?.previewUrl) {
        window.open(`/admin/posts/preview?url=${encodeURIComponent(response.previewUrl)}`, '_blank')
      } else {
        toast({
          title: "Error",
          description: "Failed to generate preview",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate preview",
        variant: "destructive",
      })
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
    <>
      <PostLayout
        title={formData.title || "Untitled Post"}
        status={formData.status}
        publishDate={formData.publishDate}
        mode={mode}
        onPreview={handlePreview}
        onPublish={handleSubmit}
        onStatusChange={(status) => setFormData(prev => ({ ...prev, status }))}
        onSchedule={(date) => setFormData(prev => ({ ...prev, publishDate: date }))}
        isLoading={isLoading}
        isOnline={isOnline}
        isSaving={isSaving}
        lastSaved={lastSaved}
        autoSaveEnabled={autoSaveEnabled}
        sidebar={
          <PostSettingsSidebar
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            postId={postId}
            onTitleSuggestion={handleTitleSuggestion}
            onSlugSuggestion={handleSlugSuggestion}
            onTagSuggestions={handleTagSuggestions}
            onExcerptSuggestion={handleExcerptSuggestion}
            onMetaDescriptionSuggestion={handleMetaDescriptionSuggestion}
          />
        }
      >
        <PostEditor
          title={formData.title}
          content={formData.content}
          featuredImage={formData.featuredImage}
          onTitleChange={(title) => setFormData(prev => ({ ...prev, title }))}
          onContentChange={(content) => setFormData(prev => ({ ...prev, content }))}
          onFeaturedImageChange={(featuredImage) => setFormData(prev => ({ ...prev, featuredImage }))}
        />
      </PostLayout>
    </>
  )
}
