"use client"

import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PostActions } from "@/components/post-actions"
import { useRouter } from "next/navigation"
import { type Post } from "@/lib/api"

interface PostsTableProps {
  posts: Post[]
  onDeletePost?: (postId: number) => void
}

export function PostsTable({ posts, onDeletePost }: PostsTableProps) {
  const router = useRouter()

  const handleRowClick = (postId: number) => {
    router.push(`/admin/posts/edit/${postId}`)
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500 text-white hover:bg-green-600"
      case "draft":
        return "bg-yellow-500 text-white hover:bg-yellow-600"
      case "archived":
        return "bg-gray-500 text-white hover:bg-gray-600"
      default:
        return "bg-blue-500 text-white hover:bg-blue-600"
    }
  }

  return (
    <TableBody>
      {posts.length === 0 ? (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
            No posts found
          </TableCell>
        </TableRow>
      ) : (
        posts.map((post) => (
          <TableRow 
            key={post.id} 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleRowClick(post.id)}
          >
            <TableCell className="font-medium">{post.title}</TableCell>
            <TableCell>{post.category?.name || 'Uncategorized'}</TableCell>
            <TableCell>
              <Badge className={getStatusBadgeStyle(post.status)}>
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>{post.user.username}</TableCell>
            <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <PostActions postId={post.id} onDelete={onDeletePost} />
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}
