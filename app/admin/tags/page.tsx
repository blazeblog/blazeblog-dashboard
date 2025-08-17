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
import { Plus, Search, Hash, FolderOpen, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export default function TagsPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const api = useClientApi()
  const { toast } = useToast()
  
  const [tags, setTags] = useState<Tag[]>([])
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
  const [newTagName, setNewTagName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<{id: number, name: string} | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)


  const fetchTags = async (page = 1, search = '') => {
    try {
      setIsLoading(true)
      const tagsResponse = await api.getPaginated<Tag>('/tags', {
        page,
        limit: 12,
        search,
        sortBy: 'name',
        sortOrder: 'ASC',
      })
      
      setTags(tagsResponse.data)
      setPagination(tagsResponse.pagination)
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
    setTagToDelete({id: tagId, name: tagName})
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!tagToDelete) return
    
    setIsDeleting(true)
    try {
      await api.delete(`/tags/${tagToDelete.id}`)
      
      toast({
        title: "Success!",
        description: `Tag "${tagToDelete.name}" deleted successfully.`,
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
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setTagToDelete(null)
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

        <div className="flex items-center justify-between">
          <div></div>
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

        <div className="space-y-6">
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
                  {tags.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No tags found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tags.map((tag) => {
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
                          <Badge variant="outline">{tag.posts?.length || 0}</Badge>
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
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the tag "{tagToDelete?.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete Tag'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}