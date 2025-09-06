"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Settings2, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ConnectivityIndicator } from "@/components/connectivity-indicator"
import { AutoSaveIndicator } from "@/components/auto-save-indicator"

interface PageLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  title?: string
  status?: "draft" | "published" | "scheduled"
  mode?: "add" | "edit"
  onSave?: () => void
  onPreview?: () => void
  onPublish?: (status?: "draft" | "published" | "scheduled") => void
  onStatusChange?: (status: "draft" | "published" | "scheduled") => void
  isLoading?: boolean
  isOnline?: boolean
  isSaving?: boolean
  lastSaved?: Date | null
  autoSaveEnabled?: boolean
}

export function PageLayout({
  children,
  sidebar,
  title = "Untitled Page",
  status = "draft",
  mode,
  onSave,
  onPreview,
  onPublish,
  onStatusChange,
  isLoading = false,
  isOnline = true,
  isSaving = false,
  lastSaved = null,
  autoSaveEnabled = true,
}: PageLayoutProps) {
  const router = useRouter()
  const [showSidebar, setShowSidebar] = useState(false)
  // No scheduling for Pages per requirements

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="flex h-16 items-center justify-between px-4 md:px-6 border-b bg-background">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/pages")}
            className="flex items-center gap-1 md:gap-2 text-muted-foreground hover:text-foreground shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Pages</span>
          </Button>
          
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <span className="text-sm text-muted-foreground truncate max-w-[120px] md:max-w-none">
              {title === "Untitled Page" ? "Draft" : title}
            </span>
            <Badge variant="secondary" className="text-xs shrink-0">
              {status === "draft" && "Draft"}
              {status === "published" && "Published"} 
              {status === "scheduled" && "Scheduled"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-3 text-xs text-muted-foreground">
            <ConnectivityIndicator isOnline={isOnline} />
            <AutoSaveIndicator
              lastSaved={lastSaved}
              isSaving={isSaving}
              autoSaveEnabled={autoSaveEnabled}
            />
          </div>
          <div className="flex lg:hidden items-center gap-2 text-xs text-muted-foreground">
            <ConnectivityIndicator isOnline={isOnline} />
            {isSaving && <span className="text-xs">Saving...</span>}
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              disabled={isLoading}
              className="hidden sm:flex"
            >
              Preview
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  disabled={isLoading || !title || title === "Untitled Page"}
                  className="bg-green-600 hover:bg-green-700 text-white gap-1"
                >
                  <span className="hidden sm:inline">
                    {isLoading ? '...' : 
                      status === 'published' ? 'Update Page' :
                      'Publish Page'}
                  </span>
                  <span className="sm:hidden">
                    {isLoading ? '...' : 
                     status === 'published' ? 'Update' :
                     'Pub'}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPublish?.("published")}>Publish Now</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPublish?.("draft")}>Save as Draft</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {sidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className={cn("shrink-0", showSidebar && "bg-muted")}
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden md:inline ml-1">Page settings</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>

        {sidebar && showSidebar && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowSidebar(false)} />
            <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l overflow-y-auto z-50 md:static md:w-96 md:bg-muted/30 md:z-auto">
              <div className="sticky top-0 backdrop-blur-2xl bg-background border-b p-4 flex items-center justify-between md:bg-muted/30 z-20">
                <h3 className="font-semibold text-sm">Page settings</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">{sidebar}</div>
            </aside>
          </>
        )}
      </div>

      {/* No schedule modal for Pages */}
    </div>
  )
}
