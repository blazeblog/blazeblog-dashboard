import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { api, type PaginationParams, type PaginatedResponse, type Category } from "@/lib/api"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, FolderOpen, Grid3X3 } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { CategoryActions } from "@/components/category-actions"

async function getCategories(params: PaginationParams = {}): Promise<PaginatedResponse<Category>> {
  try {
    const response = await api.getPaginated<Category>('/categories', {
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'ASC',
      ...params
    })
    return response
  } catch (error) {
    console.error('Error fetching categories:', error)
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

async function getCategoriesWithCounts(): Promise<Category[]> {
  try {
    const response = await api.get<Category[]>('/categories/with-counts')
    return response
  } catch (error) {
    console.error('Error fetching categories with counts:', error)
    return []
  }
}

const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#6366F1", "#14B8A6"]

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)
  const searchQuery = params.search || ''
  const statusFilter = params.status || 'all'

  const [categoriesResponse, categoriesWithCounts] = await Promise.all([
    getCategories({
      page: currentPage,
      limit: 12,
      search: searchQuery,
      ...(statusFilter !== 'all' ? { isActive: statusFilter === 'active' } : {}),
    }),
    getCategoriesWithCounts()
  ])
  
  const categories = categoriesResponse.data

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Organize your content with categories</p>
          </div>
        </div>

        <Tabs defaultValue="grid" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="grid" className="gap-2">
                <Grid3X3 className="h-4 w-4" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                Table View
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-4">
              <form className="flex items-center gap-4" method="GET">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="search"
                    placeholder="Search categories..."
                    defaultValue={searchQuery}
                    className="pl-10 w-80"
                  />
                </div>
                <Button type="submit" variant="outline">
                  Search
                </Button>
              </form>
              <Button className="gap-2" asChild>
                <a href="/admin/categories/add">
                  <Plus className="h-4 w-4" />
                  Add Category
                </a>
              </Button>
            </div>
          </div>

          <TabsContent value="grid" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category) => {
                const categoryWithCount = categoriesWithCounts.find(c => c.id === category.id)
                const postCount = categoryWithCount?.posts?.length || 0
                return (
                <Card key={category.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-blue-500" />
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                      <CategoryActions categoryId={category.id} />
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">{postCount} posts</div>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const categoryWithCount = categoriesWithCounts.find(c => c.id === category.id)
                    const postCount = categoryWithCount?.posts?.length || 0
                    return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-4 rounded-full bg-blue-500" />
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-muted-foreground">{category.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{category.slug}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{postCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <CategoryActions categoryId={category.id} />
                      </TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
            <Pagination
              pagination={categoriesResponse.pagination}
              baseUrl="/admin/categories"
              searchParams={{
                search: searchQuery,
                ...(statusFilter !== 'all' && { status: statusFilter })
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
