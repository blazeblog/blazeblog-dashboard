"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useClientApi, type PaginationParams, type PaginatedResponse, type Category } from "@/lib/client-api"
import { usePageTitle } from "@/hooks/use-page-title"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, FolderOpen } from "lucide-react"
import { CategoryActions } from "@/components/category-actions"
import { LoadingState } from "@/components/loading-state"


const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#6366F1", "#14B8A6"]

export default function CategoriesPage() {
  usePageTitle("Categories - BlazeBlog Admin")
  
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const api = useClientApi()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [currentView, setCurrentView] = useState<'table'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')


  const fetchCategories = async (page = 1, search = '') => {
    try {
      setIsLoading(true)
      const [categoriesResponse] = await Promise.all([
        api.getPaginated<Category>('/categories', {
          page,
          limit: 12,
          search,
          sortBy: 'name',
          sortOrder: 'ASC',
        }),
      ])
      
      setCategories(categoriesResponse.data)
      setPagination(categoriesResponse.pagination)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    fetchCategories(1, searchQuery)
  }

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
      return
    }
    
    if (isSignedIn) {
      fetchCategories()
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || isLoading) {
    return (
      <AdminLayout title="Categories">
        <LoadingState message="Loading Categories" />
      </AdminLayout>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Organize your content with categories</p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-4">
            <form className="flex items-center gap-4" onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

        <div className="space-y-6">
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
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => {
                      return (
                      <TableRow 
                        key={category.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push(`/admin/categories/edit/${category.id}`)}
                        title="Click to edit category"
                      >
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
                          <Badge variant="outline">{category.posts?.length || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <CategoryActions categoryId={category.id} />
                        </TableCell>
                      </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => fetchCategories(pagination.page - 1, searchQuery)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => fetchCategories(pagination.page + 1, searchQuery)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </AdminLayout>
  )
}
