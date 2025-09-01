"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useClientApi } from "@/lib/client-api"
import { PostsTable } from "@/components/posts-table"
import { Skeleton } from "@/components/ui/skeleton"
import { ClientPagination } from "@/components/ui/client-pagination"

interface Post {
  id: number
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  category?: {
    id: number
    name: string
  }
  author?: {
    id: string
    name: string
  }
  views?: number
}

interface Category {
  id: number
  name: string
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1
  })

  const api = useClientApi()
  const searchParams = useSearchParams()

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      status: searchParams.get('status') || '',
      page: parseInt(searchParams.get('page') || '1', 10)
    }
    setFilters(urlFilters)
  }, [searchParams])

  // Fetch posts when filters change
  useEffect(() => {
    fetchPosts()
    // Update URL when filters change
    updateURL()
  }, [filters])

  const updateURL = () => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.category && filters.category !== 'all') params.set('category', filters.category)
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.page > 1) params.set('page', filters.page.toString())
    
    const newUrl = `/admin/posts${params.toString() ? '?' + params.toString() : ''}`
    window.history.replaceState({}, '', newUrl)
  }

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = {
        page: filters.page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && filters.category !== 'all' && { categoryId: parseInt(filters.category) }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status as 'draft' | 'published' | 'archived' }),
      }

      console.log('Fetching posts with params:', params) // Debug log
      const response = await api.getPaginated<Post>('/posts', params)
      setPosts(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get<PaginatedResponse<Category>>('/categories', {
        params: { limit: 100, isActive: true }
      })
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newFilters = {
      search: formData.get('search') as string || '',
      category: formData.get('category') as string || '',
      status: formData.get('status') as string || '',
      page: 1 // Reset to first page when filtering
    }
    setFilters(newFilters)
  }

  const handleDeletePost = (postId: number) => {
    // Optimistically remove the post from the UI immediately
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
    
    // Update pagination counts
    setPagination(prev => ({
      ...prev,
      total: prev.total - 1,
      // Recalculate total pages
      totalPages: Math.ceil((prev.total - 1) / prev.limit)
    }))
  }

  if (loading && posts.length === 0) {
    return (
      <AdminLayout title="Posts">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Filters Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-full md:w-[180px]" />
                <Skeleton className="h-10 w-full md:w-[180px]" />
                <Skeleton className="h-10 w-20" />
              </div>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-32" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Table Header */}
                <div className="flex space-x-4 py-2 border-b">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                
                {/* Table Rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex space-x-4 py-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Posts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Manage your blog posts and articles</p>
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
            <form onSubmit={handleFilterSubmit} className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  name="search"
                  placeholder="Search posts..." 
                  className="pl-8" 
                  defaultValue={filters.search}
                />
              </div>
              <Select name="category" defaultValue={filters.category || 'all'}>
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
              <Select name="status" defaultValue={filters.status || 'all'}>
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
            <CardTitle>All Posts ({pagination.total})</CardTitle>
            <CardDescription>A list of all your posts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex space-x-4 py-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <>
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
                  <PostsTable posts={posts} onDeletePost={handleDeletePost} />
                </Table>

                <ClientPagination
                  pagination={pagination}
                  onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                  loading={loading}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}