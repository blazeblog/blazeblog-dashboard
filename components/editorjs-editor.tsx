"use client"

import { useEffect, useRef, useId } from "react"
import { cn } from "@/lib/utils"
import { useClientApi } from "@/lib/client-api"

type EditorJSInstance = any

interface EditorJsEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
}

export default function EditorJsEditor({
  content = "",
  onChange,
  placeholder = "Start writing…",
  className = "",
}: EditorJsEditorProps) {
  const holderRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorJSInstance | null>(null)
  const editorId = useId()
  const api = useClientApi()

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null
    
    const initializeEditor = async () => {
      // Wait a bit to ensure DOM is fully ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (!holderRef.current || !isMounted) return

      try {
        // Dynamically import Editor.js and tools on client
        const EditorJS = (await import("@editorjs/editorjs")).default as any

        const [Header, List, Checklist, CodeTool, Quote, Table, InlineCode, Marker] = await Promise.all([
          import("@editorjs/header").then(m => m.default as any),
          import("@editorjs/list").then(m => m.default as any),
          import("@editorjs/checklist").then(m => m.default as any),
          import("@editorjs/code").then(m => m.default as any),
          import("@editorjs/quote").then(m => m.default as any),
          import("@editorjs/table").then(m => m.default as any),
          import("@editorjs/inline-code").then(m => m.default as any),
          import("@editorjs/marker").then(m => m.default as any),
        ])

        const ImageTool = (await import("@editorjs/image")).default as any
        const DragDrop = (await import("editorjs-drag-drop")).default as any
        const Undo = (await import("editorjs-undo")).default as any

        const initialBlocks = htmlToInitialBlocks(content)


        const instance = new EditorJS({
          holder: editorId,
          autofocus: true,
          placeholder,
          minHeight: 0,
          tools: {
            header: {
              class: Header,
              inlineToolbar: true,
              config: { levels: [1, 2, 3], defaultLevel: 2 },
            },
            list: { class: List, inlineToolbar: true },
            checklist: { class: Checklist, inlineToolbar: true },
            code: { class: CodeTool },
            inlineCode: { class: InlineCode },
            marker: { class: Marker },
            quote: { class: Quote, inlineToolbar: true },
            table: { class: Table },
            image: {
              class: ImageTool,
              config: {
                uploader: {
                  uploadByFile: async (file: File) => {
                    const fd = new FormData()
                    fd.append("image", file)
                    const res = await api.post("/file/upload", fd)
                    if (res?.url) {
                      return { success: 1, file: { url: res.url } }
                    }
                    return { success: 0 }
                  },
                },
                captionPlaceholder: 'Enter image caption...',
                buttonContent: 'Select an Image',
                types: 'image/*',
                additionalRequestHeaders: {},
              },
            },
          },
          data: { blocks: initialBlocks.length > 0 ? initialBlocks : [] },
          onChange: async () => {
            try {
              const output = await instance.save()
              const edjsHTML = (await import("editorjs-html")).default as any
              const parser = edjsHTML()
              const htmlParts = parser.parse(output)
              const html = Array.isArray(htmlParts) ? htmlParts.join("") : String(htmlParts ?? "")
              onChange?.(html)
            } catch (e) {
              // no-op
            }
          },
        })

        if (!isMounted) {
          instance.destroy()
          return
        }

        // Initialize drag-drop functionality (pass holder id explicitly to avoid config lookups)
        new DragDrop(instance, editorId)
        
        // Initialize undo functionality
        new Undo({ editor: instance })

        // Add crop/resize options to image context menu
        setTimeout(() => {
          const addImageActions = () => {
            const imageBlocks = document.querySelectorAll('.cdx-block[data-tool="image"]')
            imageBlocks.forEach((block) => {
              const imageWrapper = block.querySelector('.image-tool')
              if (imageWrapper && !imageWrapper.querySelector('.custom-image-actions')) {
                const actionsDiv = document.createElement('div')
                actionsDiv.className = 'custom-image-actions absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
                actionsDiv.innerHTML = `
                  <button class="crop-btn bg-white shadow-md rounded p-1 mr-1 hover:bg-gray-100" title="Crop image">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 2v14a2 2 0 0 0 2 2h14"/>
                      <path d="M18 6H8a2 2 0 0 0-2 2v10"/>
                    </svg>
                  </button>
                  <button class="resize-btn bg-white shadow-md rounded p-1 hover:bg-gray-100" title="Resize image">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 3h5v5"/>
                      <path d="M8 21H3v-5"/>
                      <path d="M21 8l-13 13"/>
                      <path d="M3 16l13-13"/>
                    </svg>
                  </button>
                `
                
                // Make image wrapper relative and add group class
                if (imageWrapper instanceof HTMLElement) {
                  imageWrapper.style.position = 'relative'
                  imageWrapper.classList.add('group')
                  imageWrapper.appendChild(actionsDiv)
                  
                  // Add click handlers
                  const cropBtn = actionsDiv.querySelector('.crop-btn')
                  const resizeBtn = actionsDiv.querySelector('.resize-btn')
                  
                  cropBtn?.addEventListener('click', (e) => {
                    e.stopPropagation()
                    const img = imageWrapper.querySelector('img')
                    if (img) {
                      console.log('Crop image:', img.src)
                      // TODO: Implement inline crop functionality
                    }
                  })
                  
                  resizeBtn?.addEventListener('click', (e) => {
                    e.stopPropagation()
                    const img = imageWrapper.querySelector('img')
                    if (img) {
                      console.log('Resize image:', img.src)
                      // TODO: Implement inline resize functionality
                    }
                  })
                }
              }
            })
          }

          // Initial setup
          addImageActions()
          
          // Re-run when content changes
          const observer = new MutationObserver(() => {
            addImageActions()
          })
          
          observer.observe(document.getElementById(editorId)!, {
            childList: true,
            subtree: true
          })
        }, 1000)

        editorRef.current = instance
      } catch (error) {
        console.error('Failed to initialize Editor.js:', error)
      }
    }

    // Use setTimeout to ensure DOM is ready
    timeoutId = setTimeout(initializeEditor, 0)

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (editorRef.current) {
        editorRef.current.destroy?.()
        editorRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div id={editorId} ref={holderRef} className={cn("min-h-[500px]", className)} />
}

// Enhanced HTML -> EditorJS initial blocks helper
function htmlToInitialBlocks(html: string) {
  if (!html || typeof html !== "string") return []
  
  // Clean up and normalize HTML
  let cleanHtml = html
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n\s*\n/g, '\n\n') // Normalize multiple line breaks
    .replace(/<div><br><\/div>/g, '<p><br></p>') // Convert empty divs to paragraphs
    .replace(/<div>/g, '<p>').replace(/<\/div>/g, '</p>') // Convert divs to paragraphs
    .trim()

  const tmp = document.createElement("div")
  tmp.innerHTML = cleanHtml
  const blocks: any[] = []

  // Process all child nodes
  const processNodes = (nodes: NodeList) => {
    nodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        
        // Handle headings (H1-H6)
        if (/^H[1-6]$/.test(el.tagName)) {
          const level = Math.min(Number(el.tagName.substring(1)), 3) // EditorJS supports max level 3
          blocks.push({ 
            type: "header", 
            data: { 
              text: el.innerHTML.trim(), 
              level: level 
            } 
          })
          return
        }
        
        // Handle paragraphs with enhanced formatting detection
        if (el.tagName === "P") {
          const text = el.innerHTML.trim()
          if (text && text !== "<br>" && text !== "&nbsp;") {
            blocks.push({ type: "paragraph", data: { text } })
          } else if (text === "<br>") {
            // Empty paragraph for line break
            blocks.push({ type: "paragraph", data: { text: "" } })
          }
          return
        }
        
        // Handle unordered lists
        if (el.tagName === "UL") {
          const items = Array.from(el.querySelectorAll("li")).map(li => {
            return (li as HTMLElement).innerHTML.trim()
          }).filter(item => item.length > 0)
          if (items.length > 0) {
            blocks.push({ type: "list", data: { style: "unordered", items } })
          }
          return
        }
        
        // Handle ordered lists
        if (el.tagName === "OL") {
          const items = Array.from(el.querySelectorAll("li")).map(li => {
            return (li as HTMLElement).innerHTML.trim()
          }).filter(item => item.length > 0)
          if (items.length > 0) {
            blocks.push({ type: "list", data: { style: "ordered", items } })
          }
          return
        }
        
        // Handle code blocks
        if (el.tagName === "PRE" || el.tagName === "CODE") {
          const code = (el.textContent || "").trim()
          if (code) {
            blocks.push({ type: "code", data: { code } })
          }
          return
        }
        
        // Handle images
        if (el.tagName === "IMG") {
          const url = (el as HTMLImageElement).src
          const caption = el.getAttribute("alt") || el.getAttribute("title") || ""
          blocks.push({ type: "image", data: { file: { url }, caption } })
          return
        }
        
        // Handle horizontal rules
        if (el.tagName === "HR") {
          // EditorJS doesn't have a built-in delimiter, so use a paragraph with a line
          blocks.push({ type: "paragraph", data: { text: "---" } })
          return
        }
        
        // Handle blockquotes
        if (el.tagName === "BLOCKQUOTE") {
          const text = el.innerHTML.trim()
          if (text) {
            blocks.push({ type: "quote", data: { text, caption: "" } })
          }
          return
        }
        
        // Handle line breaks in content by splitting
        if (el.innerHTML.includes('<br>')) {
          const parts = el.innerHTML.split('<br>').filter(part => part.trim())
          parts.forEach(part => {
            const cleanPart = part.trim()
            if (cleanPart) {
              blocks.push({ type: "paragraph", data: { text: cleanPart } })
            }
          })
          return
        }
        
        // Fallback: treat as paragraph if it has meaningful content
        const text = el.innerHTML.trim()
        if (text && text !== "<br>" && text !== "&nbsp;") {
          blocks.push({ type: "paragraph", data: { text } })
        }
        
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        if (text) {
          blocks.push({ type: "paragraph", data: { text: text.replace(/\n/g, '<br>') } })
        }
      }
    })
  }

  // Special handling for pasted content that might come as plain text with line breaks
  if (tmp.children.length === 0 && tmp.textContent) {
    // Handle plain text with line breaks
    const lines = tmp.textContent.split('\n').filter(line => line.trim())
    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine) {
        // Check if it looks like a heading (starts with # or is short and might be a title)
        if (trimmedLine.match(/^#{1,3}\s/) || (trimmedLine.length < 100 && !trimmedLine.includes('.'))) {
          const level = trimmedLine.startsWith('###') ? 3 : trimmedLine.startsWith('##') ? 2 : 1
          const text = trimmedLine.replace(/^#{1,3}\s*/, '')
          blocks.push({ type: "header", data: { text, level } })
        } else {
          blocks.push({ type: "paragraph", data: { text: trimmedLine } })
        }
      }
    })
  } else {
    processNodes(tmp.childNodes)
  }

  return blocks
}
