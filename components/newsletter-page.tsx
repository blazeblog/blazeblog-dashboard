"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Plus, Download, Trash2, Search, Filter, Users, TrendingUp, Calendar, CheckCircle, XCircle, Loader2, Eye, MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useClientApi, type Newsletter, type NewsletterStats, type CreateNewsletterRequest, type PaginatedResponse } from "@/lib/client-api"
import { Pagination } from "@/components/ui/pagination"


export function NewsletterPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [stats, setStats] = useState<NewsletterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [pagination, setPagination] = useState<any>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newSubscriber, setNewSubscriber] = useState({ email: "", name: "", company: "" })
  const [addingSubscriber, setAddingSubscriber] = useState(false)
  const [deleteSubscriber, setDeleteSubscriber] = useState<Newsletter | null>(null)
  const [deletingSubscriber, setDeletingSubscriber] = useState(false)
  
  const api = useClientApi()
  const { toast } = useToast()

  useEffect(() => {
    fetchNewsletters()
    fetchStats()
  }, [page, limit, search, isActiveFilter, sortBy, sortOrder])

  const fetchNewsletters = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(isActiveFilter !== "all" && { isActive: isActiveFilter === 'true' }),
        sortBy,
        sortOrder
      }
      
      const response = await api.newsletter.getAll(params)
      setNewsletters(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error fetching newsletters:', error)
      toast({
        title: "Error",
        description: "Failed to load newsletters. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.newsletter.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const addSubscriber = async () => {
    if (!newSubscriber.email) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive"
      })
      return
    }

    setAddingSubscriber(true)
    try {
      await api.newsletter.create(newSubscriber)
      setNewSubscriber({ email: "", name: "", company: "" })
      setShowAddDialog(false)
      fetchNewsletters()
      fetchStats()
      toast({
        title: "Success",
        description: "Subscriber added successfully",
        duration: 3000
      })
    } catch (error: any) {
      console.error('Error adding subscriber:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add subscriber. Please try again.",
        variant: "destructive"
      })
    } finally {
      setAddingSubscriber(false)
    }
  }

  const handleDeleteSubscriber = async () => {
    if (!deleteSubscriber) return

    setDeletingSubscriber(true)
    try {
      await api.newsletter.delete(deleteSubscriber.id)
      setDeleteSubscriber(null)
      fetchNewsletters()
      fetchStats()
      toast({
        title: "Success",
        description: "Subscriber deleted successfully",
        duration: 3000
      })
    } catch (error: any) {
      console.error('Error deleting subscriber:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscriber. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingSubscriber(false)
    }
  }

  const toggleSubscriberStatus = async (newsletter: Newsletter) => {
    try {
      await api.newsletter.update(newsletter.id, { isActive: !newsletter.isActive })
      fetchNewsletters()
      fetchStats()
      toast({
        title: "Success",
        description: `Subscriber ${!newsletter.isActive ? 'activated' : 'deactivated'} successfully`,
        duration: 3000
      })
    } catch (error: any) {
      console.error('Error updating subscriber:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update subscriber. Please try again.",
        variant: "destructive"
      })
    }
  }

  const exportSubscribers = async () => {
    try {
      // This would need to be implemented on the backend
      toast({
        title: "Export",
        description: "Export functionality will be implemented soon",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export subscribers",
        variant: "destructive"
      })
    }
  }

  const clearFilters = () => {
    setSearch("")
    setIsActiveFilter("all")
    setSortBy("createdAt")
    setSortOrder("DESC")
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSubscribers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Subscriber
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subscriber</DialogTitle>
                <DialogDescription>
                  Add a new subscriber to your newsletter list.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="subscriber@example.com"
                    value={newSubscriber.email}
                    onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input
                    id="name"
                    placeholder="Full Name"
                    value={newSubscriber.name}
                    onChange={(e) => setNewSubscriber({ ...newSubscriber, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    placeholder="Company Name"
                    value={newSubscriber.company}
                    onChange={(e) => setNewSubscriber({ ...newSubscriber, company: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addSubscriber} disabled={addingSubscriber}>
                    {addingSubscriber ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Subscriber"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Subscribers</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactiveSubscriptions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Subscriptions</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="subscribers" className="w-full">
        <TabsList>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
              <CardDescription>
                Search and filter your newsletter subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by email, name, or company..."
                      className="pl-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="min-w-[140px]">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[160px]">
                  <Label htmlFor="sort">Sort by</Label>
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-')
                    setSortBy(field)
                    setSortOrder(order as 'ASC' | 'DESC')
                  }}>
                    <SelectTrigger id="sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-DESC">Newest First</SelectItem>
                      <SelectItem value="createdAt-ASC">Oldest First</SelectItem>
                      <SelectItem value="email-ASC">Email A-Z</SelectItem>
                      <SelectItem value="email-DESC">Email Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={clearFilters} className="shrink-0">
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Subscribers</CardTitle>
                  <CardDescription>
                    {pagination && `Showing ${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} subscribers`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Label htmlFor="per-page">Per page:</Label>
                  <Select value={limit.toString()} onValueChange={(value) => {
                    setLimit(parseInt(value))
                    setPage(1)
                  }}>
                    <SelectTrigger id="per-page" className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Subscribed</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newsletters.map((newsletter) => (
                        <TableRow key={newsletter.id}>
                          <TableCell className="font-medium">{newsletter.email}</TableCell>
                          <TableCell>{newsletter.name || '-'}</TableCell>
                          <TableCell>{newsletter.company || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={newsletter.isActive ? "default" : "secondary"}>
                              {newsletter.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(newsletter.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleSubscriberStatus(newsletter)}
                              >
                                {newsletter.isActive ? "Deactivate" : "Activate"}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {newsletter.email} from your newsletter list? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        setDeleteSubscriber(newsletter)
                                        handleDeleteSubscriber()
                                      }}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {newsletters.length === 0 && !loading && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No subscribers found. Add your first subscriber to get started!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                      <Pagination
                        currentPage={page}
                        totalPages={pagination.totalPages}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}