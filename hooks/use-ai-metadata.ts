"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useClientApi } from "@/lib/client-api"

interface AIMetadataResponse {
  title: string
  slug: string
  excerpt: string
  metaDescription: string
  tags: string[]
}

interface RateLimitResponse {
  totalRequests: number
  availableRequests: number
  timeWindow: string
  usedRequests: number
}

export function useAIMetadata() {
  const { toast } = useToast()
  const api = useClientApi()
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate metadata using AI
  const generateMetadata = useCallback(async (article: string, existingSlug?: string, existingTitle?: string): Promise<AIMetadataResponse | null> => {
    if (!article.trim()) {
      toast({
        title: "No content",
        description: "Please provide content to generate metadata.",
        variant: "destructive"
      })
      return null
    }

    setIsGenerating(true)

    try {
      console.log('Sending AI metadata request with:', { 
        data: article.trim(), 
        slug: existingSlug || '', 
        title: existingTitle || ''
      })

      const data: AIMetadataResponse = await api.post('/ai/generate-metadata', {
        data: article.trim(),
        slug: existingSlug || '',
        title: existingTitle || ''
      })

      console.log('AI metadata response:', data)

      toast({
        title: "Metadata generated successfully",
        description: "AI has generated optimized metadata for your content.",
        variant: "default"
      })

      return data
    } catch (error) {
      console.error('Error generating metadata:', error)
      
      // Handle rate limiting error specifically
      if (error instanceof Error && (error.message.includes('429') || error.message.includes('rate limit'))) {
        toast({
          title: "Rate limit exceeded",
          description: "You've exceeded the AI generation limit. Please try again later.",
          variant: "destructive"
        })
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const status = (error as any)?.status
        const responseData = (error as any)?.responseData
        
        console.error('Detailed error:', { errorMessage, status, responseData })
        
        // Show different messages based on status code
        let title = "Generation failed"
        let description = errorMessage
        
        if (status === 400) {
          title = "Validation Error"
          description = errorMessage.includes('API Error:') 
            ? errorMessage.replace('API Error: 400 Bad Request', '').trim() || errorMessage
            : errorMessage
        }
        
        toast({
          title,
          description,
          variant: "destructive",
          duration: 8000
        })
      }
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [api, toast])

  // Get rate limit info from API
  const getRateLimitInfo = useCallback(async (): Promise<RateLimitResponse | null> => {
    try {
      const data: RateLimitResponse = await api.get('/ai/rate-limit')
      return data
    } catch (error) {
      console.error('Error getting rate limit info:', error)
      return null
    }
  }, [api])

  return {
    generateMetadata,
    isGenerating,
    getRateLimitInfo
  }
}