"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { X, Hash, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useClientApi, type Tag } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"

interface TagsInputProps {
  value: Tag[]
  onChange: (tags: Tag[]) => void
  placeholder?: string
  maxTags?: number
  className?: string
  disabled?: boolean
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function TagsInput({
  value = [],
  onChange,
  placeholder = "Add tags...",
  maxTags = 10,
  className,
  disabled = false,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const api = useClientApi()
  const { toast } = useToast()

  // Fetch tag suggestions based on input
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await api.getPaginated<Tag>("/tags", {
        search: query,
        limit: 10
      })
      
      // Filter out already selected tags
      const filteredSuggestions = response.data.filter(
        tag => !value.some(selectedTag => selectedTag.id === tag.id)
      )
      
      setSuggestions(filteredSuggestions)
      setShowSuggestions(filteredSuggestions.length > 0)
    } catch (error) {
      console.error("Error fetching tag suggestions:", error)
    } finally {
      setIsLoading(false)
    }
  }, [api, value])

  // Debounced suggestion fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(inputValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, fetchSuggestions])

  // Create new tag
  const createTag = async (name: string): Promise<Tag> => {
    const slug = slugify(name)
    
    try {
      const newTag = await api.post<Tag>("/tags", {
        name: name.trim(),
        slug: slug
      })
      
      toast({
        title: "Tag created",
        description: `Created new tag "${name}"`,
        variant: "default"
      })
      
      return newTag
    } catch (error) {
      console.error("Error creating tag:", error)
      toast({
        title: "Error",
        description: "Failed to create tag. Please try again.",
        variant: "destructive"
      })
      throw error
    }
  }

  // Add tag (existing or new)
  const addTag = async (tagOrName: Tag | string) => {
    if (value.length >= maxTags) {
      toast({
        title: "Tag limit reached",
        description: `You can only add up to ${maxTags} tags per article.`,
        variant: "destructive"
      })
      return
    }

    try {
      let tagToAdd: Tag

      if (typeof tagOrName === "string") {
        // Check if tag with this name already exists in suggestions
        const existingTag = suggestions.find(
          tag => tag.name.toLowerCase() === tagOrName.toLowerCase()
        )
        
        if (existingTag) {
          tagToAdd = existingTag
        } else {
          // Create new tag
          tagToAdd = await createTag(tagOrName)
        }
      } else {
        tagToAdd = tagOrName
      }

      // Check if tag is already selected
      if (value.some(tag => tag.id === tagToAdd.id)) {
        return
      }

      onChange([...value, tagToAdd])
      setInputValue("")
      setShowSuggestions(false)
      inputRef.current?.focus()
    } catch (error) {
      // Error is already handled in createTag
    }
  }

  // Remove tag
  const removeTag = (tagId: number) => {
    onChange(value.filter(tag => tag.id !== tagId))
  }

  // Handle input key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const trimmedValue = inputValue.trim()

    if (e.key === "Enter" && trimmedValue) {
      e.preventDefault()
      addTag(trimmedValue)
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      e.preventDefault()
      removeTag(value[value.length - 1].id)
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= 50) { // Limit tag name length
      setInputValue(newValue)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (tag: Tag) => {
    addTag(tag)
  }

  // Handle create new tag click
  const handleCreateNewTag = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue) {
      addTag(trimmedValue)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="min-h-[2.5rem] p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1 mb-1">
          {value.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-1 max-w-[200px]"
            >
              <Hash className="h-3 w-3" />
              <span className="truncate">{tag.name}</span>
              {!disabled && (
                <button
                  onClick={() => removeTag(tag.id)}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>

        {!disabled && value.length < maxTags && (
          <Input
            ref={inputRef}
            type="text"
            placeholder={value.length === 0 ? placeholder : ""}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.length >= 2 && setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm"
            disabled={disabled}
          />
        )}
      </div>

      {/* Tag limit indicator */}
      <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
        <span>
          {value.length}/{maxTags} tags
        </span>
        {inputValue && inputValue.length > 40 && (
          <span className="text-amber-600">
            {inputValue.length}/50 characters
          </span>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Loading suggestions...
            </div>
          ) : (
            <div className="py-1">
              {/* Existing tag suggestions */}
              {suggestions.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleSuggestionClick(tag)}
                  className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground text-sm flex items-center gap-2"
                  type="button"
                >
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  <span>{tag.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {tag.postCount || 0} posts
                  </span>
                </button>
              ))}

              {/* Create new tag option */}
              {inputValue.trim() && 
                !suggestions.some(tag => 
                  tag.name.toLowerCase() === inputValue.trim().toLowerCase()
                ) && (
                <button
                  onClick={handleCreateNewTag}
                  className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground text-sm flex items-center gap-2 border-t"
                  type="button"
                >
                  <Plus className="h-3 w-3 text-muted-foreground" />
                  <span>Create "{inputValue.trim()}"</span>
                </button>
              )}

              {/* No suggestions found */}
              {suggestions.length === 0 && !inputValue.trim() && (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  Type to search for tags
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}