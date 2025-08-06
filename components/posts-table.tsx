"use client"

import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PostActions } from "@/components/post-actions"
import { useRouter } from "next/navigation"
import { type Post } from "@/lib/api"

interface PostsTableProps {
  posts: Post[]
}

export function PostsTable({ posts }: PostsTableProps) {
  const router = useRouter()

  const handleRowClick = (postId: number) => {
    router.push(`/admin/posts/edit/${postId}`)
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
              <Badge
                variant={
                  post.status === "published" ? "default" : post.status === "draft" ? "secondary" : "outline"
                }
              >
                {post.status}
              </Badge>
            </TableCell>
            <TableCell>{post.user.username}</TableCell>
            <TableCell>-</TableCell>
            <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <PostActions postId={post.id} />
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}
