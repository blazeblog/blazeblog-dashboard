import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, CheckCircle, XCircle, Trash2, Reply } from "lucide-react"
import { api, type PaginationParams, type PaginatedResponse, type Comment, type Post } from "@/lib/api"
import { Pagination } from "@/components/ui/pagination"
import { CommentsTable } from "@/components/comments-table"

// Function to fetch comments from API with pagination
async function getComments(params: PaginationParams = {}): Promise<PaginatedResponse<Comment>> {
  try {
    const response = await api.getPaginated<Comment>('/comments', {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      ...params
    })
    return response
  } catch (error) {
    console.error('Error fetching comments:', error)
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  }
}

async function getPosts(): Promise<Post[]> {
  try {
    const response = await api.getPaginated<Post>('/posts', {
      limit: 100,
      status: 'published'
    })
    return response.data
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string
    search?: string
    post?: string
    status?: string
  }>
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)
  const searchQuery = params.search || ''
  const postFilter = params.post || ''
  const statusFilter = params.status || ''

  const [commentsResponse, posts] = await Promise.all([
    getComments({
      page: currentPage,
      limit: 10,
      search: searchQuery,
      ...(postFilter && postFilter !== 'all' ? { postId: parseInt(postFilter) } : {}),
      ...(statusFilter === 'pending' ? { isApproved: false } : {}),
      ...(statusFilter === 'approved' ? { isApproved: true } : {}),
    }),
    getPosts()
  ])
  const comments = commentsResponse.data

  return (
    <AdminLayout title="Comments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Comments</h2>
            <p className="text-muted-foreground">Manage and moderate blog comments</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter and search your comments</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4 md:flex-row md:items-center" method="GET">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  name="search"
                  placeholder="Search comments..." 
                  className="pl-8" 
                  defaultValue={searchQuery}
                />
              </div>
              <Select name="post" defaultValue={postFilter || 'all'}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Post" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  {posts.map((post) => (
                    <SelectItem key={post.id} value={post.id.toString()}>
                      {post.title.length > 30 ? `${post.title.substring(0, 30)}...` : post.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select name="status" defaultValue={statusFilter || 'all'}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Comments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Comments ({commentsResponse.pagination.total})</CardTitle>
            <CardDescription>A list of all comments on your blog</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <CommentsTable comments={comments} />
            </Table>

            <Pagination
              pagination={commentsResponse.pagination}
              baseUrl="/admin/comments"
              searchParams={{ 
                search: searchQuery,
                ...(postFilter && { post: postFilter }),
                ...(statusFilter && { status: statusFilter })
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}