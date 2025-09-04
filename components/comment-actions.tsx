"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { CheckCircle, XCircle, Trash2, MoreHorizontal, Reply } from "lucide-react"
import { useRouter } from "next/navigation"
import { useClientApi, type Comment } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"

interface CommentActionsProps {
  comment: Comment
}

export function CommentActions({ comment }: CommentActionsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()
  const api = useClientApi()

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await api.put(`/comments/${comment.id}/approve`, { 
          isApproved: true 
        })
        toast({
          title: "Success",
          description: "Comment approved successfully",
          duration: 3000
        })
        router.refresh()
      } catch (error) {
        console.error("Error approving comment:", error)
        toast({
          title: "Error",
          description: "Failed to approve comment",
          variant: "destructive",
        })
      }
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      try {
        await api.put(`/comments/${comment.id}/approve`, { 
          isApproved: false 
        })
        toast({
          title: "Success",
          description: "Comment rejected successfully",
          duration: 3000
        })
        router.refresh()
      } catch (error) {
        console.error("Error rejecting comment:", error)
        toast({
          title: "Error",
          description: "Failed to reject comment",
          variant: "destructive",
        })
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await api.delete(`/comments/${comment.id}`)
        toast({
          title: "Success",
          description: "Comment deleted successfully",
          duration: 3000
        })
        setIsDeleteOpen(false)
        router.refresh()
      } catch (error) {
        console.error("Error deleting comment:", error)
        toast({
          title: "Error",
          description: "Failed to delete comment",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0"
            disabled={isPending}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!comment.isApproved && (
            <DropdownMenuItem onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Approve
            </DropdownMenuItem>
          )}
          {comment.isApproved && (
            <DropdownMenuItem onClick={handleReject}>
              <XCircle className="mr-2 h-4 w-4 text-yellow-600" />
              Reject
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
              {comment.replyCount && comment.replyCount > 0 && (
                <span className="block mt-2 text-amber-600">
                  This will also delete {comment.replyCount} replies to this comment.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}