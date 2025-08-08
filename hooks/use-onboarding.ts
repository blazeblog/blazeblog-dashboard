"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { useClientApi } from "@/lib/client-api"

interface OnboardingData {
  companyName: string
  blogUrl: string
  themeId: string
}

interface OnboardingStatus {
  isOnboarded: boolean
  isLoading: boolean
  hasCompletedOnboarding: (data: OnboardingData) => Promise<void>
}

interface SlugCheckResult {
  exists: boolean
  isChecking: boolean
  error: string | null
}

export function useOnboarding(): OnboardingStatus {
  const { user, isLoaded } = useUser()
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const api = useClientApi()

  useEffect(() => {
    if (!isLoaded) return

    if (user) {
      // Check if user has completed onboarding
      // For now, we'll use localStorage as a temporary solution
      // In production, this should be stored in your database
      const onboardingCompleted = localStorage.getItem(`onboarding_${user.id}`)
      
      // Also check if user has onboarding metadata from Clerk
      const hasOnboardingData = user.publicMetadata?.onboardingCompleted as boolean
      
      setIsOnboarded(onboardingCompleted === 'true' || hasOnboardingData || false)
    }
    
    setIsLoading(false)
  }, [user, isLoaded])

  const hasCompletedOnboarding = async (data: OnboardingData) => {
    if (!user) return
    
    try {
      // Call the complete-onboarding API - it will update user metadata server-side
      await api.patch('/onboarding/complete', {
        companyName: data.companyName,
        blogUrl: data.blogUrl,
        themeId: data.themeId
      })
      
      // Mark onboarding as completed in localStorage (for immediate UI update)
      localStorage.setItem(`onboarding_${user.id}`, 'true')
      
      setIsOnboarded(true)
      
      // Refresh user data to get updated metadata
      await user.reload()
    } catch (error) {
      console.error('Error completing onboarding:', error)
      throw error
    }
  }

  return {
    isOnboarded,
    isLoading: isLoading || !isLoaded,
    hasCompletedOnboarding
  }
}

export function useSlugCheck(): {
  checkSlug: (slug: string) => void
  result: SlugCheckResult
  clearResult: () => void
} {
  const [result, setResult] = useState<SlugCheckResult>({
    exists: false,
    isChecking: false,
    error: null
  })
  
  const api = useClientApi()
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const checkSlug = useCallback(async (slug: string) => {
    if (!slug.trim()) {
      setResult({
        exists: false,
        isChecking: false,
        error: null
      })
      return
    }

    try {
      const response = await api.get<{
        message: string
        exists: boolean
      }>(`/onboarding/check-blog-slug?slug=${encodeURIComponent(slug)}`)
      
      setResult({
        exists: response.exists,
        isChecking: false,
        error: null
      })
    } catch (error) {
      setResult({
        exists: false,
        isChecking: false,
        error: error instanceof Error ? error.message : 'Failed to check slug'
      })
    }
  }, [api])

  const debouncedCheckSlug = useCallback((slug: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (!slug.trim()) {
      setResult({
        exists: false,
        isChecking: false,
        error: null
      })
      return
    }

    setResult(prev => ({
      ...prev,
      isChecking: true,
      error: null
    }))

    debounceTimeoutRef.current = setTimeout(() => {
      checkSlug(slug)
    }, 500) // 500ms debounce
  }, [checkSlug])

  const clearResult = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    setResult({
      exists: false,
      isChecking: false,
      error: null
    })
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return {
    checkSlug: debouncedCheckSlug,
    result,
    clearResult
  }
}