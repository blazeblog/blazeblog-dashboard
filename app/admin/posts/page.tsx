"use client"

import { useState } from "react"
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"

// Mock data
const posts = [
  {
    id: 1,
    title: "Getting Started with NestJS",
    content: "<p>This is a comprehensive guide to <strong>NestJS</strong> framework...</p>",
    category: "Tutorial",
    author: "John Doe",
    status: "published",
    createdAt: "2024-01-15",
    views: 1234,
    excerpt: "Learn the fundamentals of NestJS framework",
  },
  {
    id: 2,
    title: "Advanced React Patterns",
    content: "<p>Explore advanced <em>React patterns</em> and best practices...</p>",
    category: "Development",
    author: "Jane Smith",
    status: "draft",
    createdAt: "2024-01-14",
    views: 856,
    excerpt: "Master advanced React development techniques",
  },
  {
    id: 3,
    title: "Database Design Best Practices",
    content: "<p>Learn how to design <strong>scalable databases</strong>...</p>",
    category: "Database",
    author: "Mike Johnson",
    status: "published",
    createdAt: "2024-01-13",
    views: 2341,
    excerpt: "Essential database design principles",
  },
]

export default function PostsPage() {
  const [selectedPosts, setSelectedPosts] = useState<number[]>([])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Published</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <AdminLayout title="Posts">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Posts</h2>
          <p className="text-muted-foreground">Manage your blog posts and articles</p>
        </div>
        <Button asChild>
          <a href="/admin/posts/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Post
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts ({posts.length})</CardTitle>
          <CardDescription>A list of all your blog posts with rich content</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-muted-foreground">{post.excerpt}</div>
                    </div>
                  </TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>{post.views.toLocaleString()}</TableCell>
                  <TableCell>{post.createdAt}</TableCell>
                  <TableCell>
                    <div
                      className="prose prose-xs max-w-none line-clamp-2 text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: post.content.substring(0, 100) + "...",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/admin/posts/edit/${post.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
