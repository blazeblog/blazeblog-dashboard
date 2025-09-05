"use client"

import React, { useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { useClientApi } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

const EditorJsEditor = dynamic(() => import("@/components/editorjs-editor"), { ssr: false })

interface PostEditorProps {
  title: string
  content: string
  featuredImage: string
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  onFeaturedImageChange: (url: string) => void
  titlePlaceholder?: string
}

export function PostEditor({
  title,
  content,
  featuredImage,
  onTitleChange,
  onContentChange,
  onFeaturedImageChange,
  titlePlaceholder = "Post title",
}: PostEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const api = useClientApi()
  const { toast } = useToast()

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("image", file)
      const response = await api.post("/file/upload", formData)
      if (response?.url) {
        onFeaturedImageChange(response.url)
        toast({
          title: "Success",
          description: "Feature image uploaded successfully",
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Feature Image Upload Area */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
{featuredImage ? (
          <div className="relative group mb-4">
            <div className="text-xs text-muted-foreground mb-2">Feature Image</div>
            <img 
              src={featuredImage} 
              alt="Feature image" 
              className="w-full max-w-md h-48 object-cover rounded-lg border"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onFeaturedImageChange("")}
              className="absolute top-8 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-foreground mb-4"
            onClick={handleFileSelect}
          >
            <Plus className="h-4 w-4" />
            Add feature image
          </Button>
        )}
      </div>

      {/* Title Input */}
      <div>
        <Textarea
          placeholder={titlePlaceholder}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-4xl font-bold border-0 px-0 py-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent resize-none min-h-0 overflow-hidden"
          style={{ 
            fontSize: '2.25rem', 
            lineHeight: '1.2',
            fontWeight: '700',
            height: 'auto',
            minHeight: '3rem'
          }}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = '3rem'
            target.style.height = Math.max(48, target.scrollHeight) + 'px'
          }}
        />
      </div>

      {/* Content Editor */}
      <div className="min-h-[600px] bg-background">
        <EditorJsEditor
          content={content}
          onChange={onContentChange}
          placeholder=""
          className=""
        />
      </div>
    </div>
  )
}
