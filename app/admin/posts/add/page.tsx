"use client"

import type React from "react"
import { useState } from "react"
import { Save, X, FileText, Settings, Eye, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { SimpleTiptapEditor } from "@/components/simple-tiptap-editor"
import { PostPreview } from "@/components/post-preview"

export default function AddPostPage() {
  const [formData, setFormData] = useState({
    title: "",
    content: "<p>Start writing your amazing post here...</p>",
    category: "",
    status: "draft",
    excerpt: "",
    tags: "",
    featuredImage: "",
    publishDate: "",
  })

  const [activeTab, setActiveTab] = useState("editor")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would use Inertia's router.post() to send data to NestJS
    console.log("Form submitted:", formData)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500"
      case "draft":
        return "bg-yellow-500"
      case "archived":
        return "bg-gray-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <AdminLayout title="Create New Post">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <a href="/admin/posts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </a>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Create New Post</h2>
            <p className="text-muted-foreground">Write and publish your content</p>
          </div>
          <Badge className={getStatusColor(formData.status)}>
            {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/posts">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </a>
          </Button>
          <Button onClick={handleSubmit} size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Post
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Post Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter an engaging title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="text-lg font-medium"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Editor Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Editor</CardTitle>
                    <CardDescription>
                      Use the rich text editor to create your content. Supports markdown, tables, images, and more.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleTiptapEditor
                      content={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      placeholder="Start writing your amazing post..."
                      className="min-h-[600px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <PostPreview title={formData.title} content={formData.content} excerpt={formData.excerpt} />
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>SEO Settings</CardTitle>
                      <CardDescription>Optimize your post for search engines</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="excerpt">Meta Description</Label>
                        <Textarea
                          id="excerpt"
                          placeholder="Brief description for SEO and social sharing..."
                          rows={3}
                          value={formData.excerpt}
                          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">{formData.excerpt.length}/160 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          placeholder="tag1, tag2, tag3"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Featured Image</CardTitle>
                      <CardDescription>Add a featured image for your post</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="featuredImage">Image URL</Label>
                        <Input
                          id="featuredImage"
                          placeholder="https://example.com/image.jpg"
                          value={formData.featuredImage}
                          onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                        />
                      </div>
                      {formData.featuredImage && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <img
                            src={formData.featuredImage || "/placeholder.svg"}
                            alt="Featured"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
                <CardDescription>Configure how and when to publish</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Input
                    id="publishDate"
                    type="datetime-local"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save & Publish
                </Button>
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Save as Draft
                </Button>
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Schedule Post
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Post Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Words:</span>
                  <span className="font-medium">
                    {
                      formData.content
                        .replace(/<[^>]*>/g, "")
                        .split(" ")
                        .filter((word) => word.length > 0).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Characters:</span>
                  <span className="font-medium">{formData.content.replace(/<[^>]*>/g, "").length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reading time:</span>
                  <span className="font-medium">
                    {Math.ceil(formData.content.replace(/<[^>]*>/g, "").split(" ").length / 200)} min
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}
