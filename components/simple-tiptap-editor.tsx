"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  MoreHorizontal,
} from "lucide-react"

interface SimpleTiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
}

export function SimpleTiptapEditor({
  content = "",
  onChange,
  placeholder = "Start writing...",
  className = "",
}: SimpleTiptapEditorProps) {
  const [isToolbarVisible, setIsToolbarVisible] = useState(true)

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
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4 dark:prose-invert",
      },
    },
  })

  if (!editor) {
    return (
      <div className={`border rounded-lg bg-background ${className}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading editor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg bg-background ${className}`}>
      {/* Toolbar Toggle */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsToolbarVisible(!isToolbarVisible)}>
            <MoreHorizontal className="h-4 w-4" />
            {isToolbarVisible ? "Hide" : "Show"} Toolbar
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">Rich text editor</div>
      </div>

      {/* Toolbar */}
      {isToolbarVisible && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
          >
            <Redo className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text Formatting */}
          <Toggle
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            size="sm"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            size="sm"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            size="sm"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive("code")}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            size="sm"
          >
            <Code className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Type className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>Paragraph</DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <Toggle
            pressed={editor.isActive("bulletList")}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            size="sm"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive("orderedList")}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            size="sm"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Quote */}
          <Toggle
            pressed={editor.isActive("blockquote")}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
            size="sm"
          >
            <Quote className="h-4 w-4" />
          </Toggle>
        </div>
      )}

      {/* Editor Content */}
      <div className="min-h-[400px]">
        <EditorContent
          editor={editor}
          className="prose prose-sm sm:prose-base max-w-none dark:prose-invert focus-within:outline-none"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-2 border-t text-xs text-muted-foreground bg-muted/30">
        <div>
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+B</kbd> for bold,
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-1">Ctrl+I</kbd> for italic
        </div>
        <div>Rich text editor ready</div>
      </div>
    </div>
  )
}
