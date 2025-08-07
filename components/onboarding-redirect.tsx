"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useOnboarding } from "@/hooks/use-onboarding"

interface OnboardingRedirectProps {
  children: React.ReactNode
}

export function OnboardingRedirect({ children }: OnboardingRedirectProps) {
  const router = useRouter()
  const { isSignedIn, user, isLoaded } = useUser()
  const { isOnboarded, isLoading } = useOnboarding()

  useEffect(() => {
    // Wait for both Clerk and onboarding status to load
    if (!isLoaded || isLoading) return

    // If user is signed in but hasn't completed onboarding, redirect to onboarding
    if (isSignedIn && !isOnboarded) {
      router.push("/onboarding")
    }
  }, [isSignedIn, isOnboarded, isLoaded, isLoading, router])

  // Show loading state while checking authentication and onboarding status
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is signed in but not onboarded, don't render children (redirect will happen)
  if (isSignedIn && !isOnboarded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to onboarding...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}