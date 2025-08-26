"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClientApi } from "@/lib/client-api"
import { usePageTitle } from "@/hooks/use-page-title"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Eye, Plus, BarChart3, MessageSquare, TrendingUp, Clock, Hash, Tag } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

// Types for the dashboard API response
interface DashboardStats {
  totalPosts: number
  totalCategories: number
  totalTags: number
  totalComments: number
  totalUsers: number
  publishedPosts: number
  draftPosts: number
  pendingComments: number
  approvedComments: number
}

interface RecentPost {
  id: number
  title: string
  author: string
  createdAt: string
  commentCount: number
}

interface PopularCategory {
  id: number
  postCount: number
}

interface PopularTag {
  id: number
  name: string
  postCount: number
}

interface MonthlyStats {
  month: string
  posts: number
  comments: number
  users: number
}

interface DashboardData {
  stats: DashboardStats
  recentPosts: RecentPost[]
  recentComments: any[]
  popularCategories: PopularCategory[]
  popularTags: PopularTag[]
  monthlyStats: MonthlyStats[]
}

export default function AdminDashboard() {
  usePageTitle("Dashboard - BlazeBlog Admin")
  
  const router = useRouter()
  const api = useClientApi()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<DashboardData>('/home/dashboard')
      setDashboardData(response)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="space-y-6">
          {/* Stats Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Posts Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Stats Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                      <div className="text-right space-y-1">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !dashboardData) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Failed to load dashboard data'}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const { stats, recentPosts, monthlyStats } = dashboardData

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedPosts} published, {stats.draftPosts} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Content categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.approvedComments} approved, {stats.pendingComments} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <Link href="/admin/posts/add">
                  <Plus className="h-6 w-6" />
                  Create Post
                </Link>
              </Button>

              <Button asChild className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <Link href="/admin/tags/add">
                  <Tag className="h-6 w-6" />
                  Add Tag
                </Link>
              </Button>

              <Button asChild className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <Link href="/admin/categories/add">
                  <Hash className="h-6 w-6" />
                  Add Category
                </Link>
              </Button>

              <Button asChild className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <Link href="/admin/forms">
                  <MessageSquare className="h-6 w-6" />
                  Create Form
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Latest blog posts and articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent posts</p>
                ) : (
                  recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{post.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(post.createdAt).toLocaleDateString()} • {post.commentCount} comments • By {post.author}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
              <CardDescription>Activity over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyStats.slice(-6).map((monthData) => (
                  <div key={monthData.month} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{monthData.month}</p>
                      <p className="text-sm text-muted-foreground">
                        {monthData.posts} posts • {monthData.comments} comments • {monthData.users} users
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{monthData.posts + monthData.comments}</p>
                      <p className="text-xs text-muted-foreground">Total activity</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
