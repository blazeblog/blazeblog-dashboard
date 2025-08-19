import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import { api, type PaginationParams, type PaginatedResponse, type Post, type Category } from "@/lib/api"
import { Pagination } from "@/components/ui/pagination"
import { PostsTable } from "@/components/posts-table"


// Function to fetch posts from API with pagination
async function getPosts(params: PaginationParams = {}): Promise<PaginatedResponse<Post>> {
  try {
    const response = await api.getPaginated<Post>('/posts', {
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      ...params
    })
    return response
  } catch (error) {
    console.error('Error fetching posts:', error)
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

async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.getPaginated<Category>('/categories', {
      limit: 100,
      isActive: true
    })
    return response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; category?: string; status?: string }>
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)
  const searchQuery = params.search || ''
  const categoryFilter = params.category || ''
  const statusFilter = params.status || ''

  const [postsResponse, categories] = await Promise.all([
    getPosts({
      page: currentPage,
      limit: 10,
      search: searchQuery,
      ...(categoryFilter && categoryFilter !== 'all' ? { categoryId: parseInt(categoryFilter) } : {}),
      ...(statusFilter && statusFilter !== 'all' ? { status: statusFilter as 'draft' | 'published' | 'archived' } : {}),
    }),
    getCategories()
  ])
  const posts = postsResponse.data

  return (
    <AdminLayout title="Posts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Posts</h2>
            <p className="text-muted-foreground">Manage your blog posts and articles</p>
          </div>
          <Button asChild>
            <Link href="/admin/posts/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Post
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter and search your posts</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4 md:flex-row md:items-center" method="GET">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  name="search"
                  placeholder="Search posts..." 
                  className="pl-8" 
                  defaultValue={searchQuery}
                />
              </div>
              <Select name="category" defaultValue={categoryFilter || 'all'}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
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
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Posts ({postsResponse.pagination.total})</CardTitle>
            <CardDescription>A list of all your posts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <PostsTable posts={posts} />
            </Table>

            <Pagination
              pagination={postsResponse.pagination}
              baseUrl="/admin/posts"
              searchParams={{ 
                search: searchQuery,
                ...(categoryFilter && { category: categoryFilter }),
                ...(statusFilter && { status: statusFilter })
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
