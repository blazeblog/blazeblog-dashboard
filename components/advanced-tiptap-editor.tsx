"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { NodeSelection } from "@tiptap/pm/state"
import StarterKit from "@tiptap/starter-kit"
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
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"
import ImageResize from "tiptap-extension-resize-image"
// Helper function to convert formatted text to HTML
const convertFormattedTextToHTML = (text: string): string => {
  const lines = text.split('\n')
  const processedLines: string[] = []
  let inList = false
  let listType = ''
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (!line) {
      // Empty line - close any open list and add paragraph break
      if (inList) {
        processedLines.push(listType === 'bullet' ? '</ul>' : '</ol>')
        inList = false
        listType = ''
      }
      processedLines.push('')
      continue
    }
    
    // Check for headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      // Close any open list
      if (inList) {
        processedLines.push(listType === 'bullet' ? '</ul>' : '</ol>')
        inList = false
        listType = ''
      }
      
      const level = Math.min(headingMatch[1].length, 6)
      const text = headingMatch[2]
      processedLines.push(`<h${level}>${text}</h${level}>`)
      continue
    }
    
    // Check for bullet lists
    const bulletMatch = line.match(/^[-*]\s+(.+)$/)
    if (bulletMatch) {
      const text = bulletMatch[1]
      
      if (!inList || listType !== 'bullet') {
        if (inList) processedLines.push(listType === 'bullet' ? '</ul>' : '</ol>')
        processedLines.push('<ul>')
        inList = true
        listType = 'bullet'
      }
      
      processedLines.push(`<li>${text}</li>`)
      continue
    }
    
    // Check for numbered lists
    const numberedMatch = line.match(/^\d+[.)]\s+(.+)$/)
    if (numberedMatch) {
      const text = numberedMatch[1]
      
      if (!inList || listType !== 'numbered') {
        if (inList) processedLines.push(listType === 'bullet' ? '</ul>' : '</ol>')
        processedLines.push('<ol>')
        inList = true
        listType = 'numbered'
      }
      
      processedLines.push(`<li>${text}</li>`)
      continue
    }
    
    // Regular paragraph
    if (inList) {
      processedLines.push(listType === 'bullet' ? '</ul>' : '</ol>')
      inList = false
      listType = ''
    }
    
    processedLines.push(`<p>${line}</p>`)
  }
  
  // Close any remaining list
  if (inList) {
    processedLines.push(listType === 'bullet' ? '</ul>' : '</ol>')
  }
  
  return processedLines.join('\n')
}

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { useClientApi } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"
import { getImageUrl } from "@/lib/image-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useDropzone } from "react-dropzone"
import ReactCrop, { type Crop, centerCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
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
  Upload, Trash2, Save, Crop as CropIcon, Move3D, 
  Scissors, Maximize2
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
  placeholder = "Title...",
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
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true)
  const [isUploading, setIsUploading] = useState(false)
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [showEditorImageCrop, setShowEditorImageCrop] = useState(false)
  const [showHeroPreview, setShowHeroPreview] = useState(true)
  const [imageToCrop, setImageToCrop] = useState<string>("")
  const [editorImageToCrop, setEditorImageToCrop] = useState<string>("")
  const [crop, setCrop] = useState<Crop>()
  const [editorCrop, setEditorCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [completedEditorCrop, setCompletedEditorCrop] = useState<Crop>()
  const imageFileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const editorImgRef = useRef<HTMLImageElement>(null)
  const api = useClientApi()
  const { toast } = useToast()

  // Memoize expensive calculations for performance
  const wordCount = useMemo(() => {
    return content.replace(/<[^>]*>/g, "").split(/\s+/).filter(word => word.length > 0).length
  }, [content])

  // Helper function to create a cropped image
  const getCroppedImg = useCallback((image: HTMLImageElement, crop: Crop): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      canvas.width = crop.width * scaleX
      canvas.height = crop.height * scaleY

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      )

      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, 'image/jpeg', 0.9)
    })
  }, [])

  // Initialize crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      {
        unit: '%',
        width: 80,
        height: 60,
      },
      width,
      height,
    )
    setCrop(crop)
  }, [])

  // Initialize crop for editor images (no fixed aspect ratio)
  const onEditorImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      {
        unit: '%',
        width: 80,
        height: 80,
      },
      width,
      height,
    )
    setEditorCrop(crop)
  }, [])

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
        bulletList: false, // Disable StarterKit's bulletList
        orderedList: false, // Disable StarterKit's orderedList
        listItem: false, // Disable StarterKit's listItem
        codeBlock: false, // Disable default code block
      }),
      // Add individual list extensions for better control
      BulletList.configure({
        keepMarks: true,
        keepAttributes: false,
        HTMLAttributes: {
          class: 'tiptap-bullet-list',
        },
      }),
      OrderedList.configure({
        keepMarks: true,
        keepAttributes: false,
        HTMLAttributes: {
          class: 'tiptap-ordered-list',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'tiptap-list-item',
        },
      }),
      ImageResize.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'tiptap-image rounded-lg max-w-full h-auto shadow-md my-4 cursor-pointer transition-all',
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
        placeholder: 'Title...',
      }),
      Dropcursor.configure({
        color: '#3b82f6', 
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
      handleKeyDown: (view, event) => {
        // Handle Tab key to insert 5 spaces
        if (event.key === 'Tab' && !event.shiftKey) {
          event.preventDefault()
          const { state, dispatch } = view
          const { selection } = state
          const { $from } = selection
          
          // Check if we're in a list - if so, use default list behavior
          if ($from.node(-1)?.type.name === 'listItem') {
            return false // Let TipTap handle list indentation
          }
          
          // Otherwise, insert 5 spaces
          const tr = state.tr.insertText('     ', selection.from, selection.to)
          dispatch(tr)
          return true
        }
        
        // Handle Shift+Tab for outdenting (remove up to 5 spaces)
        if (event.key === 'Tab' && event.shiftKey) {
          event.preventDefault()
          const { state, dispatch } = view
          const { selection } = state
          const { $from } = selection
          
          // Check if we're in a list - if so, use default list behavior
          if ($from.node(-1)?.type.name === 'listItem') {
            return false // Let TipTap handle list outdentation
          }
          
          // Get text before cursor
          const textBefore = $from.parent.textBetween(
            Math.max(0, $from.parentOffset - 5), 
            $from.parentOffset
          )
          
          // Count spaces to remove (up to 5)
          let spacesToRemove = 0
          for (let i = textBefore.length - 1; i >= 0 && textBefore[i] === ' '; i--) {
            spacesToRemove++
          }
          
          if (spacesToRemove > 0) {
            const from = selection.from - spacesToRemove
            const tr = state.tr.delete(from, selection.from)
            dispatch(tr)
          }
          return true
        }
        
        // Handle Delete key on selected images
        if (event.key === 'Delete' || event.key === 'Backspace') {
          const { state } = view
          const { selection } = state
          
          // Check if we have a node selection (like an image)
          if (selection instanceof NodeSelection) {
            const node = selection.node
            if (node.type.name === 'image') {
              event.preventDefault()
              const { dispatch } = view
              const tr = state.tr.deleteSelection()
              dispatch(tr)
              return true
            }
          }
        }
        
        return false
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement
        
        // Check if we clicked on an image
        if (target.tagName === 'IMG') {
          const { state, dispatch } = view
          
          // Find the image node at the clicked position
          const $pos = state.doc.resolve(pos)
          let imageNode = null
          let imagePos = -1
          
          // Look for image node around the clicked position
          for (let i = $pos.depth; i >= 0; i--) {
            const node = $pos.node(i)
            if (node.type.name === 'image') {
              imageNode = node
              imagePos = $pos.before(i)
              break
            }
          }
          
          // If we didn't find it in the current position, search around it
          if (!imageNode) {
            state.doc.nodesBetween(
              Math.max(0, pos - 10), 
              Math.min(state.doc.content.size, pos + 10), 
              (node, nodePos) => {
                if (node.type.name === 'image') {
                  imageNode = node
                  imagePos = nodePos
                  return false // Stop searching
                }
              }
            )
          }
          
          if (imageNode && imagePos >= 0) {
            // Create a node selection for the image
            const selection = NodeSelection.create(state.doc, imagePos)
            dispatch(state.tr.setSelection(selection))
            event.preventDefault()
            return true
          }
        }
        
        return false
      },
      handlePaste: (_view, event) => {
        const clipboardData = event.clipboardData
        if (!clipboardData) return false
        
        const plainText = clipboardData.getData('text/plain')
        if (!plainText) return false
        
        // Check if we have markdown-like content
        const hasMarkdownPatterns = plainText.split('\n').some(line => 
          /^#{1,6}\s/.test(line) || // headings
          /^[-*]\s/.test(line) || // bullet lists
          /^\d+[.)]\s/.test(line) // numbered lists
        )
        
        if (!hasMarkdownPatterns) return false
        
        // Prevent default paste behavior
        event.preventDefault()
        
        // Convert formatted text to HTML and insert
        const htmlContent = convertFormattedTextToHTML(plainText)
        if (htmlContent && editor) {
          editor.commands.insertContent(htmlContent)
          return true
        }
        
        return false
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const files = Array.from(event.dataTransfer.files)
          const imageFiles = files.filter(file => file.type.startsWith('image/'))
          
          if (imageFiles.length === 0) {
            return false // Let the default behavior handle it
          }

          // Prevent default behavior and handle image uploads with cropping
          event.preventDefault()
          
          // Handle the first image file through the cropping dialog
          const firstImageFile = imageFiles[0]
          handleEditorImageWithCrop(firstImageFile)

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

  // Add image selection helper after editor content changes
  useEffect(() => {
    if (!editor) return

    // Add click handlers for images after a delay to ensure they're rendered
    const timeoutId = setTimeout(() => {
      const images = editor.view.dom.querySelectorAll('img')
      console.log('Found images in editor:', images.length) // Debug log
      
      images.forEach((img, index) => {
        img.onclick = (e) => {
          console.log('Image clicked:', index) // Debug log
          e.preventDefault()
          
          // Try to find the position and select the image
          try {
            const pos = editor.view.posAtDOM(img, 0)
            console.log('Image position:', pos) // Debug log
            
            if (pos >= 0) {
              const selection = NodeSelection.create(editor.state.doc, pos)
              editor.view.dispatch(editor.state.tr.setSelection(selection))
              editor.view.focus()
            }
          } catch (error) {
            console.error('Error selecting image:', error)
          }
        }
      })
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [editor, content])




  // Enhanced hero image upload with cropping
  const handleHeroImageWithCrop = useCallback(async (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a valid image file.',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be smaller than 10MB.',
        variant: 'destructive',
      })
      return
    }

    // Create object URL for cropping
    const objectUrl = URL.createObjectURL(file)
    setImageToCrop(objectUrl)
    setShowCropDialog(true)
  }, [toast])

  // Setup dropzone for hero image
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleHeroImageWithCrop(acceptedFiles[0])
      }
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  // Apply crop and upload
  const applyCropAndUpload = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return

    setIsUploading(true)
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop)
      const croppedFile = new File([croppedBlob], 'hero-image.jpg', { type: 'image/jpeg' })
      
      const formData = new FormData()
      formData.append('image', croppedFile)
      
      const response = await api.post('/file/upload', formData)
      
      if (response && response.url && response.key) {
        setHeroImageUrl(response.url)
        onHeroImageChange?.(response.key)
        setShowCropDialog(false)
        setImageToCrop("")
        toast({
          title: "Success",
          description: "Hero image cropped and uploaded successfully",
        })
      }
    } catch (error) {
      console.error('Error uploading cropped image:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload cropped image. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }, [completedCrop, getCroppedImg, api, onHeroImageChange, toast])


  // Handle editor image upload with cropping
  const handleEditorImageWithCrop = useCallback(async (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a valid image file.',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be smaller than 10MB.',
        variant: 'destructive',
      })
      return
    }

    // Create object URL for cropping
    const objectUrl = URL.createObjectURL(file)
    setEditorImageToCrop(objectUrl)
    setShowEditorImageCrop(true)
  }, [toast])

  // Apply crop and insert into editor
  const applyEditorCropAndInsert = useCallback(async () => {
    if (!editorImgRef.current || !completedEditorCrop) return

    setIsUploading(true)
    try {
      const croppedBlob = await getCroppedImg(editorImgRef.current, completedEditorCrop)
      const croppedFile = new File([croppedBlob], 'editor-image.jpg', { type: 'image/jpeg' })
      
      const formData = new FormData()
      formData.append('image', croppedFile)
      
      const response = await api.post('/file/upload', formData)
      
      if (response && response.url) {
        // Insert the cropped image into the editor
        if (editor) {
          console.log('Inserting image with URL:', response.url) // Debug log
          editor.chain().focus().setImage({ 
            src: response.url, 
            alt: 'Cropped image'
          }).run()
        }
        setShowEditorImageCrop(false)
        setEditorImageToCrop("")
        toast({
          title: "Success",
          description: "Image cropped and inserted successfully",
        })
      }
    } catch (error) {
      console.error('Error uploading cropped editor image:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload cropped image. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }, [completedEditorCrop, getCroppedImg, api, editor, toast])


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
      handleEditorImageWithCrop(file)
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
      {/* Minimalist Hero Image Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Hero Image</span>
            {heroImageUrl && <Badge variant="secondary" className="text-xs">✓</Badge>}
          </div>
          <div className="flex gap-1">
            {heroImageUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHeroPreview(!showHeroPreview)}
                className="h-7 px-2 text-xs"
              >
                {showHeroPreview ? (
                  <EyeOff className="h-3 w-3 mr-1" />
                ) : (
                  <Eye className="h-3 w-3 mr-1" />
                )}
                {showHeroPreview ? 'Hide' : 'Show'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) handleHeroImageWithCrop(file)
                }
                input.click()
              }}
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
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Drag & Drop Zone or Preview */}
        {!heroImageUrl ? (
          <div
            {...getRootProps()}
            className={cn(
              "border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
              isDragActive 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <div className="space-y-1">
              <div className="mx-auto w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                {isDragActive ? (
                  <Move3D className="h-4 w-4 text-primary" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium">
                  {isDragActive ? "Drop image here" : "Drag image or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        ) : showHeroPreview ? (
          <div className="relative group rounded-lg overflow-hidden border">
            <img 
              src={getImageUrl(heroImageUrl)} 
              alt="Hero preview" 
              className="w-full h-32 sm:h-40 object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs backdrop-blur-sm bg-white/90 hover:bg-white px-3"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) handleHeroImageWithCrop(file)
                  }
                  input.click()
                }}
              >
                <CropIcon className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Image Cropping Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CropIcon className="h-5 w-5" />
              Crop Hero Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {imageToCrop && (
              <div className="space-y-3">
                <ReactCrop
                  crop={crop}
                  onChange={(crop) => setCrop(crop)}
                  onComplete={(crop) => setCompletedCrop(crop)}
                  className="max-h-96"
                >
                  <img
                    ref={imgRef}
                    src={imageToCrop}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="max-w-full"
                  />
                </ReactCrop>
                
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Drag to adjust the crop area • Free aspect ratio for flexible sizing
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const img = imgRef.current
                        if (img) {
                          const crop = {
                            unit: 'px' as const,
                            x: 0,
                            y: 0,
                            width: img.width,
                            height: img.height
                          }
                          setCrop(crop)
                          setCompletedCrop(crop)
                        }
                      }}
                    >
                      <Maximize2 className="h-3 w-3 mr-2" />
                      Fill
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCropDialog(false)
                          setImageToCrop("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={applyCropAndUpload}
                        disabled={!completedCrop || isUploading}
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Scissors className="h-3 w-3 mr-2" />
                            Crop & Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor Image Cropping Dialog */}
      <Dialog open={showEditorImageCrop} onOpenChange={setShowEditorImageCrop}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CropIcon className="h-5 w-5" />
              Crop Image for Editor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editorImageToCrop && (
              <div className="space-y-3">
                <ReactCrop
                  crop={editorCrop}
                  onChange={(crop) => setEditorCrop(crop)}
                  onComplete={(crop) => setCompletedEditorCrop(crop)}
                  className="max-h-96"
                >
                  <img
                    ref={editorImgRef}
                    src={editorImageToCrop}
                    alt="Crop preview"
                    onLoad={onEditorImageLoad}
                    className="max-w-full"
                  />
                </ReactCrop>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const img = editorImgRef.current
                      if (img) {
                        const crop = {
                          unit: 'px' as const,
                          x: 0,
                          y: 0,
                          width: img.width,
                          height: img.height
                        }
                        setEditorCrop(crop)
                        setCompletedEditorCrop(crop)
                      }
                    }}
                  >
                    <Maximize2 className="h-3 w-3 mr-2" />
                    Fill
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowEditorImageCrop(false)
                        setEditorImageToCrop("")
                      }}
                    >
                        Cancel
                      </Button>
                    <Button
                      size="sm"
                      onClick={applyEditorCropAndInsert}
                      disabled={!completedEditorCrop || isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Scissors className="h-3 w-3 mr-2" />
                          Crop & Insert
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor */}
      <Card className="relative overflow-hidden">
        {/* Toolbar */}
        {isToolbarVisible && (
          <div className="bg-muted/30 border-b p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
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
                      <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Insert Image
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label>Upload & Crop Image</Label>
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
                          className="w-full h-12 border-dashed"
                        >
                          <div className="flex items-center gap-2">
                            <CropIcon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Choose Image File</div>
                              <div className="text-xs text-muted-foreground">Upload & crop before inserting</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-xs text-muted-foreground">or</span>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="image-url">Direct Image URL</Label>
                        <Input
                          id="image-url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                        <Input
                          id="image-alt"
                          value={imageAlt}
                          onChange={(e) => setImageAlt(e.target.value)}
                          placeholder="Alt text (describe the image)"
                        />
                        <Button onClick={insertImage} className="w-full" disabled={!imageUrl}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Insert from URL
                        </Button>
                      </div>
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
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsToolbarVisible(!isToolbarVisible)}
                className="text-xs h-8 px-2 ml-2"
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Hide
              </Button>
            </div>
          </div>
        )}


        {/* Show Toolbar Button */}
        {!isToolbarVisible && (
          <div className="border-b p-2 bg-muted/10">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsToolbarVisible(true)}
                className="text-xs h-7 px-2"
              >
                <Eye className="h-3 w-3 mr-1" />
                Show Toolbar
              </Button>
            </div>
          </div>
        )}

        {/* Editor Content */}
        <div className="relative">
          <EditorContent
            editor={editor}
            className="focus-within:outline-none"
          />
          
          {/* Word Count */}
          <div className="absolute bottom-4 right-6 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-muted-foreground border">
            {wordCount} words
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t bg-muted/20">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-muted rounded text-xs border font-mono">Tab</kbd>
            <span>5 spaces</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs border font-mono">Del</kbd>
            <span>Delete image</span>
            <span className="text-muted-foreground/70">• Drag & drop images • Click image to select</span>
          </div>
          <div className="flex items-center gap-2">
            {isUploading && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-pulse" />
                Uploading...
              </div>
            )}
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