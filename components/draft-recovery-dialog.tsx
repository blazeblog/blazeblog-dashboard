"use client"

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { FileText, Trash2, Clock, User } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DraftPost } from '@/lib/indexeddb'

interface DraftRecoveryDialogProps {
  isOpen: boolean
  onClose: () => void
  drafts: DraftPost[]
  onRecover: (draft: DraftPost) => void
  onDelete: (draftId: string) => void
  currentPostId?: string
}

export function DraftRecoveryDialog({
  isOpen,
  onClose,
  drafts,
  onRecover,
  onDelete,
  currentPostId
}: DraftRecoveryDialogProps) {
  const [selectedDraft, setSelectedDraft] = useState<DraftPost | null>(null)

  const filteredDrafts = drafts.filter(draft => 
    draft.title.trim() || draft.content.trim()
  ).sort((a, b) => b.lastSaved - a.lastSaved)

  const handleRecover = (draft: DraftPost) => {
    onRecover(draft)
    onClose()
  }

  const handleDelete = async (draftId: string) => {
    await onDelete(draftId)
    if (selectedDraft?.id === draftId) {
      setSelectedDraft(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500'
      case 'draft':
        return 'bg-yellow-500'
      case 'archived':
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
    }
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recover Draft Posts
          </DialogTitle>
          <DialogDescription>
            Select a draft to recover or delete drafts you no longer need
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[500px]">
          {/* Draft List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Available Drafts ({filteredDrafts.length})</h3>
            </div>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredDrafts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No drafts found</p>
                  </div>
                ) : (
                  filteredDrafts.map((draft) => (
                    <Card 
                      key={draft.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedDraft?.id === draft.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedDraft(draft)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {draft.title || 'Untitled Post'}
                          </h4>
                          <Badge 
                            className={cn("text-xs", getStatusColor(draft.status))}
                          >
                            {draft.status}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {draft.content 
                            ? truncateText(draft.content.replace(/<[^>]*>/g, ''))
                            : 'No content'}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(draft.lastSaved))} ago
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Draft Preview */}
          <div className="border-l pl-4">
            {selectedDraft ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Preview</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(selectedDraft.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRecover(selectedDraft)}
                    >
                      Recover Draft
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Title</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedDraft.title || 'No title'}
                      </p>
                    </div>

                    {selectedDraft.excerpt && (
                      <div>
                        <h4 className="font-medium mb-1">Excerpt</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedDraft.excerpt}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-1">Content Preview</h4>
                      <div 
                        className="text-sm text-muted-foreground prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: selectedDraft.content.substring(0, 500) + 
                            (selectedDraft.content.length > 500 ? '...' : '')
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last saved: {formatDistanceToNow(new Date(selectedDraft.lastSaved))} ago
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {selectedDraft.status}
                      </Badge>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select a draft to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}