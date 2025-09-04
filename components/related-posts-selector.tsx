"use client"

import { useState, useEffect, useRef } from "react"
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
  selectedPosts: { id: number; title: string; slug?: string | null }[]
  onChange: (posts: { id: number; title: string; slug?: string | null }[]) => void
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
  const [showDropdown, setShowDropdown] = useState(false)
  
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const api = useClientApi()
  const { toast } = useToast()

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchAvailablePosts()
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
      setAvailablePosts([])
    }
  }, [currentPostId, searchQuery])

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

    onChange([...selectedPosts, { id: post.id, title: post.title, slug: post.slug }])
    setShowDropdown(false) // Hide dropdown after selection
  }

  const handleInputFocus = () => {
    if (searchQuery.trim() && availablePosts.length > 0) {
      setShowDropdown(true)
    }
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
    return "No description available"
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
                  className="flex items-center gap-2 p-2 bg-card border border-border rounded-md group text-sm hover:bg-accent/50"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
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
        <div className="relative" ref={searchContainerRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="post-search"
              placeholder="Search by title, excerpt, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleInputFocus}
              className="pl-10 h-9"
            />
          </div>

          {/* Search Results Dropdown - Only show when showDropdown is true */}
          {showDropdown && (searchQuery.trim() || isLoading) && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-4 text-sm">
                  Loading posts...
                </div>
              ) : availablePosts.length === 0 ? (
                <div className="text-center text-muted-foreground py-4 text-sm">
                  No posts found.
                </div>
              ) : (
              availablePosts.map((post) => {
                const isSelected = selectedPosts.find(p => p.id === post.id)
                const isMaxReached = selectedPosts.length >= maxSelection
                return (
                  <div
                    key={post.id}
                    onClick={() => !isSelected && !isMaxReached && handleAddPost(post)}
                    className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : isMaxReached
                        ? "bg-muted border border-transparent opacity-50 cursor-not-allowed"
                        : "hover:bg-accent border border-transparent cursor-pointer hover:shadow-sm"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {post.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {formatPostDescription(post)}
                      </div>
                    </div>
                    {isSelected ? (
                      <Badge variant="default" className="text-xs px-2">
                        Selected
                      </Badge>
                    ) : !isMaxReached ? (
                      <div className="text-xs text-muted-foreground px-2 py-1">
                        Click to add
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground px-2 py-1">
                        Max reached
                      </div>
                    )}
                  </div>
                )
              })
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}