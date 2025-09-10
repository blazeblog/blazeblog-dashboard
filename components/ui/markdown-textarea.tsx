"use client"

import React, { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Bold, Italic, Link as LinkIcon, List, Quote, Code, HelpCircle, Image as ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface MarkdownTextareaProps extends Omit<React.ComponentProps<"textarea">, 'onChange'> {
  label?: string
  value?: string
  onChange?: (value: string) => void
  enablePreview?: boolean
  minHeight?: number
}

// Simple markdown to HTML converter for basic formatting
function parseMarkdown(text: string): string {
  if (!text) return ""
  
  return text
    // Clickable images: [![alt](src "title")] (href)
    .replace(/\[!\[([^\]]*)\]\(([^)\s]+)(?:\s+\"([^\"]+)\")?\)\]\(([^)]+)\)/g, '<a href="$4" class="inline-block" target="_blank" rel="noopener noreferrer"><img src="$2" alt="$1" title="$3" class="max-w-full h-auto rounded-md border"/></a>')
    // Images: ![alt](src "title")
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+\"([^\"]+)\")?\)/g, '<img src="$2" alt="$1" title="$3" class="max-w-full h-auto rounded-md border"/>')
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
    // Bold and Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold"><em class="italic">$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>')
    .replace(/_(.*?)_/g, '<em class="italic">$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer">$1</a>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300">$1</blockquote>')
    // Lists
    .replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
    .replace(/^\+ (.*$)/gm, '<li class="ml-4">• $1</li>')
    // Line breaks
    .replace(/\n/g, '<br>')
}

export function MarkdownTextarea({
  label,
  value = "",
  onChange,
  enablePreview = true,
  minHeight = 120,
  className,
  placeholder = "Enter text with markdown formatting...",
  ...props
}: MarkdownTextareaProps) {
  const [showPreview, setShowPreview] = useState(false)

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.querySelector(`textarea[data-markdown-id="${props.id}"]`) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange?.(newValue)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={props.id}>{label}</Label>}
      
      <div className="relative">
        {enablePreview ? (
          <Tabs value={showPreview ? "preview" : "write"} className="w-full">
            <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2 rounded-t-md">
              <TabsList className="grid w-fit grid-cols-2 bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="write" 
                  onClick={() => setShowPreview(false)}
                  className="px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Write
                </TabsTrigger>
                <TabsTrigger 
                  value="preview" 
                  onClick={() => setShowPreview(true)}
                  className="px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertMarkdown("**", "**")}
                      >
                        <Bold className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bold (**text**)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertMarkdown("*", "*")}
                      >
                        <Italic className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Italic (*text*)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertMarkdown("![", "](https://)")}
                      >
                        <ImageIcon className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Image (![alt](url))</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertMarkdown("[", "](url)")}
                      >
                        <LinkIcon className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Link ([text](url))</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertMarkdown("- ")}
                      >
                        <List className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>List (- item)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertMarkdown("> ")}
                      >
                        <Quote className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Quote (&gt; text)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertMarkdown("`", "`")}
                      >
                        <Code className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Code (`code`)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1 text-xs">
                        <p>Markdown shortcuts:</p>
                        <p>**bold** *italic* `code`</p>
                        <p>[link](url) ![alt](img-url)</p>
                        <p>- list item # heading</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <TabsContent value="write" className="mt-0">
              <Textarea
                {...props}
                data-markdown-id={props.id}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className={cn(
                  "border-x border-b border-t-0 rounded-t-none resize-none font-mono text-sm",
                  className
                )}
                style={{ minHeight }}
              />
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <div 
                className={cn(
                  "border border-input rounded-b-md bg-transparent px-3 py-2 text-sm prose prose-sm max-w-none dark:prose-invert",
                  "prose-headings:margin-0 prose-p:margin-0 prose-blockquote:margin-0 prose-ul:margin-0 prose-li:margin-0"
                )}
                style={{ minHeight }}
              >
                {value.trim() ? (
                  <div dangerouslySetInnerHTML={{ __html: parseMarkdown(value) }} />
                ) : (
                  <p className="text-muted-foreground italic">Nothing to preview</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Textarea
            {...props}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className={cn("font-mono text-sm", className)}
            style={{ minHeight }}
          />
        )}
      </div>
    </div>
  )
}
