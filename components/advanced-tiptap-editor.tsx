"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import Highlight from "@tiptap/extension-highlight"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import Placeholder from "@tiptap/extension-placeholder"
import Dropcursor from "@tiptap/extension-dropcursor"


import { useState, useCallback, useRef, useEffect } from "react"
import { useClientApi } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"
import { getImageUrl } from "@/lib/image-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, 
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Link as LinkIcon, Type,
  Undo, Redo, Eye, EyeOff,
  Upload, Trash2, Wifi, Save
} from "lucide-react"


interface AdvancedTiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  heroImage?: string
  onHeroImageChange?: (url: string) => void
  postId?: string
  title?: string
  categoryId?: string
  excerpt?: string
  status?: 'draft' | 'published' | 'archived' | 'scheduled'
  enableAutoSave?: boolean
  onDraftRecover?: (draft: any) => void
}

export function AdvancedTiptapEditor({
  content = "",
  onChange,
  placeholder = "Start writing something amazing...",
  className = "",
  heroImage = "",
  onHeroImageChange,
  postId = 'new',
  title = '',
  categoryId,
  excerpt,
  status = 'draft',
  enableAutoSave = true,
  onDraftRecover,
}: AdvancedTiptapEditorProps) {
  const [isToolbarVisible, setIsToolbarVisible] = useState(true)
  const [linkUrl, setLinkUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [heroImageUrl, setHeroImageUrl] = useState(heroImage)
  const [showDraftDialog, setShowDraftDialog] = useState(false)
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageFileInputRef = useRef<HTMLInputElement>(null)
  const api = useClientApi()
  const { toast } = useToast()

  // Connectivity detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR error
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        codeBlock: false, // Disable default code block
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto shadow-md my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Dropcursor.configure({
        color: '#3b82f6', // Blue color for drop cursor
        width: 2,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-lg max-w-none mx-auto focus:outline-none",
          "dark:prose-invert prose-headings:scroll-mt-20",
          "prose-img:rounded-lg prose-img:shadow-md",
          "prose-pre:bg-slate-900 prose-pre:text-slate-100",
          "prose-code:bg-slate-100 prose-code:text-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded",
          "dark:prose-code:bg-slate-800 dark:prose-code:text-slate-200",
          "min-h-[500px] p-6 pb-24"
        ),
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const files = Array.from(event.dataTransfer.files)
          const imageFiles = files.filter(file => file.type.startsWith('image/'))
          
          if (imageFiles.length === 0) {
            return false // Let the default behavior handle it
          }

          // Prevent default behavior and handle image uploads
          event.preventDefault()
          
          // Get the drop position
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (!coordinates) return false

          // Upload and insert images sequentially
          imageFiles.forEach(async (file, index) => {
            const url = await uploadImage(file)
            if (url) {
              // Pre-load the image to ensure it's ready
              const img = new window.Image()
              img.onload = () => {
                // Insert the image using TipTap commands instead of direct ProseMirror manipulation
                if (editor) {
                  editor.chain()
                    .focus()
                    .setTextSelection(coordinates.pos + index)
                    .setImage({ src: url, alt: file.name || 'Uploaded image' })
                    .run()
                }
              }
              img.onerror = () => {
                toast({
                  title: 'Error',
                  description: `Failed to load image: ${file.name}`,
                  variant: 'destructive',
                })
              }
              img.src = url
            }
          })

          return true // Handled the drop
        }
        return false // Let default behavior handle it
      },
    },
  })

  // Sync content when prop changes
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      // Use the correct parameter structure - second parameter should be an options object
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [editor, content])

  // Sync hero image when prop changes
  useEffect(() => {
    if (heroImage !== undefined && heroImageUrl !== heroImage) {
      // If heroImage is a key, convert to full URL for display
      const displayUrl = heroImage.startsWith('http') ? heroImage : getImageUrl(heroImage)
      setHeroImageUrl(displayUrl)
    }
  }, [heroImage, heroImageUrl])

  const uploadImage = async (file: File): Promise<string | null> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a valid image file (JPEG, PNG, GIF, WebP).',
        variant: 'destructive',
      })
      return null
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be smaller than 10MB.',
        variant: 'destructive',
      })
      return null
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await api.post('/file/upload', formData)
      
      console.log('Upload response:', response) // Debug log
      
      if (response && response.url) {
        console.log('Image URL:', response.url) // Debug log
        return response.url
      }
      console.log('No URL in response') // Debug log
      return null
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleHeroImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append('image', file)
        
        const response = await api.post('/file/upload', formData)
        
        if (response && response.url && response.key) {
          // Use full URL for editor display
          setHeroImageUrl(response.url)
          // Pass key to parent for storage
          onHeroImageChange?.(response.key)
          toast({
            title: "Success",
            description: "Hero image uploaded successfully",
            variant: "default"
          })
        }
      } catch (error) {
        console.error('Error uploading hero image:', error)
        toast({
          title: 'Upload failed',
          description: 'Failed to upload hero image. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsUploading(false)
      }
    }
  }, [api, onHeroImageChange, toast])

  const insertImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run()
      setImageUrl("")
      setImageAlt("")
    }
  }, [editor, imageUrl, imageAlt])

  const setLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl("")
    }
  }, [editor, linkUrl])

  const handleImageFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = await uploadImage(file)
      if (url) {
        setImageUrl(url)
        setImageAlt(file.name)
        toast({
          title: "Success",
          description: "Image uploaded successfully",
          variant: "default"
        })
      }
    }
  }

  if (!editor) {
    return (
      <div className={cn("border rounded-xl bg-background", className)}>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Hero Image Section - Compact */}
      <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Hero Image</span>
          {heroImageUrl && (
            <Badge variant="secondary" className="text-xs">
              Added
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleHeroImageUpload}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 px-2 text-xs"
          >
            <Upload className="h-3 w-3 mr-1" />
            {heroImageUrl ? 'Change' : 'Add'}
          </Button>
          {heroImageUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setHeroImageUrl("")
                onHeroImageChange?.("")
              }}
              className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remove
            </Button>
          )}
        </div>
      </div>
      
      {/* Hero Image Preview - Only shows when image exists */}
      {heroImageUrl && (
        <div className="relative rounded-lg overflow-hidden bg-muted max-w-xs">
          <img 
            src={getImageUrl(heroImageUrl)} 
            alt="Hero preview" 
            className="w-full h-20 object-cover"
          />
          <div className="absolute top-1 right-1">
            <Badge variant="secondary" className="text-xs px-1 py-0">
              Preview
            </Badge>
          </div>
        </div>
      )}

      {/* Editor */}
      <Card className="relative overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-1">
              {/* <Badge variant="secondary" className="text-xs">
                Rich Text Editor
              </Badge> */}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsToolbarVisible(!isToolbarVisible)}
              className="text-xs"
            >
              {isToolbarVisible ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {isToolbarVisible ? "Hide" : "Show"}
            </Button>
          </div>

          {isToolbarVisible && (
            <div className="px-3 pb-3">
              <div className="flex flex-wrap items-center gap-1">
                {/* Undo/Redo */}
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    className="h-8 w-8 p-0"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    className="h-8 w-8 p-0"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Text Formatting */}
                <div className="flex items-center">
                  <Button
                    variant={editor.isActive("bold") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="h-8 w-8 p-0"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive("italic") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="h-8 w-8 p-0"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive("underline") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className="h-8 w-8 p-0"
                  >
                    <UnderlineIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive("strike") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className="h-8 w-8 p-0"
                  >
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Headings */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Type className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                      Paragraph
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                      <Heading1 className="h-4 w-4 mr-2" /> Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                      <Heading2 className="h-4 w-4 mr-2" /> Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                      <Heading3 className="h-4 w-4 mr-2" /> Heading 3
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Lists */}
                <Button
                  variant={editor.isActive("bulletList") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("orderedList") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className="h-8 w-8 p-0"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Alignment */}
                <div className="flex items-center">
                  <Button
                    variant={editor.isActive({ textAlign: 'left' }) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className="h-8 w-8 p-0"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive({ textAlign: 'center' }) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className="h-8 w-8 p-0"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive({ textAlign: 'right' }) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className="h-8 w-8 p-0"
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive({ textAlign: 'justify' }) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className="h-8 w-8 p-0"
                  >
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Media & Links */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Insert Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Upload Image</Label>
                        <input
                          ref={imageFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => imageFileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image File
                        </Button>
                      </div>
                      <div className="text-center text-muted-foreground text-sm">
                        or
                      </div>
                      <div>
                        <Label htmlFor="image-url">Image URL</Label>
                        <Input
                          id="image-url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="image-alt">Alt Text</Label>
                        <Input
                          id="image-alt"
                          value={imageAlt}
                          onChange={(e) => setImageAlt(e.target.value)}
                          placeholder="Describe the image"
                        />
                      </div>
                      <Button onClick={insertImage} className="w-full" disabled={!imageUrl}>
                        Insert Image
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Insert Link</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="link-url">URL</Label>
                        <Input
                          id="link-url"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                      <Button onClick={setLink} className="w-full">
                        Insert Link
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>


                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* More Options */}
                <Button
                  variant={editor.isActive("blockquote") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className="h-8 w-8 p-0"
                >
                  <Quote className="h-4 w-4" />
                </Button>

                <Button
                  variant={editor.isActive("code") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className="h-8 w-8 p-0"
                >
                  <Code className="h-4 w-4" />
                </Button>

              </div>
            </div>
          )}
        </div>


        {/* Editor Content */}
        <div className="relative">
          <EditorContent
            editor={editor}
            className="focus-within:outline-none"
          />
          
          {/* Word Count */}
          <div className="absolute bottom-4 right-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-muted-foreground border">
            {content.replace(/<[^>]*>/g, "").split(" ").filter(word => word.length > 0).length} words
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs border font-mono">⌘B</kbd>
            <span>Bold</span>
            <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs border font-mono">⌘I</kbd>
            <span>Italic</span>
            <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs border font-mono">⌘K</kbd>
            <span>Link</span>
            <span className="text-muted-foreground/70">• Drag & drop images to upload</span>
          </div>
          <div className="flex items-center gap-2">
            {isUploading && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Uploading...
              </div>
            )}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              isOnline 
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <Badge variant="outline" className="text-xs">
              <Save className="h-3 w-3 mr-1" />
              Auto-save {enableAutoSave ? 'enabled' : 'disabled'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}