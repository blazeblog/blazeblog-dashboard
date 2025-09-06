"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useClientApi } from "@/lib/client-api"
import { PagesTable } from "@/components/pages-table"
import { Skeleton } from "@/components/ui/skeleton"

interface Post {
  id: number
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  user: { id: number; username: string }
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

export default function PagesPage() {
  const [pages, setPages] = useState<Post[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 })
  const api = useClientApi()

  useEffect(() => { fetchPages(); updateURL() }, [filters])

  const updateURL = () => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.page > 1) params.set('page', filters.page.toString())
    const newUrl = `/admin/pages${params.toString() ? '?' + params.toString() : ''}`
    window.history.replaceState({}, '', newUrl)
  }

  const fetchPages = async () => {
    try {
      setLoading(true)
      const qs = new URLSearchParams()
      qs.set('isPage', 'true')
      qs.set('page', String(filters.page))
      qs.set('limit', '10')
      qs.set('sortBy', 'createdAt')
      qs.set('sortOrder', 'DESC')
      if (filters.search) qs.set('search', filters.search)
      if (filters.status && filters.status !== 'all') qs.set('status', filters.status)
      const response = await api.get<PaginatedResponse<Post>>(`/posts?${qs.toString()}`)
      let safePages: Post[] = []
      // Handle possible shapes: { data: [...], pagination: {...} } or just [...]
      if (Array.isArray((response as any))) {
        safePages = response as any
      } else if (Array.isArray((response as any)?.data)) {
        safePages = (response as any).data
      }
      const safePagination = (response as any)?.pagination && typeof (response as any).pagination === 'object'
        ? (response as any).pagination
        : { page: filters.page, limit: 10, total: safePages.length, totalPages: 1, hasNextPage: false, hasPreviousPage: filters.page > 1 }
      setPages(safePages)
      setPagination(safePagination)
    } catch (error) {
      console.error('Error fetching pages:', error)
      setPages([])
      setPagination({ page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false })
    } finally { setLoading(false) }
  }

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newFilters = {
      search: (formData.get('search') as string) || '',
      status: (formData.get('status') as string) || '',
      page: 1
    }
    setFilters(newFilters)
  }

  const handleDeletePage = (pageId: number) => {
    setPages(prev => prev.filter(p => p.id !== pageId))
    setPagination(prev => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
      totalPages: Math.max(1, Math.ceil(Math.max(0, prev.total - 1) / prev.limit)),
      hasNextPage: false,
      hasPreviousPage: prev.page > 1
    }))
  }

  if (loading && pages.length === 0) {
    return (
      <AdminLayout title="Pages">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <Card>
            <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-full md:w-[180px]" />
                <Skeleton className="h-10 w-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Pages">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Manage your pages</p>
          <Button asChild>
            <Link href="/admin/pages/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Page
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Pages ({pagination?.total ?? pages.length ?? 0})</CardTitle>
            <CardDescription>A list of all your pages</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <PagesTable pages={pages} onDeletePage={handleDeletePage} />
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
