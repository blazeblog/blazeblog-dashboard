"use client"

import { useUser, UserButton } from "@clerk/nextjs"
import type React from "react"
import { useState } from "react"
import { Search, RefreshCw, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "./admin-sidebar"
import { ThemeToggle } from "./theme-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import { OnboardingRedirect } from "./onboarding-redirect"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useClientApi } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AdminLayout({ children, title = "Dashboard" }: AdminLayoutProps) {
  const { user, isLoaded } = useUser()
  const api = useClientApi()
  const { toast } = useToast()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearCache = async () => {
    try {
      setIsClearing(true)
      await api.post('/customer/clear-cache')
      
      toast({
        title: "Cache Cleared Successfully! ✨",
        description: "Your website cache has been cleared. Changes should be visible within a few minutes.",
        duration: 5000
      })
    } catch (error) {
      console.error('Error clearing cache:', error)
      toast({
        title: "Cache Clear Failed",
        description: "Failed to clear cache. Please try again or contact support if the issue persists.",
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsClearing(false)
    }
  }

  const getTimeBasedGreeting = () => {
    const now = new Date()
    const hour = now.getHours()
    const greetings = {
      morning: ["Good morning", "Happy morning", "Lovely morning", "Beautiful morning"],
      afternoon: ["Good afternoon", "Happy afternoon", "Wonderful afternoon", "Pleasant afternoon"],
      evening: ["Good evening", "Happy evening", "Lovely evening", "Peaceful evening"],
      night: ["Working late", "Burning the midnight oil", "Night owl mode", "Late night warrior"]
    }

    let timeOfDay: keyof typeof greetings
    if (hour >= 5 && hour < 12) {
      timeOfDay = "morning"
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = "afternoon"
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = "evening"
    } else {
      timeOfDay = "night"
    }

    const greetingArray = greetings[timeOfDay]
    // Use date and user ID to create consistent but varied greetings
    const today = now.toDateString()
    const userId = user?.id || ''
    const seed = today + userId + timeOfDay
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    const index = Math.abs(hash) % greetingArray.length
    return greetingArray[index]
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  return (
    <OnboardingRedirect>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center gap-2">
              <h1 className="text-lg font-semibold">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="w-[200px] pl-8 md:w-[300px]" />
              </div> */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-4 w-4" />
              </Button>
              {/* <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button> */}
              
              {/* Clear Cache Button with Tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleClearCache}
                      disabled={isClearing}
                    >
                      <RefreshCw className={`h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="flex items-start gap-2 p-2">
                      <Info className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-medium text-sm">Clear Website Cache</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Clears your website's cache so visitors see the latest changes. 
                          Use this after making updates to ensure they're visible immediately.
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <ThemeToggle />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                    userButtonPopoverCard: "bg-background border",
                    userButtonPopoverActionButton: "text-foreground hover:bg-accent",
                  },
                }}
              />
            </div>
          </header>
          <main className="flex-1 space-y-4 p-4 md:p-6">
            {user && title === "Dashboard" && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                  {getTimeBasedGreeting()}, {user.firstName || user.emailAddresses[0]?.emailAddress}!
                </h2>
              </div>
            )}
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </OnboardingRedirect>
  )
}
