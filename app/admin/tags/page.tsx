"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useClientApi, type PaginationParams, type PaginatedResponse, type Tag } from "@/lib/client-api"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Hash, Grid3X3, FolderOpen, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

export default function TagsPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const api = useClientApi()
  const { toast } = useToast()
  
  const [tags, setTags] = useState<Tag[]>([])
  const [tagsWithCounts, setTagsWithCounts] = useState<Tag[]>([])
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
  const [newTagName, setNewTagName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Load view preference from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('tags-view') as 'grid' | 'table' | null
      if (savedView) {
        setCurrentView(savedView)
      }
    }
  }, [])

  // Save view preference to localStorage when it changes
  const handleViewChange = (view: 'grid' | 'table') => {
    setCurrentView(view)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tags-view', view)
    }
  }

  const fetchTags = async (page = 1, search = '') => {
    try {
      setIsLoading(true)
      const [tagsResponse, countsResponse] = await Promise.all([
        api.getPaginated<Tag>('/tags', {
          page,
          limit: 12,
          search,
          sortBy: 'name',
          sortOrder: 'ASC',
        }),
        api.get<Tag[]>('/tags/with-counts')
      ])
      
      setTags(tagsResponse.data)
      setPagination(tagsResponse.pagination)
      setTagsWithCounts(countsResponse)
    } catch (error) {
      console.error('Error fetching tags:', error)
      setError('Failed to load tags')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    fetchTags(1, searchQuery)
  }

  const handleCreateTag = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    try {
      setIsCreating(true)
      const slug = newTagName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      
      await api.post('/tags', {
        name: newTagName.trim(),
        slug: slug
      })

      toast({
        title: "Success!",
        description: `Tag "${newTagName}" created successfully.`,
        variant: "default"
      })

      setNewTagName('')
      fetchTags(pagination.page, searchQuery) // Refresh current page
    } catch (error) {
      console.error('Error creating tag:', error)
      toast({
        title: "Error",
        description: "Failed to create tag. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteTag = async (tagId: number, tagName: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${tagName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.delete(`/tags/${tagId}`)
      
      toast({
        title: "Success!",
        description: `Tag "${tagName}" deleted successfully.`,
        variant: "default"
      })

      fetchTags(pagination.page, searchQuery) // Refresh current page
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast({
        title: "Error",
        description: "Failed to delete tag. Please try again.",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
      return
    }
    
    if (isSignedIn) {
      fetchTags()
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || isLoading) {
    return (
      <AdminLayout title="Tags">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading tags...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
            <p className="text-muted-foreground">Organize your content with tags</p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Quick Create Tag */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Quick Create Tag
            </CardTitle>
            <CardDescription>Create a new tag quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTag} className="flex gap-2">
              <Input
                placeholder="Enter tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1"
                maxLength={50}
              />
              <Button type="submit" disabled={isCreating || !newTagName.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </form>
          </CardContent>
        </Card>

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
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button type="submit" variant="outline">
                  Search
                </Button>
              </form>
            </div>
          </div>

          <TabsContent value="grid" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tags.map((tag) => {
                const tagWithCount = tagsWithCounts.find(t => t.id === tag.id)
                const postCount = tagWithCount?.postCount || 0
                return (
                <Card key={tag.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-lg">{tag.name}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <span className="sr-only">Actions</span>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTag(tag.id, tag.name)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{tag.slug}</code>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">{postCount} posts</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(tag.createdAt).toLocaleDateString()}
                        </div>
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
                    <TableHead>Tag</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag) => {
                    const tagWithCount = tagsWithCounts.find(t => t.id === tag.id)
                    const postCount = tagWithCount?.postCount || 0
                    return (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <div className="font-medium">{tag.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{tag.slug}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{postCount}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(tag.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Actions</span>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTag(tag.id, tag.name)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                    onClick={() => fetchTags(pagination.page - 1, searchQuery)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => fetchTags(pagination.page + 1, searchQuery)}
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