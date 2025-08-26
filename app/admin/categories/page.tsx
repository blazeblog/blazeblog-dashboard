"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClientApi, type PaginationParams, type PaginatedResponse, type Category } from "@/lib/client-api"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ClientPagination } from "@/components/ui/client-pagination"


const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#6366F1", "#14B8A6"]

export default function CategoriesPage() {
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
  const [filters, setFilters] = useState({
    search: '',
    page: 1
  })
  const [currentView, setCurrentView] = useState<'table'>('table')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')


  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await api.getPaginated<Category>('/categories', {
        page: filters.page,
        limit: 12,
        search: filters.search,
        sortBy: 'name',
        sortOrder: 'ASC',
      })
      
      setCategories(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setFilters(prev => ({
      ...prev,
      search: formData.get('search') as string || '',
      page: 1
    }))
  }

  useEffect(() => {
    fetchCategories()
  }, [filters])

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
                  name="search"
                  placeholder="Search categories..."
                  defaultValue={filters.search}
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

        <Card>
          <CardContent>
            {isLoading && categories.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            ) : (
              <>
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

                {pagination.totalPages > 1 && (
                  <ClientPagination
                    pagination={pagination}
                    onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                    loading={isLoading}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
