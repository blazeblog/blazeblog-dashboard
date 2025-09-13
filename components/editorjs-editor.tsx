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

        const [Header, List, Checklist, Quote, Table, InlineCode, Marker] = await Promise.all([
          import("@editorjs/header").then(m => m.default as any),
          import("@editorjs/list").then(m => m.default as any),
          import("@editorjs/checklist").then(m => m.default as any),
          import("@editorjs/quote").then(m => m.default as any),
          import("@editorjs/table").then(m => m.default as any),
          import("@editorjs/inline-code").then(m => m.default as any),
          import("@editorjs/marker").then(m => m.default as any),
        ])

        // Enhanced Code Tool with react-syntax-highlighter
        class EnhancedCodeTool {
          api: any
          data: any
          wrapper: HTMLElement | undefined

          static get toolbox() {
            return {
              title: 'Code',
              icon: '<svg width="14" height="14" viewBox="0 -1 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M3.177 6.852c.205.253.347.572.427.954.078.372.117.844.117 1.417 0 .418.01.725.03.92.02.18.057.314.107.396.046.075.093.117.14.134.075.027.218.056.42.083a.855.855 0 0 1 .56.297c.145.167.215.38.215.636 0 .612-.432.918-1.295.918-.245 0-.532-.065-.862-.196-.35-.144-.528-.334-.528-.569 0-.206.046-.43.139-.671.093-.264.139-.45.139-.562 0-.206-.023-.31-.07-.31-.047 0-.07.04-.07.116a.443.443 0 0 1-.02.07c-.005.02-.02.056-.046.107-.016.027-.016.023-.016.027 0 .206-.068.31-.204.31-.018 0-.053-.006-.103-.02a.1.1 0 0 1-.055-.055c-.015-.033-.023-.072-.023-.116l-.001-.018c0-.378.02-.61.058-.693.039-.083.084-.124.138-.124.033 0 .053.024.06.073.01.05.017.072.023.073.01.003.017 0 .024-.01.006-.016.009-.03.009-.044 0-.107-.138-.107-.414-.107-.276 0-.414 0-.414.107 0 .085.008.196.025.334.01.107.01.214.01.32 0 .534-.117.801-.35.801-.233 0-.35-.267-.35-.8 0-.107 0-.214.01-.321.017-.138.025-.249.025-.334 0-.107-.138-.107-.414-.107-.276 0-.414 0-.414.107a.337.337 0 0 0 .009.044c.007.01.014.013.024.01.006-.001.013-.023.023-.073.007-.049.027-.073.06-.073.054 0 .099.041.138.124.038.083.058.315.058.693l-.001.018c0 .044-.008.083-.023.116a.1.1 0 0 1-.055.055c-.05.014-.085.02-.103.02-.136 0-.204-.104-.204-.31 0-.004 0 0-.016-.027-.026-.051-.041-.087-.046-.107a.443.443 0 0 1-.02-.07c0-.076-.023-.116-.07-.116-.047 0-.07.104-.07.31 0 .112.046.298.139.562.093.241.139.465.139.671 0 .235-.178.425-.528.569-.33.131-.617.196-.862.196-.863 0-1.295-.306-1.295-.918 0-.256.07-.469.215-.636a.855.855 0 0 1 .56-.297c.202-.027.345-.056.42-.083.047-.017.094-.059.14-.134.05-.082.087-.216.107-.396.02-.195.03-.502.03-.92 0-.573.039-1.045.117-1.417.08-.382.222-.701.427-.954.138-.171.302-.307.489-.408.177-.092.384-.138.618-.138.233 0 .44.046.618.138.187.101.351.237.489.408z"/></svg>'
            }
          }

          constructor({ data, api }: { data: any; api: any }) {
            this.api = api
            this.data = {
              code: data.code || '',
              language: data.language || 'javascript'
            }
            this.wrapper = undefined
          }

          render() {
            this.wrapper = document.createElement('div')
            this.wrapper.classList.add('enhanced-code-tool')
            this.wrapper.innerHTML = this.getHTML()
            
            // Add event listeners
            this.wrapper.querySelector('.code-language-select')?.addEventListener('change', (e: any) => {
              this.data.language = e.target.value
              this.updateSyntaxHighlighting()
            })
            
            this.wrapper.querySelector('.code-textarea')?.addEventListener('input', (e: any) => {
              this.data.code = e.target.value
              this.updateSyntaxHighlighting()
            })

            // Initial syntax highlighting
            setTimeout(() => this.updateSyntaxHighlighting(), 100)

            return this.wrapper
          }

          getHTML() {
            const languages = [
              { value: 'javascript', label: '🟨 JavaScript' },
              { value: 'typescript', label: '🔷 TypeScript' },
              { value: 'python', label: '🐍 Python' },
              { value: 'java', label: '☕ Java' },
              { value: 'cpp', label: '⚡ C++' },
              { value: 'c', label: '🔧 C' },
              { value: 'csharp', label: '🔷 C#' },
              { value: 'php', label: '🐘 PHP' },
              { value: 'ruby', label: '💎 Ruby' },
              { value: 'go', label: '🐹 Go' },
              { value: 'rust', label: '🦀 Rust' },
              { value: 'swift', label: '🍎 Swift' },
              { value: 'kotlin', label: '🟣 Kotlin' },
              { value: 'html', label: '🌐 HTML' },
              { value: 'css', label: '🎨 CSS' },
              { value: 'scss', label: '💅 SCSS' },
              { value: 'json', label: '📋 JSON' },
              { value: 'xml', label: '📄 XML' },
              { value: 'yaml', label: '📝 YAML' },
              { value: 'markdown', label: '📝 Markdown' },
              { value: 'sql', label: '🗃️ SQL' },
              { value: 'bash', label: '🖥️ Bash' },
              { value: 'powershell', label: '💻 PowerShell' },
              { value: 'dockerfile', label: '🐳 Dockerfile' },
              { value: 'plaintext', label: '📄 Plain Text' }
            ]

            const languageOptions = languages.map(lang => 
              `<option value="${lang.value}" ${this.data.language === lang.value ? 'selected' : ''}>${lang.label}</option>`
            ).join('')

            return `
              <div class="enhanced-code-editor bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <!-- Header -->
                <div class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="flex gap-1.5">
                      <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Code Editor</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <label class="text-xs text-gray-500 dark:text-gray-400">Language:</label>
                    <select class="code-language-select text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100">
                      ${languageOptions}
                    </select>
                  </div>
                </div>

                <!-- Code Editor -->
                <div class="relative">
                  <textarea 
                    class="code-textarea w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm p-4 border-0 resize-none focus:outline-none focus:ring-0 min-h-[200px]" 
                    placeholder="Enter your code here..."
                    spellcheck="false">${this.data.code}</textarea>
                  
                  <!-- Syntax highlighted preview overlay -->
                  <div class="syntax-highlight-overlay absolute inset-0 pointer-events-none font-mono text-sm p-4 overflow-hidden">
                    <pre class="syntax-content whitespace-pre-wrap break-words m-0 leading-relaxed"></pre>
                  </div>
                </div>

                <!-- Footer -->
                <div class="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                  <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Press Tab to indent, Shift+Tab to unindent</span>
                    <span class="code-length">0 characters</span>
                  </div>
                </div>
              </div>
            `
          }

          async updateSyntaxHighlighting() {
            const textarea = this.wrapper?.querySelector('.code-textarea') as HTMLTextAreaElement
            const overlay = this.wrapper?.querySelector('.syntax-content') as HTMLElement
            const lengthIndicator = this.wrapper?.querySelector('.code-length') as HTMLElement
            
            if (!textarea || !overlay || !lengthIndicator) return

            const code = textarea.value
            lengthIndicator.textContent = code.length + ' characters'

            try {
              // Use Prism.js directly for syntax highlighting
              const Prism = (await import('prismjs')).default
              
              // Import core languages
              await import('prismjs/components/prism-javascript')
              await import('prismjs/components/prism-typescript')
              await import('prismjs/components/prism-python')
              await import('prismjs/components/prism-java')
              await import('prismjs/components/prism-cpp')
              await import('prismjs/components/prism-c')
              await import('prismjs/components/prism-csharp')
              await import('prismjs/components/prism-php')
              await import('prismjs/components/prism-ruby')
              await import('prismjs/components/prism-go')
              await import('prismjs/components/prism-rust')
              await import('prismjs/components/prism-swift')
              await import('prismjs/components/prism-kotlin')
              await import('prismjs/components/prism-css')
              await import('prismjs/components/prism-scss')
              await import('prismjs/components/prism-json')
              await import('prismjs/components/prism-yaml')
              await import('prismjs/components/prism-markdown')
              await import('prismjs/components/prism-sql')
              await import('prismjs/components/prism-bash')
              await import('prismjs/components/prism-powershell')
              await import('prismjs/components/prism-docker')
              
              // Map language aliases
              const languageMap: { [key: string]: string } = {
                'javascript': 'javascript',
                'typescript': 'typescript', 
                'python': 'python',
                'java': 'java',
                'cpp': 'cpp',
                'c': 'c',
                'csharp': 'csharp',
                'php': 'php',
                'ruby': 'ruby',
                'go': 'go',
                'rust': 'rust',
                'swift': 'swift',
                'kotlin': 'kotlin',
                'html': 'markup',
                'css': 'css',
                'scss': 'scss',
                'json': 'json',
                'xml': 'markup',
                'yaml': 'yaml',
                'markdown': 'markdown',
                'sql': 'sql',
                'bash': 'bash',
                'powershell': 'powershell',
                'dockerfile': 'docker',
                'plaintext': 'plaintext'
              }
              
              const prismLanguage = languageMap[this.data.language] || 'plaintext'
              
              // Apply syntax highlighting
              let highlightedCode = code
              if (prismLanguage !== 'plaintext' && Prism.languages[prismLanguage]) {
                highlightedCode = Prism.highlight(code, Prism.languages[prismLanguage], prismLanguage)
              }
              
              // Check if dark mode is active and apply appropriate styling
              const isDarkMode = document.documentElement.classList.contains('dark')
              
              overlay.innerHTML = `<code class="language-${prismLanguage} ${isDarkMode ? 'dark-theme' : 'light-theme'}">${highlightedCode}</code>`
              
              // Apply CSS theme
              const codeElement = overlay.querySelector('code')
              if (codeElement) {
                if (isDarkMode) {
                  codeElement.style.cssText = `
                    color: #f8f8f2;
                    background: transparent;
                  `
                  // Dark theme token colors
                  const style = document.createElement('style')
                  style.textContent = `
                    .syntax-highlight-overlay .dark-theme .token.comment,
                    .syntax-highlight-overlay .dark-theme .token.prolog,
                    .syntax-highlight-overlay .dark-theme .token.doctype,
                    .syntax-highlight-overlay .dark-theme .token.cdata { color: #6272a4; }
                    .syntax-highlight-overlay .dark-theme .token.punctuation { color: #f8f8f2; }
                    .syntax-highlight-overlay .dark-theme .token.property,
                    .syntax-highlight-overlay .dark-theme .token.tag,
                    .syntax-highlight-overlay .dark-theme .token.constant,
                    .syntax-highlight-overlay .dark-theme .token.symbol,
                    .syntax-highlight-overlay .dark-theme .token.deleted { color: #ff79c6; }
                    .syntax-highlight-overlay .dark-theme .token.boolean,
                    .syntax-highlight-overlay .dark-theme .token.number { color: #bd93f9; }
                    .syntax-highlight-overlay .dark-theme .token.selector,
                    .syntax-highlight-overlay .dark-theme .token.attr-name,
                    .syntax-highlight-overlay .dark-theme .token.string,
                    .syntax-highlight-overlay .dark-theme .token.char,
                    .syntax-highlight-overlay .dark-theme .token.builtin,
                    .syntax-highlight-overlay .dark-theme .token.inserted { color: #50fa7b; }
                    .syntax-highlight-overlay .dark-theme .token.operator,
                    .syntax-highlight-overlay .dark-theme .token.entity,
                    .syntax-highlight-overlay .dark-theme .token.url,
                    .syntax-highlight-overlay .dark-theme .token.variable { color: #f8f8f2; }
                    .syntax-highlight-overlay .dark-theme .token.atrule,
                    .syntax-highlight-overlay .dark-theme .token.attr-value,
                    .syntax-highlight-overlay .dark-theme .token.function,
                    .syntax-highlight-overlay .dark-theme .token.class-name { color: #f1fa8c; }
                    .syntax-highlight-overlay .dark-theme .token.keyword { color: #8be9fd; }
                  `
                  if (!document.querySelector('#enhanced-code-dark-theme')) {
                    style.id = 'enhanced-code-dark-theme'
                    document.head.appendChild(style)
                  }
                } else {
                  codeElement.style.cssText = `
                    color: #383a42;
                    background: transparent;
                  `
                  // Light theme token colors
                  const style = document.createElement('style')
                  style.textContent = `
                    .syntax-highlight-overlay .light-theme .token.comment,
                    .syntax-highlight-overlay .light-theme .token.prolog,
                    .syntax-highlight-overlay .light-theme .token.doctype,
                    .syntax-highlight-overlay .light-theme .token.cdata { color: #a0a1a7; }
                    .syntax-highlight-overlay .light-theme .token.punctuation { color: #383a42; }
                    .syntax-highlight-overlay .light-theme .token.property,
                    .syntax-highlight-overlay .light-theme .token.tag,
                    .syntax-highlight-overlay .light-theme .token.constant,
                    .syntax-highlight-overlay .light-theme .token.symbol,
                    .syntax-highlight-overlay .light-theme .token.deleted { color: #e45649; }
                    .syntax-highlight-overlay .light-theme .token.boolean,
                    .syntax-highlight-overlay .light-theme .token.number { color: #986801; }
                    .syntax-highlight-overlay .light-theme .token.selector,
                    .syntax-highlight-overlay .light-theme .token.attr-name,
                    .syntax-highlight-overlay .light-theme .token.string,
                    .syntax-highlight-overlay .light-theme .token.char,
                    .syntax-highlight-overlay .light-theme .token.builtin,
                    .syntax-highlight-overlay .light-theme .token.inserted { color: #50a14f; }
                    .syntax-highlight-overlay .light-theme .token.operator,
                    .syntax-highlight-overlay .light-theme .token.entity,
                    .syntax-highlight-overlay .light-theme .token.url,
                    .syntax-highlight-overlay .light-theme .token.variable { color: #383a42; }
                    .syntax-highlight-overlay .light-theme .token.atrule,
                    .syntax-highlight-overlay .light-theme .token.attr-value,
                    .syntax-highlight-overlay .light-theme .token.function,
                    .syntax-highlight-overlay .light-theme .token.class-name { color: #4078f2; }
                    .syntax-highlight-overlay .light-theme .token.keyword { color: #a626a4; }
                  `
                  if (!document.querySelector('#enhanced-code-light-theme')) {
                    style.id = 'enhanced-code-light-theme'
                    document.head.appendChild(style)
                  }
                }
              }
              
              // Make textarea transparent so we can see the highlighting underneath
              textarea.style.color = 'transparent'
              textarea.style.caretColor = isDarkMode ? '#9CA3AF' : '#374151'
              
            } catch (error) {
              console.warn('Syntax highlighting failed, using fallback:', error)
              // Fallback to simple text display
              overlay.textContent = code
              textarea.style.color = 'transparent'
              textarea.style.caretColor = '#374151'
            }
          }

          save(blockContent: any) {
            return this.data
          }

          static get sanitize() {
            return {
              code: {},
              language: false
            }
          }
        }

        const ImageTool = (await import("@editorjs/image")).default as any
        const DragDrop = (await import("editorjs-drag-drop")).default as any
        const Undo = (await import("editorjs-undo")).default as any

        // Custom CTA Tool
        class CTATool {
          api: any
          data: any
          wrapper: HTMLElement | undefined

          static get toolbox() {
            return {
              title: 'CTA',
              icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 103-53z"/><path d="M291 150l-103 53-81-72-67 44v79c0 19 15 34 34 34h178c19 0 34-15 34-34z"/></svg>'
            }
          }

          constructor({ data, api }: { data: any; api: any }) {
            this.api = api
            this.data = {
              title: data.title || '',
              description: data.description || '',
              buttonText: data.buttonText || 'Learn more',
              buttonUrl: data.buttonUrl || '',
              sponsored: data.sponsored || false,
              style: data.style || 'default'
            }
            this.wrapper = undefined
          }

          render() {
            this.wrapper = document.createElement('div')
            this.wrapper.classList.add('cta-tool')
            this.wrapper.innerHTML = this.getHTML()
            
            // Add event listeners
            this.wrapper.querySelector('.cta-title')?.addEventListener('input', (e: any) => {
              this.data.title = e.target.textContent
            })
            
            this.wrapper.querySelector('.cta-description')?.addEventListener('input', (e: any) => {
              this.data.description = e.target.textContent
            })
            
            this.wrapper.querySelector('.cta-button-text')?.addEventListener('input', (e: any) => {
              this.data.buttonText = e.target.textContent
            })
            
            this.wrapper.querySelector('.cta-url-input')?.addEventListener('input', (e: any) => {
              this.data.buttonUrl = e.target.value
            })
            
            this.wrapper.querySelector('.cta-sponsored-toggle')?.addEventListener('change', (e: any) => {
              this.data.sponsored = e.target.checked
              this.updatePreview()
            })
            
            this.wrapper.querySelector('.cta-style-select')?.addEventListener('change', (e: any) => {
              this.data.style = e.target.value
              this.updatePreview()
            })

            return this.wrapper
          }

          getHTML() {
            return `
              <div class="cta-editor bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                <!-- Header -->
                <div class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-600 dark:bg-gray-500 rounded-lg flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <path d="M7 13l3 3 7-7"/>
                        <path d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8"/>
                        <path d="M21 8L12 2 3 8v0"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900 dark:text-gray-100">Call to Action</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Create an engaging CTA to drive conversions</p>
                    </div>
                  </div>
                </div>

                <!-- Settings Panel -->
                <div class="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <div class="space-y-4">
                    <!-- Sponsored Toggle -->
                    <div class="flex items-center justify-between">
                      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Sponsored Content</label>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="cta-sponsored-toggle sr-only" ${this.data.sponsored ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600 dark:peer-checked:bg-gray-500"></div>
                      </label>
                    </div>

                    <!-- Style Selector -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Button Style</label>
                      <select class="cta-style-select w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="default" ${this.data.style === 'default' ? 'selected' : ''}>🎯 Default</option>
                        <option value="gradient" ${this.data.style === 'gradient' ? 'selected' : ''}>✨ Gradient</option>
                        <option value="outline" ${this.data.style === 'outline' ? 'selected' : ''}>📋 Outline</option>
                        <option value="minimal" ${this.data.style === 'minimal' ? 'selected' : ''}>🔗 Minimal</option>
                      </select>
                    </div>

                    <!-- URL Input -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Button URL</label>
                      <div class="relative">
                        <input type="url" class="cta-url-input w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-8" placeholder="https://example.com" value="${this.data.buttonUrl}">
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Preview Section -->
                <div class="p-6 bg-white dark:bg-gray-900">
                  <div class="mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Live Preview</span>
                  </div>
                  <div class="cta-preview bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                    ${this.getPreviewHTML()}
                  </div>
                </div>
              </div>
            `
          }

          getPreviewHTML() {
            const sponsoredLabel = this.data.sponsored ? 
              `<div class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full mb-4">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                SPONSORED CONTENT
              </div>` : ''
            
            const styleClasses = this.getStyleClasses()
            const placeholderTitle = this.data.title || 'Enter your compelling headline here...'
            const placeholderDesc = this.data.description || 'Add a description that explains the value proposition and encourages action.'
            const placeholderButton = this.data.buttonText || 'Get Started'
            
            return `
              ${sponsoredLabel}
              <div class="space-y-4">
                <h3 contenteditable="true" 
                    class="cta-title text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-lg px-2 py-1 -mx-2 -my-1 transition-all ${!this.data.title ? 'text-gray-400 dark:text-gray-500' : ''}" 
                    data-placeholder="Enter your compelling headline here...">${placeholderTitle}</h3>
                
                <p contenteditable="true" 
                   class="cta-description text-lg text-gray-600 dark:text-gray-300 leading-relaxed outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-lg px-2 py-1 -mx-2 -my-1 transition-all ${!this.data.description ? 'text-gray-400 dark:text-gray-500' : ''}" 
                   data-placeholder="Add a description that explains the value proposition...">${placeholderDesc}</p>
                
                <div class="pt-2">
                  <div class="cta-button ${styleClasses} group">
                    <span contenteditable="true" 
                          class="cta-button-text outline-none ${!this.data.buttonText ? 'text-opacity-60' : ''}" 
                          data-placeholder="Get Started">${placeholderButton}</span>
                    <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </div>
                </div>
              </div>
            `
          }

          getStyleClasses() {
            switch (this.data.style) {
              case 'gradient':
                return 'inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 text-white font-semibold rounded-lg cursor-pointer hover:from-gray-800 hover:to-gray-950 dark:hover:from-gray-700 dark:hover:to-gray-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl'
              case 'outline':
                return 'inline-flex items-center px-6 py-3 border-2 border-gray-900 dark:border-gray-300 text-gray-900 dark:text-gray-300 font-semibold rounded-lg cursor-pointer hover:bg-gray-900 hover:text-white dark:hover:bg-gray-300 dark:hover:text-gray-900 transform hover:scale-105 transition-all duration-200'
              case 'minimal':
                return 'inline-flex items-center text-gray-700 dark:text-gray-400 font-semibold cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200 underline-offset-4 hover:underline'
              default:
                return 'inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white font-semibold rounded-lg cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl'
            }
          }

          updatePreview() {
            const preview = this.wrapper?.querySelector('.cta-preview')
            if (preview) {
              preview.innerHTML = this.getPreviewHTML()
              
              // Re-attach event listeners for editable content
              preview.querySelector('.cta-title')?.addEventListener('input', (e: any) => {
                this.data.title = e.target.textContent
              })
              
              preview.querySelector('.cta-description')?.addEventListener('input', (e: any) => {
                this.data.description = e.target.textContent
              })
              
              preview.querySelector('.cta-button-text')?.addEventListener('input', (e: any) => {
                this.data.buttonText = e.target.textContent
              })
            }
          }

          save(blockContent: any) {
            return this.data
          }

          static get sanitize() {
            return {
              title: {},
              description: {},
              buttonText: {},
              buttonUrl: false,
              sponsored: false,
              style: false
            }
          }
        }

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
            code: { class: EnhancedCodeTool },
            inlineCode: { class: InlineCode },
            marker: { class: Marker },
            quote: { class: Quote, inlineToolbar: true },
            table: { class: Table },
            cta: { class: CTATool },
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

        new DragDrop(instance, editorId)
        
        // Initialize undo functionality
        new Undo({ editor: instance })

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
