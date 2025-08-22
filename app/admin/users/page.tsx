"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useClientApi } from "@/lib/client-api"
import { usePageTitle } from "@/hooks/use-page-title"
import type { User, PaginatedResponse, PaginationParams } from "@/lib/client-api"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MoreHorizontal, Trash2, Shield, Mail, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LoadingState } from "@/components/loading-state"
import { ErrorState } from "@/components/error-state"

export default function UsersPage() {
  usePageTitle("Users - BlazeBlog Admin")
  
  const router = useRouter()
  const api = useClientApi()
  const [users, setUsers] = useState<PaginatedResponse<User> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getPaginated<User>('/users', filters)
      setUsers(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }))
  }

  const handleFilterChange = (key: keyof PaginationParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.firstName) return user.firstName
    if (user.lastName) return user.lastName
    return user.username
  }

  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`
    }
    if (user.firstName) return user.firstName[0].toUpperCase()
    if (user.lastName) return user.lastName[0].toUpperCase()
    return user.username[0]?.toUpperCase() || 'U'
  }

  const handleEditUser = (user: User) => {
    router.push(`/admin/users/${user.id}`)
  }

  const handleDeleteUser = async (user: User) => {
    // TODO: Implement user deletion with confirmation
    console.log('Delete user:', user)
  }

  const handleSendEmail = (user: User) => {
    // TODO: Implement email functionality
    window.open(`mailto:${user.email}`, '_blank')
  }

  if (loading && !users) return <LoadingState message="Loading Users" />
  if (error && !users) return <ErrorState message={error} onRetry={fetchUsers} />

  return (
    <AdminLayout title="Users">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.pagination.total || 0}</div>
            </CardContent>
          </Card>
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users This Page</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.data.length || 0}</div>
            </CardContent>
          </Card> */}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter and search users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-8" 
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Select
                value={filters.sortBy || 'createdAt'}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="updatedAt">Updated Date</SelectItem>
                  <SelectItem value="username">Username</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="firstName">First Name</SelectItem>
                  <SelectItem value="lastName">Last Name</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder || 'DESC'}
                onValueChange={(value) => handleFilterChange('sortOrder', value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DESC">Newest First</SelectItem>
                  <SelectItem value="ASC">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({users?.pagination.total || 0})</CardTitle>
            <CardDescription>A list of all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading && <div className="flex justify-center p-8"><LoadingState /></div>}
              
              {!loading && users && (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="w-[70px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.data.map((user) => (
                        <TableRow 
                          key={user.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleEditUser(user)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {getUserInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{getUserDisplayName(user)}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">@{user.username}</Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(user.updatedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSendEmail(user)
                                  }}
                                >
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteUser(user)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {(users.pagination.page - 1) * users.pagination.limit + 1} to{' '}
                      {Math.min(users.pagination.page * users.pagination.limit, users.pagination.total)} of{' '}
                      {users.pagination.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!users.pagination.hasPreviousPage}
                        onClick={() => handlePageChange(users.pagination.page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="text-sm font-medium">
                        Page {users.pagination.page} of {users.pagination.totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!users.pagination.hasNextPage}
                        onClick={() => handlePageChange(users.pagination.page + 1)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {!loading && users?.data.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  No users found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  )
}
