"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
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
import { Plus, Search, FolderOpen, Grid3X3 } from "lucide-react"
import { CategoryActions } from "@/components/category-actions"


const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#6366F1", "#14B8A6"]

export default function CategoriesPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const api = useClientApi()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<Category[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [currentView, setCurrentView] = useState<'grid' | 'table'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Load view preference from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('categories-view') as 'grid' | 'table' | null
      if (savedView) {
        setCurrentView(savedView)
      }
    }
  }, [])

  // Save view preference to localStorage when it changes
  const handleViewChange = (view: 'grid' | 'table') => {
    setCurrentView(view)
    if (typeof window !== 'undefined') {
      localStorage.setItem('categories-view', view)
    }
  }

  const fetchCategories = async (page = 1, search = '') => {
    try {
      setIsLoading(true)
      const [categoriesResponse, countsResponse] = await Promise.all([
        api.getPaginated<Category>('/categories', {
          page,
          limit: 12,
          search,
          sortBy: 'name',
          sortOrder: 'ASC',
        }),
        api.get<Category[]>('/categories/with-counts')
      ])
      
      setCategories(categoriesResponse.data)
      setPagination(categoriesResponse.pagination)
      setCategoriesWithCounts(countsResponse)
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading categories...</p>
          </div>
        </div>
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

        <Tabs value={currentView} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger 
                value="grid" 
                className="gap-2"
                onClick={() => handleViewChange('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
                Grid View
              </TabsTrigger>
              <TabsTrigger 
                value="table" 
                className="gap-2"
                onClick={() => handleViewChange('table')}
              >
                <FolderOpen className="h-4 w-4" />
                Table View
              </TabsTrigger>
            </TabsList>
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
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
