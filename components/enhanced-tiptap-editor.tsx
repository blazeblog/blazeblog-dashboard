"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Type,
  Eye,
  EyeOff,
  Minus,
} from "lucide-react"

interface EnhancedTiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
}

interface TocItem {
  id: string
  text: string
  level: number
}

export function EnhancedTiptapEditor({
  content = "",
  onChange,
  placeholder = "Start writing...",
  className = "",
}: EnhancedTiptapEditorProps) {
  const [isToolbarVisible, setIsToolbarVisible] = useState(true)
  const [tocItems, setTocItems] = useState<TocItem[]>([])

  const editor = useEditor({
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
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)

      // Extract headings for ToC
      const headings = extractHeadings(html)
      setTocItems(headings)
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4 dark:prose-invert prose-headings:scroll-mt-20",
      },
    },
  })

  // Extract headings from HTML content
  const extractHeadings = (html: string): TocItem[] => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6")

    return Array.from(headings).map((heading, index) => ({
      id: `heading-${index}`,
      text: heading.textContent || "",
      level: Number.parseInt(heading.tagName.charAt(1)),
    }))
  }

  // Toolbar actions with proper event handling
  const handleBold = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBold().run()
    }
  }, [editor])

  const handleItalic = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleItalic().run()
    }
  }, [editor])

  const handleStrike = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleStrike().run()
    }
  }, [editor])

  const handleCode = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleCode().run()
    }
  }, [editor])

  const handleBulletList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBulletList().run()
    }
  }, [editor])

  const handleOrderedList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleOrderedList().run()
    }
  }, [editor])

  const handleBlockquote = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBlockquote().run()
    }
  }, [editor])

  const handleHeading = useCallback(
    (level: 1 | 2 | 3) => {
      if (editor) {
        editor.chain().focus().toggleHeading({ level }).run()
      }
    },
    [editor],
  )

  const handleParagraph = useCallback(() => {
    if (editor) {
      editor.chain().focus().setParagraph().run()
    }
  }, [editor])

  const handleHorizontalRule = useCallback(() => {
    if (editor) {
      editor.chain().focus().setHorizontalRule().run()
    }
  }, [editor])

  const handleUndo = useCallback(() => {
    if (editor) {
      editor.chain().focus().undo().run()
    }
  }, [editor])

  const handleRedo = useCallback(() => {
    if (editor) {
      editor.chain().focus().redo().run()
    }
  }, [editor])

  if (!editor) {
    return (
      <div className={cn("border rounded-lg bg-background", className)}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading editor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Table of Contents */}
      {tocItems.length > 0 && (
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <nav className="space-y-1">
                {tocItems.map((item, index) => (
                  <button
                    key={index}
                    className={cn(
                      "block w-full text-left text-xs hover:text-foreground transition-colors",
                      "text-muted-foreground hover:bg-muted rounded px-2 py-1",
                      item.level === 1 && "font-medium",
                      item.level === 2 && "pl-4",
                      item.level === 3 && "pl-6",
                    )}
                    onClick={() => {
                      // Scroll to heading (simplified - in real app you'd add IDs to headings)
                      console.log(`Scroll to: ${item.text}`)
                    }}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Editor */}
      <div className={cn("lg:col-span-3 order-1 lg:order-2", tocItems.length === 0 && "lg:col-span-4")}>
        <div className={cn("border rounded-lg bg-background", className)}>
          {/* Toolbar Toggle */}
          <div className="flex items-center justify-between p-2 border-b bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsToolbarVisible(!isToolbarVisible)}
              className="h-7 px-2 text-xs"
            >
              {isToolbarVisible ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {isToolbarVisible ? "Hide" : "Show"} Toolbar
            </Button>
            <div className="text-xs text-muted-foreground">Rich text editor</div>
          </div>

          {/* Toolbar */}
          {isToolbarVisible && (
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/20">
              {/* Undo/Redo */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={!editor.can().chain().focus().undo().run()}
                className="h-8 w-8 p-0"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={!editor.can().chain().focus().redo().run()}
                className="h-8 w-8 p-0"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Text Formatting - Using Button instead of Toggle for better control */}
              <Button
                variant={editor.isActive("bold") ? "default" : "ghost"}
                size="sm"
                onClick={handleBold}
                className="h-8 w-8 p-0"
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive("italic") ? "default" : "ghost"}
                size="sm"
                onClick={handleItalic}
                className="h-8 w-8 p-0"
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive("strike") ? "default" : "ghost"}
                size="sm"
                onClick={handleStrike}
                className="h-8 w-8 p-0"
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive("code") ? "default" : "ghost"}
                size="sm"
                onClick={handleCode}
                className="h-8 w-8 p-0"
                title="Inline Code"
              >
                <Code className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Headings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={editor.isActive("heading") ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Text Format"
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-36">
                  <DropdownMenuItem
                    onClick={handleParagraph}
                    className={cn(editor.isActive("paragraph") && "bg-accent")}
                  >
                    Paragraph
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleHeading(1)}
                    className={cn(editor.isActive("heading", { level: 1 }) && "bg-accent")}
                  >
                    <Heading1 className="h-4 w-4 mr-2" />
                    Heading 1
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleHeading(2)}
                    className={cn(editor.isActive("heading", { level: 2 }) && "bg-accent")}
                  >
                    <Heading2 className="h-4 w-4 mr-2" />
                    Heading 2
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleHeading(3)}
                    className={cn(editor.isActive("heading", { level: 3 }) && "bg-accent")}
                  >
                    <Heading3 className="h-4 w-4 mr-2" />
                    Heading 3
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Lists */}
              <Button
                variant={editor.isActive("bulletList") ? "default" : "ghost"}
                size="sm"
                onClick={handleBulletList}
                className="h-8 w-8 p-0"
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive("orderedList") ? "default" : "ghost"}
                size="sm"
                onClick={handleOrderedList}
                className="h-8 w-8 p-0"
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Quote & Divider */}
              <Button
                variant={editor.isActive("blockquote") ? "default" : "ghost"}
                size="sm"
                onClick={handleBlockquote}
                className="h-8 w-8 p-0"
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHorizontalRule}
                className="h-8 w-8 p-0"
                title="Horizontal Rule"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Editor Content */}
          <div className="min-h-[400px]">
            <EditorContent
              editor={editor}
              className="prose prose-sm sm:prose-base max-w-none dark:prose-invert focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:p-4"
            />
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between p-2 border-t text-xs text-muted-foreground bg-muted/20">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-background rounded text-[10px] border">⌘B</kbd>
                Bold
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-background rounded text-[10px] border">⌘I</kbd>
                Italic
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                {
                  content
                    .replace(/<[^>]*>/g, "")
                    .split(" ")
                    .filter((word) => word.length > 0).length
                }{" "}
                words
              </span>
              <span>{content.replace(/<[^>]*>/g, "").length} chars</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
