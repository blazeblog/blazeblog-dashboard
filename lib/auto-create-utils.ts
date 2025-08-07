"use client"

import type { Tag, Category } from "@/lib/client-api"

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export interface AutoCreateOptions {
  api: {
    getPaginated: <T = any>(endpoint: string, params?: any) => Promise<{ data: T[] }>
    post: <T = any>(endpoint: string, body: any) => Promise<T>
  }
  toast: (options: { title: string; description: string; variant: "default" | "destructive"; duration?: number }) => void
}

export async function ensureTagsExist(
  tagNames: string[],
  { api, toast }: AutoCreateOptions
): Promise<Tag[]> {
  const results: Tag[] = []
  const maxTags = 10

  // Limit to max tags
  const limitedTagNames = tagNames.slice(0, maxTags)

  for (const tagName of limitedTagNames) {
    const trimmedName = tagName.trim()
    if (!trimmedName) continue

    try {
      // First, try to find existing tag
      const existingTags = await api.getPaginated<Tag>("/tags", {
        search: trimmedName,
        limit: 1
      })

      const exactMatch = existingTags.data.find(
        (tag: any) => tag.name.toLowerCase() === trimmedName.toLowerCase()
      )

      if (exactMatch) {
        results.push(exactMatch)
      } else {
        // Create new tag
        const newTag = await api.post<Tag>("/tags", {
          name: trimmedName,
          slug: slugify(trimmedName)
        })

        results.push(newTag)

        toast({
          title: "Tag created",
          description: `Created new tag "${trimmedName}"`,
          variant: "default",
          duration: 3000
        })
      }
    } catch (error) {
      console.error(`Error creating/finding tag "${trimmedName}":`, error)
      
      toast({
        title: "Tag creation failed",
        description: `Failed to create tag "${trimmedName}"`,
        variant: "destructive",
        duration: 3000
      })
    }
  }

  return results
}

export async function ensureCategoryExists(
  categoryName: string | null,
  { api, toast }: AutoCreateOptions
): Promise<Category | null> {
  if (!categoryName?.trim()) return null

  const trimmedName = categoryName.trim()

  try {
    // First, try to find existing category
    const existingCategories = await api.getPaginated<Category>("/categories", {
      search: trimmedName,
      limit: 1
    })

    const exactMatch = existingCategories.data.find(
      (category: any) => category.name.toLowerCase() === trimmedName.toLowerCase()
    )

    if (exactMatch) {
      return exactMatch
    }

    // Create new category
    const newCategory = await api.post<Category>("/categories", {
      name: trimmedName,
      slug: slugify(trimmedName),
      description: `Auto-created category for ${trimmedName}`,
      isActive: true,
      sortOrder: 999 // Place at end
    })

    toast({
      title: "Category created",
      description: `Created new category "${trimmedName}"`,
      variant: "default",
      duration: 3000
    })

    return newCategory

  } catch (error) {
    console.error(`Error creating/finding category "${trimmedName}":`, error)
    
    toast({
      title: "Category creation failed",
      description: `Failed to create category "${trimmedName}"`,
      variant: "destructive",
      duration: 3000
    })

    return null
  }
}

export async function createTagsFromText(
  text: string,
  { api, toast }: AutoCreateOptions
): Promise<Tag[]> {
  // Split by comma and clean up
  const tagNames = text
    .split(",")
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0 && tag.length <= 50) // Reasonable tag length
    .slice(0, 10) // Max 10 tags

  return ensureTagsExist(tagNames, { api, toast })
}

// Bulk create multiple tags
export async function bulkCreateTags(
  tagNames: string[],
  { api, toast }: AutoCreateOptions
): Promise<Tag[]> {
  const cleanNames = tagNames
    .map(name => name.trim())
    .filter(name => name.length > 0 && name.length <= 50)
    .slice(0, 10)

  if (cleanNames.length === 0) return []

  try {
    // Try to use bulk endpoint if available
    const response = await api.post<{ tags: Tag[] }>("/tags/bulk", {
      names: cleanNames
    })

    const createdCount = response.tags.length
    
    toast({
      title: "Tags created",
      description: `Successfully created ${createdCount} tag${createdCount !== 1 ? 's' : ''}`,
      variant: "default",
      duration: 3000
    })

    return response.tags

  } catch (error) {
    // Fallback to individual creation
    console.warn("Bulk tag creation failed, falling back to individual creation:", error)
    return ensureTagsExist(cleanNames, { api, toast })
  }
}

// Extract potential tags from content
export function suggestTagsFromContent(
  title: string,
  content: string,
  limit: number = 8
): string[] {
  const commonWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", 
    "by", "from", "up", "about", "into", "through", "during", "before", "after", 
    "above", "below", "between", "among", "this", "that", "these", "those", "i", "you", 
    "he", "she", "it", "we", "they", "am", "is", "are", "was", "were", "be", "been", 
    "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", 
    "should", "may", "might", "can", "must", "said", "say", "get", "got", "go", "went",
    "come", "came", "see", "saw", "know", "knew", "think", "thought", "take", "took",
    "give", "gave", "find", "found", "tell", "told", "become", "became", "leave", "left",
    "feel", "felt", "bring", "brought", "begin", "began", "keep", "kept", "hold", "held",
    "write", "wrote", "read", "need", "try", "tried", "ask", "asked", "work", "worked",
    "seem", "seemed", "feel", "felt", "try", "tried", "call", "called", "just", "like",
    "now", "way", "make", "made", "look", "looked", "right", "still", "also", "back",
    "other", "many", "most", "over", "such", "very", "what", "out", "so", "up", "time",
    "them", "than", "only", "its", "who", "oil", "sit", "set", "run", "ran", "hot", "let",
    "cut", "yes", "yet", "ago", "off", "far", "sea", "own", "under", "ten"
  ])

  // Combine title and content, remove HTML tags
  const text = `${title} ${content}`.replace(/<[^>]*>/g, " ")
  
  // Extract words (3+ characters, alphanumeric)
  const words = text
    .toLowerCase()
    .match(/\b[a-z0-9]{3,}\b/g) || []

  // Count word frequency
  const wordFreq = words
    .filter(word => !commonWords.has(word))
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  // Get most frequent words as potential tags
  const suggestions = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word)
    .filter(word => word.length >= 3 && word.length <= 20) // Reasonable tag length

  return suggestions
}

// Generate SEO-friendly slug
export function generateSlug(title: string, maxLength: number = 60): string {
  if (!title.trim()) return ""
  
  return slugify(title).substring(0, maxLength)
}

// Generate meta description from content
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  if (!content.trim()) return ""
  
  // Remove HTML tags and get plain text
  const plainText = content.replace(/<[^>]*>/g, "").trim()
  
  if (plainText.length <= maxLength) {
    return plainText
  }
  
  // Try to break at sentence boundaries
  const sentences = plainText.split(/[.!?]+/)
  let description = ""
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (!trimmedSentence) continue
    
    if ((description + trimmedSentence).length <= maxLength - 3) {
      description += (description ? ". " : "") + trimmedSentence
    } else {
      break
    }
  }
  
  // If we have a good description, return it
  if (description.length >= 100) {
    return description + "."
  }
  
  // Otherwise, truncate at word boundary
  const words = plainText.split(/\s+/)
  let truncated = ""
  
  for (const word of words) {
    if ((truncated + " " + word).length <= maxLength - 3) {
      truncated += (truncated ? " " : "") + word
    } else {
      break
    }
  }
  
  return truncated.length > 50 ? truncated + "..." : truncated
}