"use client"

import { useState } from "react"
import { X, Monitor, Smartphone, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PostPreviewProps {
  isOpen: boolean
  onClose: () => void
  postTitle: string
  previewUrl?: string
}

export function PostPreview({ isOpen, onClose, postTitle, previewUrl }: PostPreviewProps) {
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop')
  const [isLoading, setIsLoading] = useState(true)
  
  // For now, use the provided URL
  const defaultPreviewUrl = "https://kushagra.blazeblog.xyz/software-engineers-the-power-of-side-projects"
  const finalPreviewUrl = previewUrl || defaultPreviewUrl

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    // Force iframe reload by updating src
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-lg font-semibold">
                  Preview Post
                </DialogTitle>
                <Badge variant="outline" className="text-xs">
                  {postTitle || "Untitled Post"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <Button
                    variant={activeView === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('desktop')}
                    className="h-7 px-3"
                  >
                    <Monitor className="h-3 w-3 mr-1" />
                    Desktop
                  </Button>
                  <Button
                    variant={activeView === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('mobile')}
                    className="h-7 px-3"
                  >
                    <Smartphone className="h-3 w-3 mr-1" />
                    Mobile
                  </Button>
                </div>

                {/* Actions */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="h-8 w-8 p-0"
                  title="Refresh"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(finalPreviewUrl, '_blank')}
                  className="h-8 w-8 p-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                  title="Close"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* URL Display */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">Preview URL:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {finalPreviewUrl}
              </code>
            </div>
          </DialogHeader>

          {/* Preview Content */}
          <div className="flex-1 p-6 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="h-full flex items-center justify-center">
              
              {/* Desktop Mockup */}
              {activeView === 'desktop' && (
                <div className="relative">
                  {/* Desktop Frame */}
                  <div className="relative mx-auto border-gray-800 dark:border-gray-700 bg-gray-800 border-[16px] rounded-t-xl h-[500px] w-[800px]">
                    {/* Loading Indicator */}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl">
                        <div className="text-center space-y-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
                          <p className="text-sm text-muted-foreground">Loading preview...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Desktop Screen */}
                    <div className="rounded-xl h-[468px] overflow-hidden">
                      <iframe
                        id="preview-iframe"
                        src={finalPreviewUrl}
                        className="w-full h-full"
                        onLoad={handleIframeLoad}
                        title="Desktop Preview"
                      />
                    </div>
                  </div>
                  
                  {/* Desktop Stand */}
                  <div className="relative mx-auto bg-gray-900 dark:bg-gray-700 rounded-b-xl rounded-t-sm h-[17px] w-[800px]"></div>
                  <div className="relative mx-auto bg-gray-900 dark:bg-gray-700 rounded-xl h-[5px] w-[180px]"></div>
                </div>
              )}

              {/* Mobile Mockup */}
              {activeView === 'mobile' && (
                <div className="relative">
                  {/* Mobile Frame */}
                  <div className="relative mx-auto border-gray-800 dark:border-gray-700 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px]">
                    {/* Loading Indicator */}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-[2rem]">
                        <div className="text-center space-y-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
                          <p className="text-xs text-muted-foreground">Loading preview...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Mobile Screen */}
                    <div className="rounded-[2rem] w-[272px] h-[572px] bg-white dark:bg-gray-800 overflow-hidden">
                      <iframe
                        src={finalPreviewUrl}
                        className="w-full h-full"
                        onLoad={handleIframeLoad}
                        title="Mobile Preview"
                      />
                    </div>
                  </div>
                  
                  {/* Home Indicator */}
                  <div className="absolute bottom-[20px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] bg-gray-800 dark:bg-gray-400 rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t bg-muted/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Preview shows how your post will look on {activeView} devices
              </span>
              <span>
                Viewport: {activeView === 'desktop' ? '800×468' : '272×572'}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}