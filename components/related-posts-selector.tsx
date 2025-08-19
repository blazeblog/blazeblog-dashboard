"use client"

import { useState, useEffect } from "react"
import { Search, X, Plus, GripVertical, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useClientApi, type Post } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"

interface RelatedPostsSelectorProps {
  currentPostId?: number
  selectedPosts: Post[]
  onChange: (posts: Post[]) => void
  maxSelection?: number
}

export function RelatedPostsSelector({
  currentPostId,
  selectedPosts,
  onChange,
  maxSelection = 5
}: RelatedPostsSelectorProps) {
  const [availablePosts, setAvailablePosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  
  const api = useClientApi()
  const { toast } = useToast()

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchAvailablePosts()
    }
  }, [currentPostId, searchQuery])

  const fetchAvailablePosts = async () => {
    if (!searchQuery.trim()) {
      setAvailablePosts([])
      return
    }

    setIsLoading(true)
    try {
      const response = await api.getPaginated<Post>('/posts/search', {
        title: searchQuery.trim(),
        limit: 10,
        status: 'published',
      })
      let posts = response.data
      if (currentPostId) {
        posts = posts.filter(post => post.id !== currentPostId)
      }
      setAvailablePosts(posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast({
        title: "Error",
        description: "Failed to load available posts",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPost = (post: Post) => {
    if (selectedPosts.length >= maxSelection) {
      toast({
        title: "Maximum reached",
        description: `You can only select up to ${maxSelection} related posts`,
        variant: "default"
      })
      return
    }

    if (selectedPosts.find(p => p.id === post.id)) {
      return // Already selected
    }

    onChange([...selectedPosts, post])
  }

  const handleRemovePost = (postId: number) => {
    onChange(selectedPosts.filter(post => post.id !== postId))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const reorderedPosts = [...selectedPosts]
    const draggedPost = reorderedPosts[draggedIndex]
    reorderedPosts.splice(draggedIndex, 1)
    reorderedPosts.splice(dropIndex, 0, draggedPost)
    
    onChange(reorderedPosts)
    setDraggedIndex(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPostDescription = (post: Post) => {
    if (post.excerpt) {
      return post.excerpt.length > 50 ? post.excerpt.substring(0, 50) + '...' : post.excerpt
    }
    return post.title || "Untitled Post"
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5" />
          Related Posts
        </CardTitle>
        <CardDescription className="text-sm">
          Select up to {maxSelection} related posts. Drag to reorder.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Selected Posts */}
        {selectedPosts.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selected Posts ({selectedPosts.length}/{maxSelection})</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center gap-2 p-2 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-md group text-sm"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <GripVertical className="h-3 w-3 text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {post.title}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePost(post.id)}
                    className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Add */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="post-search"
              placeholder="Search by title, excerpt, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          {/* Available Posts */}
          <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2 bg-gray-50/50 dark:bg-gray-800/50 min-h-[192px]">
            {isLoading ? (
              <div className="text-center text-gray-500 py-8">
                Loading posts...
              </div>
            ) : availablePosts.length === 0 && searchQuery.trim() === "" ? (
              <div className="text-center text-gray-500 py-8">
                Please enter a search query to find posts.
              </div>
            ) : availablePosts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No posts found.
              </div>
            ) : (
              availablePosts.map((post) => {
                const isSelected = selectedPosts.find(p => p.id === post.id)
                const isMaxReached = selectedPosts.length >= maxSelection
                return (
                  <div
                    key={post.id}
                    className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                      isSelected
                        ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"
                        : "hover:bg-white dark:hover:bg-gray-700/50 border border-transparent"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {post.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {formatPostDescription(post)}
                      </div>
                    </div>
                    {isSelected ? (
                      <Badge variant="default" className="text-xs px-2">
                        Selected
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddPost(post)}
                        disabled={isMaxReached}
                        className="h-6 text-xs px-2"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}