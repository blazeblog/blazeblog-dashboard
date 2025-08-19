"use client"

import React, { useMemo, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  TrendingUp, 
  Hash, 
  Image, 
  FileText, 
  Link,
  Target,
  Search,
  Eye,
  Clock,
  Sparkles,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAIMetadata } from "@/hooks/use-ai-metadata"
import type { Tag } from "@/lib/client-api"

interface SEOSuggestionsProps {
  title: string
  content: string
  excerpt: string
  slug?: string
  tags: Tag[]
  featuredImage?: string
  onTitleSuggestion?: (title: string) => void
  onSlugSuggestion: (slug: string) => void
  onTagSuggestions: (tags: string[]) => void
  onExcerptSuggestion: (excerpt: string) => void
  onMetaDescriptionSuggestion?: (metaDescription: string) => void
  className?: string
}

interface SEOScore {
  category: string
  score: number
  maxScore: number
  status: "good" | "warning" | "error"
  suggestions: string[]
  icon: React.ReactNode
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60) // SEO-friendly length
}

function extractKeywords(text: string, limit: number = 10): string[] {
  const commonWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", 
    "by", "from", "up", "about", "into", "through", "during", "before", "after", 
    "above", "below", "between", "among", "this", "that", "these", "those", "i", "you", 
    "he", "she", "it", "we", "they", "am", "is", "are", "was", "were", "be", "been", 
    "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", 
    "should", "may", "might", "can", "must"
  ])

  const words = text
    .toLowerCase()
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .match(/\b[a-z]{3,}\b/g) || []

  const wordFreq = words
    .filter(word => !commonWords.has(word))
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word)
}

function getReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export function SEOSuggestionsSidebar({
  title,
  content,
  excerpt,
  slug,
  tags,
  featuredImage,
  onTitleSuggestion,
  onSlugSuggestion,
  onTagSuggestions,
  onExcerptSuggestion,
  onMetaDescriptionSuggestion,
  className
}: SEOSuggestionsProps) {
  const [suggestedSlug, setSuggestedSlug] = useState("")
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    totalRequests: number
    availableRequests: number
    timeWindow: string
    usedRequests: number
  } | null>(null)
  const { generateMetadata, isGenerating, getRateLimitInfo } = useAIMetadata()

  // Generate slug suggestion when title changes
  useEffect(() => {
    if (title && title.length > 0) {
      const newSlug = slugify(title)
      setSuggestedSlug(newSlug)
    }
  }, [title])

  // Fetch rate limit info only on component mount
  useEffect(() => {
    const fetchRateLimitInfo = async () => {
      const info = await getRateLimitInfo()
      setRateLimitInfo(info)
    }
    
    fetchRateLimitInfo()
  }, []) // Empty dependency array - only runs on mount

  // Update rate limit info after AI generation
  const updateRateLimitInfo = async () => {
    const info = await getRateLimitInfo()
    setRateLimitInfo(info)
  }

  // Handle AI metadata generation
  const handleAIGeneration = async () => {
    if (!content.trim()) {
      console.log('No content provided for AI generation')
      return
    }

    console.log('Starting AI metadata generation...')
    const currentSlug = slug || suggestedSlug
    const currentTitle = title
    
    console.log('SEO Sidebar - Values being passed:', {
      content: content.substring(0, 100) + '...',
      slug: slug,
      suggestedSlug: suggestedSlug,
      currentSlug: currentSlug,
      title: title,
      currentTitle: currentTitle
    })
    
    const result = await generateMetadata(content, currentSlug, currentTitle)
    console.log('AI metadata result:', result)
    
    if (result) {
      console.log('Processing AI suggestions...')
      
      // Apply AI suggestions with individual logging
      if (result.title && onTitleSuggestion) {
        console.log('Calling onTitleSuggestion with:', result.title)
        onTitleSuggestion(result.title)
      } else {
        console.log('Title suggestion skipped:', { 
          hasTitle: !!result.title, 
          hasCallback: !!onTitleSuggestion 
        })
      }
      
      if (result.slug && onSlugSuggestion) {
        console.log('Calling onSlugSuggestion with:', result.slug)
        onSlugSuggestion(result.slug)
      } else if (result.title) {
        // Fallback: generate slug from title if no slug provided
        const generatedSlug = slugify(result.title)
        console.log('Calling onSlugSuggestion with generated slug:', generatedSlug)
        onSlugSuggestion(generatedSlug)
      } else {
        console.log('Slug suggestion skipped:', { 
          hasSlug: !!result.slug, 
          hasTitle: !!result.title,
          hasCallback: !!onSlugSuggestion 
        })
      }
      
      if (result.excerpt && onExcerptSuggestion) {
        console.log('Calling onExcerptSuggestion with:', result.excerpt)
        onExcerptSuggestion(result.excerpt)
      } else {
        console.log('Excerpt suggestion skipped:', { 
          hasExcerpt: !!result.excerpt, 
          hasCallback: !!onExcerptSuggestion 
        })
      }
      
      if (result.metaDescription && onMetaDescriptionSuggestion) {
        console.log('Calling onMetaDescriptionSuggestion with:', result.metaDescription)
        onMetaDescriptionSuggestion(result.metaDescription)
      } else {
        console.log('Meta description suggestion skipped:', { 
          hasMetaDescription: !!result.metaDescription, 
          hasCallback: !!onMetaDescriptionSuggestion 
        })
      }
      
      if (result.tags && result.tags.length > 0) {
        console.log('Calling onTagSuggestions with:', result.tags)
        onTagSuggestions(result.tags)
      } else {
        console.log('Tag suggestions skipped:', { 
          hasTags: !!(result.tags && result.tags.length > 0), 
          hasCallback: !!onTagSuggestions 
        })
      }

      // Update rate limit info
      updateRateLimitInfo()
      console.log('AI metadata processing complete')
    } else {
      console.log('No result from AI metadata generation')
    }
  }

  // Calculate SEO scores and suggestions
  const seoAnalysis = useMemo((): SEOScore[] => {
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(word => word.length > 0).length
    const readingTime = getReadingTime(content)
    const headingCount = (content.match(/<h[1-6][^>]*>/g) || []).length
    const keywords = extractKeywords(`${title} ${content}`, 8)
    const currentSlug = slug || suggestedSlug

    const scores: SEOScore[] = [
      // Title Analysis
      {
        category: "Title Optimization",
        score: title.length >= 30 && title.length <= 60 ? 100 : title.length > 0 ? 60 : 0,
        maxScore: 100,
        status: title.length >= 30 && title.length <= 60 ? "good" : title.length > 0 ? "warning" : "error",
        suggestions: title.length === 0 
          ? ["Add a compelling title"]
          : title.length < 30 
            ? ["Title is too short (aim for 30-60 characters)", "Include your main keyword in the title"]
            : title.length > 60 
              ? ["Title is too long (aim for 30-60 characters)", "Shorten while keeping the main keyword"]
              : ["Great title length! Consider adding your main keyword if missing"],
        icon: <FileText className="h-4 w-4" />
      },

      // Content Length
      {
        category: "Content Length",
        score: wordCount >= 300 ? (wordCount >= 1000 ? 100 : 80) : wordCount > 150 ? 60 : wordCount > 0 ? 40 : 0,
        maxScore: 100,
        status: wordCount >= 300 ? "good" : wordCount > 150 ? "warning" : "error",
        suggestions: wordCount === 0
          ? ["Start writing your content"]
          : wordCount < 150
            ? ["Content is too short. Aim for at least 300 words for better SEO"]
            : wordCount < 300
              ? ["Consider expanding to 300+ words for better search rankings"]
              : wordCount > 2000
                ? ["Consider breaking long content into multiple sections with headings"]
                : ["Good content length for SEO!"],
        icon: <TrendingUp className="h-4 w-4" />
      },

      // Meta Description
      {
        category: "Meta Description",
        score: excerpt.length >= 120 && excerpt.length <= 160 ? 100 : excerpt.length > 50 ? 70 : excerpt.length > 0 ? 40 : 0,
        maxScore: 100,
        status: excerpt.length >= 120 && excerpt.length <= 160 ? "good" : excerpt.length > 50 ? "warning" : "error",
        suggestions: excerpt.length === 0
          ? ["Add a meta description to improve click-through rates"]
          : excerpt.length < 120
            ? ["Meta description is too short (aim for 120-160 characters)", "Describe the main benefit readers will get"]
            : excerpt.length > 160
              ? ["Meta description is too long (max 160 characters)", "Trim while keeping the key selling points"]
              : ["Perfect meta description length!"],
        icon: <Search className="h-4 w-4" />
      },

      // URL/Slug
      {
        category: "URL Structure",
        score: currentSlug.length > 0 && currentSlug.length <= 60 && !currentSlug.includes("_") ? 100 : currentSlug.length > 0 ? 60 : 0,
        maxScore: 100,
        status: currentSlug.length > 0 && currentSlug.length <= 60 && !currentSlug.includes("_") ? "good" : currentSlug.length > 0 ? "warning" : "error",
        suggestions: currentSlug.length === 0
          ? ["Generate SEO-friendly URL slug"]
          : currentSlug.length > 60
            ? ["URL slug is too long (max 60 characters)", "Shorten while keeping main keywords"]
            : currentSlug.includes("_")
              ? ["Replace underscores with hyphens for better SEO"]
              : ["Great URL structure!"],
        icon: <Link className="h-4 w-4" />
      },

      // Tags
      {
        category: "Tags & Keywords",
        score: tags.length >= 3 && tags.length <= 8 ? 100 : tags.length > 0 ? 60 : 0,
        maxScore: 100,
        status: tags.length >= 3 && tags.length <= 8 ? "good" : tags.length > 0 ? "warning" : "error",
        suggestions: tags.length === 0
          ? ["Add 3-8 relevant tags to improve discoverability"]
          : tags.length < 3
            ? ["Add more tags (aim for 3-8 total)", "Use keywords from your content"]
            : tags.length > 8
              ? ["Too many tags - focus on the most relevant ones"]
              : ["Good tag usage!"],
        icon: <Hash className="h-4 w-4" />
      },

      // Featured Image
      {
        category: "Featured Image",
        score: featuredImage ? 100 : 0,
        maxScore: 100,
        status: featuredImage ? "good" : "error",
        suggestions: featuredImage
          ? ["Great! You have a featured image"]
          : ["Add a featured image to improve social sharing", "Images increase engagement by 94%"],
        icon: <Image className="h-4 w-4" />
      },

      // Content Structure
      {
        category: "Content Structure",
        score: headingCount >= 2 ? 100 : headingCount > 0 ? 70 : 0,
        maxScore: 100,
        status: headingCount >= 2 ? "good" : headingCount > 0 ? "warning" : "error",
        suggestions: headingCount === 0
          ? ["Add headings to structure your content", "Use H2 and H3 tags for better organization"]
          : headingCount === 1
            ? ["Add more subheadings to improve readability", "Break up content with H2 and H3 tags"]
            : ["Good use of headings for content structure!"],
        icon: <Target className="h-4 w-4" />
      }
    ]

    return scores
  }, [title, content, excerpt, slug, suggestedSlug, tags, featuredImage])

  // Calculate overall SEO score
  const overallScore = Math.round(
    seoAnalysis.reduce((sum, item) => sum + item.score, 0) / seoAnalysis.length
  )

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackgroundColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Generate smart suggestions
  const handleSlugSuggestion = () => {
    if (suggestedSlug) {
      onSlugSuggestion(suggestedSlug)
    }
  }

  const handleTagSuggestions = () => {
    const keywords = extractKeywords(`${title} ${content}`, 5)
    onTagSuggestions(keywords)
  }

  const handleExcerptSuggestion = () => {
    if (content) {
      const plainText = content.replace(/<[^>]*>/g, "").trim()
      const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 10)
      if (sentences.length > 0) {
        const excerpt = sentences.slice(0, 2).join(". ") + "."
        const trimmedExcerpt = excerpt.length > 160 
          ? excerpt.substring(0, 157) + "..." 
          : excerpt
        onExcerptSuggestion(trimmedExcerpt)
      }
    }
  }

  const readingTime = getReadingTime(content)
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(word => word.length > 0).length

  return (
    <div className={cn("space-y-3", className)}>
      {/* Overall SEO Score */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            SEO Score
          </CardTitle>
          <CardDescription>Overall content optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
              <Progress value={overallScore} className="h-2" />
            </div>
            <div className={cn("text-2xl font-bold", getScoreColor(overallScore))}>
              {overallScore}%
            </div>
          </div>
          <Badge 
            variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}
            className="text-xs"
          >
            {overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : "Needs Improvement"}
          </Badge>
        </CardContent>
      </Card>

      {/* AI Metadata Generation */}
      <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            AI Metadata Generator
          </CardTitle>
          <CardDescription>
            Generate optimized metadata using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleAIGeneration}
            disabled={isGenerating || (rateLimitInfo && rateLimitInfo.availableRequests <= 0) || !content.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Metadata
              </>
            )}
          </Button>
          
          {/* Rate limit info with color coding */}
          {rateLimitInfo && (
            <div className="mt-2 text-center">
              {rateLimitInfo.availableRequests <= 0 ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {rateLimitInfo.usedRequests} of {rateLimitInfo.totalRequests} requests used for the day
                </p>
              ) : (
                <p className={`text-xs ${
                  rateLimitInfo.availableRequests / rateLimitInfo.totalRequests <= 0.2 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {rateLimitInfo.availableRequests}/{rateLimitInfo.totalRequests} requests remaining
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Content Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Word Count</span>
            <span className={wordCount >= 300 ? "text-green-600" : "text-yellow-600"}>
              {wordCount} words
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Reading Time</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTime} min
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Character Count</span>
            <span>{content.replace(/<[^>]*>/g, "").length}</span>
          </div>
        </CardContent>
      </Card>

      {/* SEO Suggestions */}
      {seoAnalysis.map((item, index) => (
        <Card key={index} className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {item.icon}
              {item.category}
              {item.status === "good" && <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}
              {item.status === "warning" && <AlertCircle className="h-4 w-4 text-yellow-600 ml-auto" />}
              {item.status === "error" && <XCircle className="h-4 w-4 text-red-600 ml-auto" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Progress value={(item.score / item.maxScore) * 100} className="flex-1 h-1.5" />
              <span className="text-xs text-muted-foreground">
                {item.score}/{item.maxScore}
              </span>
            </div>
            
            <div className="space-y-1.5">
              {item.suggestions.map((suggestion, idx) => (
                <p key={idx} className="text-xs text-muted-foreground leading-relaxed">
                  {suggestion}
                </p>
              ))}
            </div>

            {/* Action buttons for specific categories */}
            {item.category === "URL Structure" && suggestedSlug && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleSlugSuggestion}
                className="w-full text-xs h-8"
              >
                Use: "{suggestedSlug.length > 30 ? suggestedSlug.substring(0, 30) + "..." : suggestedSlug}"
              </Button>
            )}
{/* 
            {item.category === "Tags & Keywords" && content && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleTagSuggestions}
                className="w-full text-xs h-8"
              >
                Suggest Tags from Content
              </Button>
            )} */}

            {/* {item.category === "Meta Description" && content && !excerpt && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleExcerptSuggestion}
                className="w-full text-xs h-8"
              >
                Generate from Content
              </Button>
            )} */}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}