import { BarChart3, FileText, FolderOpen, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin-layout"

const stats = [
  {
    title: "Total Posts",
    value: "245",
    description: "+12% from last month",
    icon: FileText,
  },
  {
    title: "Categories",
    value: "12",
    description: "+2 new this month",
    icon: FolderOpen,
  },
  {
    title: "Users",
    value: "1,234",
    description: "+18% from last month",
    icon: Users,
  },
  {
    title: "Page Views",
    value: "45,231",
    description: "+7% from last month",
    icon: BarChart3,
  },
]

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest posts and user activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">New post published</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">User registered</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Category updated</p>
                  <p className="text-xs text-muted-foreground">10 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/posts/add"
              className="block w-full rounded-lg border border-dashed border-border p-4 text-left hover:bg-accent"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Create New Post</p>
                  <p className="text-sm text-muted-foreground">Write and publish content</p>
                </div>
              </div>
            </a>
            <a
              href="/admin/users"
              className="block w-full rounded-lg border border-dashed border-border p-4 text-left hover:bg-accent"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Manage Users</p>
                  <p className="text-sm text-muted-foreground">Add or edit user accounts</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
