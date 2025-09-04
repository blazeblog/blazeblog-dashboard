"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Monitor, Smartphone, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PostPreviewPageProps {
  // No props needed - using hardcoded URL
}

export function PostPreviewPage({}: PostPreviewPageProps = {}) {
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Hardcoded BlazeBlog URL as requested
  const blogUrl = "https://kushagra.blazeblog.xyz/software-engineers-the-power-of-side-projects"

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  return (
    <div 
      className="min-h-screen bg-black"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Header */}
      <header 
        className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50"
        style={{ 
          backgroundColor: '#000000',
          borderBottomColor: '#262626'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
            
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-slate-400">Previewing:</span>
                <Badge variant="outline" className="border-slate-600 text-slate-300 bg-slate-800">Software Engineers: The Power of Side Projects</Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex items-center bg-slate-700 rounded-lg p-1">
                <Button
                  variant={activeView === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('desktop')}
                  className={cn(
                    "h-7 px-3",
                    activeView === 'desktop' 
                      ? "bg-slate-600 text-white" 
                      : "text-slate-300 hover:text-white hover:bg-slate-600"
                  )}
                >
                  <Monitor className="h-3 w-3 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={activeView === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('mobile')}
                  className={cn(
                    "h-7 px-3",
                    activeView === 'mobile' 
                      ? "bg-slate-600 text-white" 
                      : "text-slate-300 hover:text-white hover:bg-slate-600"
                  )}
                >
                  <Smartphone className="h-3 w-3 mr-1" />
                  Mobile
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(blogUrl, '_blank')}
                className="hidden md:flex items-center space-x-1 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Live Site</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Preview Content */}
      <main 
        className="py-8 bg-black"
        style={{ backgroundColor: '#000000' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="flex justify-center bg-black"
            style={{ backgroundColor: '#000000' }}
          >
            
            {/* Desktop Mockup */}
            {activeView === 'desktop' && (
              <div className="relative">
                {/* Desktop Frame */}
                <div 
                  className="relative mx-auto bg-neutral-900 border-[16px] border-neutral-900 rounded-t-xl h-[660px] w-[1100px] overflow-hidden"
                  style={{ 
                    backgroundColor: '#171717',
                    borderColor: '#171717',
                    boxShadow: 'none',
                    outline: 'none'
                  }}
                >
                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 rounded-xl z-10">
                      <div className="text-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-400 border-t-transparent mx-auto"></div>
                        <p className="text-sm text-slate-300">Loading BlazeBlog...</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="rounded-xl h-[628px] overflow-hidden">
                    <iframe
                      src={blogUrl}
                      className="w-full h-full"
                      onLoad={handleIframeLoad}
                      title="Desktop Preview"
                    />
                  </div>
                </div>
                
                {/* Desktop Stand */}
                <div 
                  className="relative mx-auto bg-neutral-800 rounded-b-xl rounded-t-sm h-[17px] w-[1132px]"
                  style={{ backgroundColor: '#262626' }}
                ></div>
                <div 
                  className="relative mx-auto bg-neutral-800 rounded-xl h-[5px] w-[260px]"
                  style={{ backgroundColor: '#262626' }}
                ></div>
                
                <div className="text-center mt-4 text-sm text-slate-400">
                  Desktop Preview (1100×628)
                </div>
              </div>
            )}

            {/* Mobile Mockup */}
            {activeView === 'mobile' && (
              <div className="relative">
                {/* Mobile Frame */}
                <div 
                  className="relative mx-auto bg-neutral-900 border-[14px] border-neutral-900 rounded-[2.5rem] h-[700px] w-[350px] overflow-hidden"
                  style={{ 
                    backgroundColor: '#171717',
                    borderColor: '#171717',
                    boxShadow: 'none',
                    outline: 'none'
                  }}
                >
                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 rounded-[2rem] z-10">
                      <div className="text-center space-y-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-400 border-t-transparent mx-auto"></div>
                        <p className="text-xs text-slate-300">Loading BlazeBlog...</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="rounded-[2rem] w-[322px] h-[672px] overflow-hidden">
                    <iframe
                      src={blogUrl}
                      className="w-full h-full"
                      onLoad={handleIframeLoad}
                      title="Mobile Preview"
                    />
                  </div>
                </div>
                
                {/* Home Indicator */}
                <div 
                  className="absolute bottom-[20px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] bg-neutral-600 rounded-full"
                  style={{ backgroundColor: '#525252' }}
                ></div>
                
                <div className="text-center mt-4 text-sm text-slate-400">
                  Mobile Preview (322×672)
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}