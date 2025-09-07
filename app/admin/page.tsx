"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClientApi } from "@/lib/client-api"
import { usePageTitle } from "@/hooks/use-page-title"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Eye, Plus, BarChart3, MessageSquare, TrendingUp, Clock, Hash, Tag, Palette } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
  totalViews: number
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

interface DailyViews {
  date: string
  views: number
}

interface DashboardData {
  stats: DashboardStats
  recentPosts: RecentPost[]
  recentComments: any[]
  popularCategories: PopularCategory[]
  popularTags: PopularTag[]
  monthlyStats: MonthlyStats[]
  dailyViews: DailyViews[]
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
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="space-y-4">
          {/* Stats Cards Skeleton */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-3" />
                </CardHeader>
                <CardContent className="pt-1">
                  <Skeleton className="h-5 w-12 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Daily Views Chart Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>

          {/* Quick Actions Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24 mb-1" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Recent Posts Skeleton */}
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-40" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div className="space-y-1 flex-1">
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
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div className="space-y-1 flex-1">
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

  const { stats, recentPosts, monthlyStats, dailyViews } = dashboardData

  // Format daily views data for the chart
  const chartData = dailyViews?.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    views: day.views
  })) || []

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-3">
        {/* Stats Cards */}
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-xs font-medium">Total Users</CardTitle>
              <Users className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0 pb-1">
              <div className="text-base font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-xs font-medium">Total Posts</CardTitle>
              <FileText className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0 pb-1">
              <div className="text-base font-bold">{stats.totalPosts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedPosts} published, {stats.draftPosts} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-xs font-medium">Total Views</CardTitle>
              <Eye className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0 pb-1">
              <div className="text-base font-bold">{stats.totalViews?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                Page views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-xs font-medium">Categories</CardTitle>
              <Hash className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0 pb-1">
              <div className="text-base font-bold">{stats.totalCategories.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Content categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-xs font-medium">Comments</CardTitle>
              <MessageSquare className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0 pb-1">
              <div className="text-base font-bold">{stats.totalComments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.approvedComments} approved, {stats.pendingComments} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-1">
            <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <Button asChild className="h-14 flex-col gap-1 bg-transparent text-xs" variant="outline">
                <Link href="/admin/posts/add">
                  <Plus className="h-3 w-3" />
                  Create Post
                </Link>
              </Button>

              <Button asChild className="h-14 flex-col gap-1 bg-transparent text-xs" variant="outline">
                <Link href="/admin/tags/add">
                  <Tag className="h-3 w-3" />
                  Add Tag
                </Link>
              </Button>

              <Button asChild className="h-14 flex-col gap-1 bg-transparent text-xs" variant="outline">
                <Link href="/admin/categories/add">
                  <Hash className="h-3 w-3" />
                  Add Category
                </Link>
              </Button>

              <Button asChild className="h-14 flex-col gap-1 bg-transparent text-xs" variant="outline">
                <Link href="/admin/themes">
                  <Palette className="h-3 w-3" />
                  Change Theme
                </Link>
              </Button>

              <Button asChild className="h-14 flex-col gap-1 bg-transparent text-xs" variant="outline">
                <Link href="/admin/forms">
                  <MessageSquare className="h-3 w-3" />
                  Create Form
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Views Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-3 w-3" />
              Daily Views
            </CardTitle>
            <CardDescription className="text-xs">Page views over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#6b7280" 
                    opacity={0.3}
                  />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      color: '#f9fafb',
                    }}
                    labelStyle={{ color: '#f9fafb' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#ffffff" 
                    strokeWidth={2}
                    dot={{ fill: '#ffffff', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 lg:grid-cols-2">
          {/* Recent Posts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent Posts</CardTitle>
              <CardDescription className="text-xs">Latest blog posts and articles</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <div className="space-y-2">
                {recentPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent posts</p>
                ) : (
                  recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium leading-tight">{post.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Monthly Activity</CardTitle>
              <CardDescription className="text-xs">Activity over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <div className="space-y-2">
                {monthlyStats.slice(-6).map((monthData) => (
                  <div key={monthData.month} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium leading-tight">{monthData.month}</p>
                      <p className="text-xs text-muted-foreground">
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
