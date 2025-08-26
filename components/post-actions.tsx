"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClientApi } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"

interface PostActionsProps {
  postId: number
  onDelete?: (postId: number) => void
}

export function PostActions({ postId, onDelete }: PostActionsProps) {
  const router = useRouter()
  const api = useClientApi()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/posts/${postId}`)
      // Call the onDelete callback to update the parent state immediately
      onDelete?.(postId)
    } catch (error) {
      console.error('Error deleting post:', error)
      // TODO: Show error toast/notification to user
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href={`/admin/posts/view/${postId}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`/admin/posts/edit/${postId}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}