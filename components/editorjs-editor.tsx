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

// Minimal HTML -> EditorJS initial blocks helper
function htmlToInitialBlocks(html: string) {
  if (!html || typeof html !== "string") return []
  const tmp = document.createElement("div")
  tmp.innerHTML = html
  const blocks: any[] = []

  // Simple mapping for common tags; fall back to paragraph text
  tmp.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      if (/^H[1-3]$/.test(el.tagName)) {
        blocks.push({ type: "header", data: { text: el.innerHTML, level: Number(el.tagName.substring(1)) } })
        return
      }
      if (el.tagName === "P") {
        blocks.push({ type: "paragraph", data: { text: el.innerHTML } })
        return
      }
      if (el.tagName === "UL") {
        const items = Array.from(el.querySelectorAll("li")).map(li => (li as HTMLElement).innerHTML)
        blocks.push({ type: "list", data: { style: "unordered", items } })
        return
      }
      if (el.tagName === "OL") {
        const items = Array.from(el.querySelectorAll("li")).map(li => (li as HTMLElement).innerHTML)
        blocks.push({ type: "list", data: { style: "ordered", items } })
        return
      }
      if (el.tagName === "PRE") {
        const code = (el.textContent || "").trim()
        if (code) blocks.push({ type: "code", data: { code } })
        return
      }
      if (el.tagName === "IMG") {
        const url = (el as HTMLImageElement).src
        blocks.push({ type: "image", data: { file: { url }, caption: el.getAttribute("alt") || "" } })
        return
      }
      // Fallback: push text content as paragraph
      const text = el.innerHTML
      if (text) blocks.push({ type: "paragraph", data: { text } })
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) blocks.push({ type: "paragraph", data: { text } })
    }
  })
  return blocks
}

