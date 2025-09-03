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

interface PostLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  title?: string
  status?: "draft" | "published" | "scheduled"
  publishDate?: string
  onSave?: () => void
  onPublish?: () => void
  onStatusChange?: (status: "draft" | "published" | "scheduled") => void
  onSchedule?: (date: string) => void
  isLoading?: boolean
  isOnline?: boolean
  isSaving?: boolean
  lastSaved?: Date | null
  autoSaveEnabled?: boolean
}

export function PostLayout({
  children,
  sidebar,
  title = "Untitled Post",
  status = "draft",
  publishDate,
  onSave,
  onPublish,
  onStatusChange,
  onSchedule,
  isLoading = false,
  isOnline = true,
  isSaving = false,
  lastSaved = null,
  autoSaveEnabled = true,
}: PostLayoutProps) {
  const router = useRouter()
  const [showSidebar, setShowSidebar] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [tempPublishDate, setTempPublishDate] = useState(publishDate || "")

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="flex h-16 items-center justify-between px-6 border-b bg-background">
        {/* Left side - Back button and status */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/posts")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Posts
          </Button>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {title === "Untitled Post" ? "Draft - Saved" : `${title} - Saved`}
            </span>
            <Badge variant="secondary" className="text-xs">
              {status === "draft" && "Draft"}
              {status === "published" && "Published"} 
              {status === "scheduled" && "Scheduled"}
            </Badge>
          </div>
        </div>

        {/* Right side - Actions and settings */}
        <div className="flex items-center gap-4">
          {/* Status indicators */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <ConnectivityIndicator isOnline={isOnline} />
            <AutoSaveIndicator
              lastSaved={lastSaved}
              isSaving={isSaving}
              autoSaveEnabled={autoSaveEnabled}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isLoading}
            >
              Preview
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  disabled={isLoading || !title || title === "Untitled Post"}
                  className="bg-green-600 hover:bg-green-700 text-white gap-1"
                >
                  {isLoading ? 'Publishing...' : 
                   status === 'published' ? 'Update' :
                   status === 'scheduled' ? 'Scheduled' :
                   'Publish'}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onPublish}>
                  Publish Now
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  onStatusChange?.("draft")
                }}>
                  Save as Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowScheduleModal(true)}>
                  Schedule for Later
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings toggle */}
            {sidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className={cn(
                  "ml-2",
                  showSidebar && "bg-muted"
                )}
              >
                <Settings2 className="h-4 w-4" />
                Post settings
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main editor area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>

        {/* Collapsible right sidebar */}
        {sidebar && showSidebar && (
          <aside className="w-96 border-l bg-muted/30 overflow-y-auto">
            <div className="sticky top-0 bg-muted/30 border-b p-4 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Post settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {sidebar}
            </div>
          </aside>
        )}
      </div>

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Date & Time</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={tempPublishDate ? tempPublishDate.split('T')[0] : new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    const time = tempPublishDate ? tempPublishDate.split('T')[1] || '09:00' : '09:00'
                    setTempPublishDate(`${e.target.value}T${time}`)
                  }}
                  className="flex-1"
                />
                <Input
                  type="time"
                  value={tempPublishDate ? tempPublishDate.split('T')[1]?.substring(0, 5) || '09:00' : '09:00'}
                  onChange={(e) => {
                    const date = tempPublishDate ? tempPublishDate.split('T')[0] : new Date().toISOString().split('T')[0]
                    setTempPublishDate(`${date}T${e.target.value}:00`)
                  }}
                  className="w-28"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  tomorrow.setHours(9, 0, 0, 0)
                  setTempPublishDate(tomorrow.toISOString().slice(0, 16))
                }}
              >
                Tomorrow 9 AM
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const sixHours = new Date()
                  sixHours.setHours(sixHours.getHours() + 6)
                  setTempPublishDate(sixHours.toISOString().slice(0, 16))
                }}
              >
                In 6 Hours
              </Button>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowScheduleModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  onSchedule?.(tempPublishDate)
                  onStatusChange?.("scheduled")
                  setShowScheduleModal(false)
                }}
                className="flex-1"
              >
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}