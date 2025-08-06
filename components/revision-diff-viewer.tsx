"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  GitCompare, 
  RotateCcw, 
  SplitSquareHorizontal,
  AlignLeft,
  FileText,
  Plus,
  Minus
} from "lucide-react"
import { useRevisionService, RevisionUtils } from "@/lib/revision-service"
import { type PostRevision } from "@/lib/client-api"
import { cn } from "@/lib/utils"

// Import react-diff-view components and utilities
import { Diff, Hunk, parseDiff, markEdits } from "react-diff-view"
import { diffLines, createPatch } from "diff"

// Import react-diff-view styles
import "react-diff-view/style/index.css"
import "@/styles/diff-viewer.css"

interface RevisionDiffViewerProps {
  postId: string | number
  revision1?: PostRevision
  revision2?: PostRevision
  onClose?: () => void
  onRestore?: (revision: PostRevision) => void
  className?: string
}

export function RevisionDiffViewer({ 
  postId, 
  revision1, 
  revision2, 
  onClose,
  onRestore,
  className = "" 
}: RevisionDiffViewerProps) {
  const [revisions, setRevisions] = useState<PostRevision[]>([])
  const [selectedRevision1, setSelectedRevision1] = useState<PostRevision | null>(revision1 || null)
  const [selectedRevision2, setSelectedRevision2] = useState<PostRevision | null>(revision2 || null)
  const [viewType, setViewType] = useState<'split' | 'unified'>('split')
  const [diffField, setDiffField] = useState<'title' | 'content' | 'excerpt' | 'meta'>('content')
  const [loading, setLoading] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState<PostRevision | null>(null)
  
  const revisionService = useRevisionService()
  const { toast } = useToast()

  useEffect(() => {
    fetchRevisions()
  }, [postId])

  const fetchRevisions = async () => {
    try {
      setLoading(true)
      const data = await revisionService.getPostRevisions(postId)
      setRevisions(data)
      
      // Auto-select revisions if not provided
      if (!selectedRevision1 && data.length > 1) {
        setSelectedRevision1(data[1]) // Previous version
        setSelectedRevision2(data[0]) // Latest version
      }
    } catch (error) {
      console.error('Error fetching revisions:', error)
      toast({
        title: "Error",
        description: "Failed to load revisions for comparison.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Generate diff using react-diff-view
  const diffData = useMemo(() => {
    if (!selectedRevision1 || !selectedRevision2) return null

    try {
      const getFieldContent = (revision: PostRevision, field: string) => {
        switch (field) {
          case 'title': return revision.title || ''
          case 'content': return RevisionUtils.stripHtml(revision.content) || ''
          case 'excerpt': return revision.excerpt || ''
          case 'meta': return `Title: ${revision.metaTitle || ''}\nDescription: ${revision.metaDescription || ''}`
          default: return revision.content || ''
        }
      }

      const oldContent = getFieldContent(selectedRevision1, diffField)
      const newContent = getFieldContent(selectedRevision2, diffField)

      // If content is the same, return null
      if (oldContent === newContent) {
        return null
      }

      // Create a proper unified diff patch
      const patch = createPatch(
        'file', 
        oldContent, 
        newContent, 
        `v${selectedRevision1.versionNumber}`,
        `v${selectedRevision2.versionNumber}`,
        { context: 3 }
      )

      // Validate patch before parsing
      if (!patch || patch.trim() === '') {
        return null
      }


      // Parse the patch for react-diff-view
      const diffFiles = parseDiff(patch)
      
      if (!diffFiles || diffFiles.length === 0) return null

      const diffFile = diffFiles[0]
      if (!diffFile || !diffFile.hunks) return null

      const hunks = diffFile.hunks

      // Mark edits for word-level highlighting (simplified)
      let markedHunks
      try {
        markedHunks = markEdits(hunks, { type: 'word' as any })
      } catch (error) {
        console.warn('Failed to mark edits, using original hunks:', error)
        markedHunks = hunks
      }

      return {
        diffFile,
        hunks: markedHunks
      }
    } catch (error) {
      console.error('Error generating diff:', error)
      return null
    }
  }, [selectedRevision1, selectedRevision2, diffField])

  const getDiffStats = () => {
    if (!diffData || !diffData.hunks) {
      // Fallback calculation for simple diff
      if (selectedRevision1 && selectedRevision2) {
        const getFieldContent = (revision: PostRevision, field: string) => {
          switch (field) {
            case 'title': return revision.title || ''
            case 'content': return RevisionUtils.stripHtml(revision.content) || ''
            case 'excerpt': return revision.excerpt || ''
            case 'meta': return `Title: ${revision.metaTitle || ''}\nDescription: ${revision.metaDescription || ''}`
            default: return revision.content || ''
          }
        }

        const oldContent = getFieldContent(selectedRevision1, diffField)
        const newContent = getFieldContent(selectedRevision2, diffField)
        
        const oldLines = oldContent.split('\n')
        const newLines = newContent.split('\n')
        
        const maxLines = Math.max(oldLines.length, newLines.length)
        let added = 0
        let removed = 0
        
        for (let i = 0; i < maxLines; i++) {
          const oldLine = oldLines[i] || ''
          const newLine = newLines[i] || ''
          
          if (!oldLine && newLine) added++
          else if (oldLine && !newLine) removed++
          else if (oldLine !== newLine) {
            added++
            removed++
          }
        }
        
        return { added, removed, unchanged: 0, total: added + removed }
      }
      
      return { added: 0, removed: 0, unchanged: 0, total: 0 }
    }
    
    try {
      const { hunks } = diffData
      
      let added = 0
      let removed = 0
      
      if (Array.isArray(hunks)) {
        hunks.forEach((hunk: any) => {
          if (hunk.changes && Array.isArray(hunk.changes)) {
            hunk.changes.forEach((change: any) => {
              if (change.type === 'insert') added++
              if (change.type === 'delete') removed++
            })
          }
        })
      }
      
      return { 
        added, 
        removed, 
        unchanged: 0, // Not calculated
        total: added + removed
      }
    } catch (error) {
      console.error('Error calculating diff stats:', error)
      return { added: 0, removed: 0, unchanged: 0, total: 0 }
    }
  }

  const handleRestore = async (revision: PostRevision) => {
    try {
      await revisionService.restoreRevision(postId, revision.versionNumber)
      toast({
        title: "Success!",
        description: `Post restored to version ${revision.versionNumber} successfully.`,
        variant: "default"
      })
      onRestore?.(revision)
      setShowRestoreDialog(null)
    } catch (error) {
      console.error('Error restoring revision:', error)
      toast({
        title: "Error",
        description: "Failed to restore revision. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Fallback simple diff viewer
  const renderSimpleDiff = () => {
    if (!selectedRevision1 || !selectedRevision2) return null

    const getFieldContent = (revision: PostRevision, field: string) => {
      switch (field) {
        case 'title': return revision.title || ''
        case 'content': return RevisionUtils.stripHtml(revision.content) || ''
        case 'excerpt': return revision.excerpt || ''
        case 'meta': return `Title: ${revision.metaTitle || ''}\nDescription: ${revision.metaDescription || ''}`
        default: return revision.content || ''
      }
    }

    const oldContent = getFieldContent(selectedRevision1, diffField)
    const newContent = getFieldContent(selectedRevision2, diffField)

    const oldLines = oldContent.split('\n')
    const newLines = newContent.split('\n')

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/30 border-b px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              <span className="font-medium text-sm">
                v{selectedRevision1?.versionNumber} → v{selectedRevision2?.versionNumber}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline">
                {selectedRevision1?.creator?.username || 'Unknown'}
              </Badge>
              <span>→</span>
              <Badge variant="outline">
                {selectedRevision2?.creator?.username || 'Unknown'}
              </Badge>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-[500px]">
          {viewType === 'split' ? (
            <div className="grid grid-cols-2 gap-0">
              <div className="border-r">
                <div className="bg-red-50 dark:bg-red-950/20 border-b px-3 py-1 text-xs font-medium">
                  v{selectedRevision1?.versionNumber}
                </div>
                {oldLines.map((line, index) => (
                  <div key={index} className="px-3 py-1 text-sm font-mono whitespace-pre-wrap border-b border-border/30">
                    <span className="text-muted-foreground text-xs mr-2 select-none w-8 inline-block text-right">
                      {index + 1}
                    </span>
                    {line || ' '}
                  </div>
                ))}
              </div>
              <div>
                <div className="bg-green-50 dark:bg-green-950/20 border-b px-3 py-1 text-xs font-medium">
                  v{selectedRevision2?.versionNumber}
                </div>
                {newLines.map((line, index) => (
                  <div key={index} className="px-3 py-1 text-sm font-mono whitespace-pre-wrap border-b border-border/30">
                    <span className="text-muted-foreground text-xs mr-2 select-none w-8 inline-block text-right">
                      {index + 1}
                    </span>
                    {line || ' '}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Simple unified view */}
              <div className="p-3 text-sm">
                <div className="mb-4">
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">- Version {selectedRevision1?.versionNumber}</h4>
                  <pre className="bg-red-50 dark:bg-red-950/20 p-3 rounded whitespace-pre-wrap">{oldContent}</pre>
                </div>
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">+ Version {selectedRevision2?.versionNumber}</h4>
                  <pre className="bg-green-50 dark:bg-green-950/20 p-3 rounded whitespace-pre-wrap">{newContent}</pre>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    )
  }

  const renderDiff = () => {
    // First try advanced diff, fallback to simple diff on error
    if (!diffData) {
      if (!selectedRevision1 || !selectedRevision2) {
        return (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Select two revisions to compare their differences.</p>
          </div>
        )
      }
      
      // Check if content is identical
      const getFieldContent = (revision: PostRevision, field: string) => {
        switch (field) {
          case 'title': return revision.title || ''
          case 'content': return RevisionUtils.stripHtml(revision.content) || ''
          case 'excerpt': return revision.excerpt || ''
          case 'meta': return `Title: ${revision.metaTitle || ''}\nDescription: ${revision.metaDescription || ''}`
          default: return revision.content || ''
        }
      }

      const oldContent = getFieldContent(selectedRevision1, diffField)
      const newContent = getFieldContent(selectedRevision2, diffField)

      if (oldContent === newContent) {
        return (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No differences found between the selected versions.</p>
          </div>
        )
      }

      // Fallback to simple diff
      return renderSimpleDiff()
    }

    const { diffFile, hunks } = diffData

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/30 border-b px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              <span className="font-medium text-sm">
                v{selectedRevision1?.versionNumber} → v{selectedRevision2?.versionNumber}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline">
                {selectedRevision1?.creator?.username || 'Unknown'}
              </Badge>
              <span>→</span>
              <Badge variant="outline">
                {selectedRevision2?.creator?.username || 'Unknown'}
              </Badge>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-[500px]">
          <div className="diff-viewer">
            {hunks && hunks.length > 0 ? (
              <Diff viewType={viewType} diffType={diffFile.type || 'modify'} hunks={hunks as any}>
                {(hunksData: any) => 
                  Array.isArray(hunksData) 
                    ? hunksData.map((hunk: any, index: number) => (
                        <Hunk key={hunk.content || index} hunk={hunk} />
                      ))
                    : []
                }
              </Diff>
            ) : (
              renderSimpleDiff()
            )}
          </div>
        </ScrollArea>
      </div>
    )
  }

  const stats = getDiffStats()

  if (loading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground text-sm">Loading comparison...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!selectedRevision1 || !selectedRevision2) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Compare Revisions
          </CardTitle>
          <CardDescription>
            Select two revisions to compare their differences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">From Version</label>
              <Select
                value={selectedRevision1?.id?.toString() || ""}
                onValueChange={(value) => {
                  const revision = revisions.find(r => r.id.toString() === value)
                  setSelectedRevision1(revision || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {revisions.map((revision) => (
                    <SelectItem key={revision.id} value={revision.id.toString()}>
                      v{revision.versionNumber} - {revision.title.substring(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To Version</label>
              <Select
                value={selectedRevision2?.id?.toString() || ""}
                onValueChange={(value) => {
                  const revision = revisions.find(r => r.id.toString() === value)
                  setSelectedRevision2(revision || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {revisions.map((revision) => (
                    <SelectItem key={revision.id} value={revision.id.toString()}>
                      v{revision.versionNumber} - {revision.title.substring(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Compare Revisions
            </CardTitle>
            <CardDescription>
              v{selectedRevision1.versionNumber} → v{selectedRevision2.versionNumber}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onClose && (
              <Button type="button" onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Plus className="h-3 w-3" />
            {stats.added} added
          </div>
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <Minus className="h-3 w-3" />
            {stats.removed} removed
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <FileText className="h-3 w-3" />
            {stats.unchanged} unchanged
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Select value={diffField} onValueChange={(value: any) => setDiffField(value)}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="excerpt">Excerpt</SelectItem>
                <SelectItem value="meta">Meta Data</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                type="button"
                variant={viewType === 'split' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('split')}
                className="h-6 px-2"
              >
                <SplitSquareHorizontal className="h-3 w-3 mr-1" />
                Split
              </Button>
              <Button
                type="button"
                variant={viewType === 'unified' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('unified')}
                className="h-6 px-2"
              >
                <AlignLeft className="h-3 w-3 mr-1" />
                Unified
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRestoreDialog(selectedRevision1)}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restore v{selectedRevision1.versionNumber}
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 p-4 overflow-hidden">
        {renderDiff()}
      </CardContent>

      {/* Restore Confirmation Dialog */}
      {showRestoreDialog && (
        <AlertDialog open={!!showRestoreDialog} onOpenChange={() => setShowRestoreDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Restore to version {showRestoreDialog.versionNumber}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will create a new revision with the content from version {showRestoreDialog.versionNumber}.
                The current content will not be lost and can be restored later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleRestore(showRestoreDialog)}
              >
                Restore
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  )
}

export default RevisionDiffViewer