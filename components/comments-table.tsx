"use client"

import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CommentActions } from "@/components/comment-actions"
import { type Comment } from "@/lib/api"

interface CommentsTableProps {
  comments: Comment[]
}

export function CommentsTable({ comments }: CommentsTableProps) {
  const getStatusBadgeStyle = (isApproved: boolean) => {
    return isApproved 
      ? "bg-green-500 text-white hover:bg-green-600"
      : "bg-yellow-500 text-white hover:bg-yellow-600"
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return `${content.substring(0, maxLength)}...`
  }

  return (
    <TableBody>
      {comments.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
            No comments found
          </TableCell>
        </TableRow>
      ) : (
        comments.map((comment) => (
          <TableRow 
            key={comment.id} 
            className="hover:bg-muted/50 transition-colors"
          >
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">{comment.authorEmail}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <p className="text-sm">{truncateContent(comment.content)}</p>
              {comment.parentCommentId && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Reply
                </Badge>
              )}
            </TableCell>
            <TableCell className="max-w-xs">
              <span className="text-sm">{comment.post?.title || 'Unknown Post'}</span>
            </TableCell>
            <TableCell>
              <Badge className={getStatusBadgeStyle(comment.isApproved)}>
                {comment.isApproved ? 'Approved' : 'Pending'}
              </Badge>
            </TableCell>
            <TableCell className="text-sm">
              {new Date(comment.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <CommentActions comment={comment} />
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}