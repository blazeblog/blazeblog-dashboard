"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { Eye, Users, Clock, MousePointer, Globe, Download, ArrowUp, ArrowDown, Activity } from "lucide-react"

// Mock data for analytics
const overviewStats = [
  {
    title: "Total Views",
    value: "45,231",
    change: "+12.5%",
    trend: "up",
    icon: Eye,
  },
  {
    title: "Unique Visitors",
    value: "12,543",
    change: "+8.2%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Avg. Session Duration",
    value: "3m 24s",
    change: "-2.1%",
    trend: "down",
    icon: Clock,
  },
  {
    title: "Bounce Rate",
    value: "34.2%",
    change: "-5.3%",
    trend: "up",
    icon: MousePointer,
  },
]

const pageViewsData = [
  { name: "Jan", views: 4000, visitors: 2400 },
  { name: "Feb", views: 3000, visitors: 1398 },
  { name: "Mar", views: 2000, visitors: 9800 },
  { name: "Apr", views: 2780, visitors: 3908 },
  { name: "May", views: 1890, visitors: 4800 },
  { name: "Jun", views: 2390, visitors: 3800 },
  { name: "Jul", views: 3490, visitors: 4300 },
]

const scrollDepthData = [
  { depth: "0-25%", percentage: 100, users: 12543 },
  { depth: "25-50%", percentage: 78, users: 9784 },
  { depth: "50-75%", percentage: 52, users: 6522 },
  { depth: "75-100%", percentage: 34, users: 4265 },
]

const deviceData = [
  { name: "Desktop", value: 65, color: "#8884d8" },
  { name: "Mobile", value: 28, color: "#82ca9d" },
  { name: "Tablet", value: 7, color: "#ffc658" },
]

const topPages = [
  { page: "/blog/getting-started", views: 8543, bounce: "32%", duration: "4m 12s" },
  { page: "/products/dashboard", views: 6234, bounce: "28%", duration: "5m 45s" },
  { page: "/about", views: 4521, bounce: "45%", duration: "2m 18s" },
  { page: "/contact", views: 3876, bounce: "38%", duration: "3m 02s" },
  { page: "/blog/advanced-tips", views: 3245, bounce: "25%", duration: "6m 33s" },
]

const trafficSources = [
  { source: "Organic Search", visitors: 5234, percentage: 42 },
  { source: "Direct", visitors: 3876, percentage: 31 },
  { source: "Social Media", visitors: 2109, percentage: 17 },
  { source: "Referral", visitors: 987, percentage: 8 },
  { source: "Email", visitors: 337, percentage: 2 },
]

const realTimeData = [
  { time: "00:00", users: 45 },
  { time: "00:05", users: 52 },
  { time: "00:10", users: 48 },
  { time: "00:15", users: 61 },
  { time: "00:20", users: 55 },
  { time: "00:25", users: 67 },
  { time: "00:30", users: 73 },
]

const conversionFunnelData = [
  { step: "Landing Page", users: 10000, percentage: 100 },
  { step: "Product View", users: 6500, percentage: 65 },
  { step: "Add to Cart", users: 3200, percentage: 32 },
  { step: "Checkout", users: 1800, percentage: 18 },
  { step: "Purchase", users: 1200, percentage: 12 },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d")

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Track your site's performance and user behavior</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {overviewStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.trend === "up" ? (
                    <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                  <span className="ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Page Views & Visitors</CardTitle>
                  <CardDescription>Daily page views and unique visitors over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={pageViewsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="visitors" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                  <CardDescription>Visitors by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages on your site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{page.page}</p>
                          <p className="text-sm text-muted-foreground">{page.views.toLocaleString()} views</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{page.bounce}</p>
                          <p className="text-muted-foreground">Bounce Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{page.duration}</p>
                          <p className="text-muted-foreground">Avg. Duration</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Scroll Depth Analysis</CardTitle>
                  <CardDescription>How far users scroll down your pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scrollDepthData.map((item) => (
                      <div key={item.depth} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.depth}</span>
                          <span>
                            {item.percentage}% ({item.users.toLocaleString()} users)
                          </span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Flow</CardTitle>
                  <CardDescription>Most common user paths through your site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Homepage</p>
                        <p className="text-sm text-muted-foreground">8,543 sessions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Product Pages</p>
                        <p className="text-sm text-muted-foreground">6,234 sessions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Contact Page</p>
                        <p className="text-sm text-muted-foreground">3,876 sessions</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Session Duration Distribution</CardTitle>
                <CardDescription>How long users spend on your site</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { duration: "0-30s", sessions: 2340 },
                      { duration: "30s-1m", sessions: 3456 },
                      { duration: "1-3m", sessions: 4567 },
                      { duration: "3-10m", sessions: 2890 },
                      { duration: "10m+", sessions: 1234 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="duration" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Demographics</CardTitle>
                  <CardDescription>Age and gender breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">18-24</span>
                      <div className="flex items-center gap-2">
                        <Progress value={25} className="w-20 h-2" />
                        <span className="text-sm">25%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">25-34</span>
                      <div className="flex items-center gap-2">
                        <Progress value={35} className="w-20 h-2" />
                        <span className="text-sm">35%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">35-44</span>
                      <div className="flex items-center gap-2">
                        <Progress value={20} className="w-20 h-2" />
                        <span className="text-sm">20%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">45+</span>
                      <div className="flex items-center gap-2">
                        <Progress value={20} className="w-20 h-2" />
                        <span className="text-sm">20%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Countries</CardTitle>
                  <CardDescription>Visitors by location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { country: "United States", visitors: 4567, flag: "🇺🇸" },
                      { country: "United Kingdom", visitors: 2345, flag: "🇬🇧" },
                      { country: "Canada", visitors: 1890, flag: "🇨🇦" },
                      { country: "Germany", visitors: 1234, flag: "🇩🇪" },
                      { country: "France", visitors: 987, flag: "🇫🇷" },
                    ].map((item) => (
                      <div key={item.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.flag}</span>
                          <span className="text-sm">{item.country}</span>
                        </div>
                        <span className="text-sm font-medium">{item.visitors.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New vs Returning</CardTitle>
                  <CardDescription>Visitor type breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New Visitors</span>
                      <div className="flex items-center gap-2">
                        <Progress value={68} className="w-20 h-2" />
                        <span className="text-sm font-medium">68%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Returning Visitors</span>
                      <div className="flex items-center gap-2">
                        <Progress value={32} className="w-20 h-2" />
                        <span className="text-sm font-medium">32%</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold">8,543</p>
                        <p className="text-sm text-muted-foreground">New Visitors</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="acquisition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trafficSources.map((source) => (
                    <div key={source.source} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{source.source}</p>
                          <p className="text-sm text-muted-foreground">{source.visitors.toLocaleString()} visitors</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={source.percentage} className="w-24 h-2" />
                        <span className="text-sm font-medium w-12">{source.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User journey from landing to conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnelData.map((step, index) => (
                    <div key={step.step} className="relative">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{step.step}</p>
                            <p className="text-sm text-muted-foreground">{step.users.toLocaleString()} users</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={step.percentage} className="w-32 h-2" />
                          <span className="text-sm font-medium w-12">{step.percentage}%</span>
                        </div>
                      </div>
                      {index < conversionFunnelData.length - 1 && (
                        <div className="absolute left-8 top-full h-4 w-0.5 bg-border" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Active Users
                  </CardTitle>
                  <CardDescription>Users currently on your site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-500">73</p>
                    <p className="text-sm text-muted-foreground">Active users right now</p>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={realTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Active Pages</CardTitle>
                  <CardDescription>Pages with active users right now</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { page: "/", users: 23 },
                      { page: "/blog/getting-started", users: 18 },
                      { page: "/products", users: 12 },
                      { page: "/about", users: 8 },
                      { page: "/contact", users: 5 },
                    ].map((item) => (
                      <div key={item.page} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.page}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-sm">{item.users} users</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
