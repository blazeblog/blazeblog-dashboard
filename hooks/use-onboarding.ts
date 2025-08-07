"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"

interface OnboardingStatus {
  isOnboarded: boolean
  isLoading: boolean
  hasCompletedOnboarding: () => void
}

export function useOnboarding(): OnboardingStatus {
  const { user, isLoaded } = useUser()
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

  const hasCompletedOnboarding = () => {
    if (user) {
      // Mark onboarding as completed in localStorage (temporary)
      localStorage.setItem(`onboarding_${user.id}`, 'true')
      
      // In production, you would also update the user's metadata via your API
      // and sync with your database
      setIsOnboarded(true)
    }
  }

  return {
    isOnboarded,
    isLoading: isLoading || !isLoaded,
    hasCompletedOnboarding
  }
}