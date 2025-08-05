import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Eye, Plus, BarChart3, MessageSquare, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

// Mock data - replace with real data from your API
const mockStats = {
  totalUsers: 1234,
  totalPosts: 89,
  totalViews: 45678,
  totalForms: 12,
}

const mockRecentPosts = [
  {
    id: 1,
    title: "Getting Started with Next.js 15",
    status: "published",
    createdAt: "2024-01-15T10:00:00Z",
    views: 1250,
  },
  {
    id: 2,
    title: "Building Modern Admin Dashboards",
    status: "draft",
    createdAt: "2024-01-14T15:30:00Z",
    views: 890,
  },
  {
    id: 3,
    title: "Authentication with Clerk",
    status: "published",
    createdAt: "2024-01-13T09:15:00Z",
    views: 2100,
  },
]

const mockRecentUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    createdAt: "2024-01-15T08:00:00Z",
    status: "active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    createdAt: "2024-01-14T16:45:00Z",
    status: "active",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    createdAt: "2024-01-13T11:20:00Z",
    status: "pending",
  },
]

export default function AdminDashboard() {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

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
              <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalPosts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +23%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lead Forms</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalForms.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +15%
                </span>
                from last month
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
                <Link href="/admin/users">
                  <Users className="h-6 w-6" />
                  Manage Users
                </Link>
              </Button>

              <Button asChild className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <Link href="/admin/analytics">
                  <BarChart3 className="h-6 w-6" />
                  View Analytics
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
                {mockRecentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{post.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(post.createdAt).toLocaleDateString()} • {post.views} views
                      </p>
                    </div>
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Newly registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {user.email} • {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
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
