"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useOnboarding } from "@/hooks/use-onboarding"
import { OnboardingOverlay } from "./onboarding-overlay"

interface OnboardingRedirectProps {
  children: React.ReactNode
}

export function OnboardingRedirect({ children }: OnboardingRedirectProps) {
  const { isSignedIn, user, isLoaded } = useUser()
  const { isOnboarded, isLoading } = useOnboarding()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Show loading state while checking authentication and onboarding status
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is signed in but not onboarded, show the overlay
  const shouldShowOnboarding = isSignedIn && !isOnboarded

  return (
    <>
      {children}
      <OnboardingOverlay 
        isOpen={shouldShowOnboarding || showOnboarding} 
        onClose={() => setShowOnboarding(false)}
        isRequired={shouldShowOnboarding}
      />
    </>
  )
}