"use client"

import { useUser, UserButton } from "@clerk/nextjs"
import type React from "react"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "./admin-sidebar"
import { ThemeToggle } from "./theme-toggle"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AdminLayout({ children, title = "Dashboard" }: AdminLayoutProps) {
  const { user, isLoaded } = useUser()

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
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
    const randomIndex = Math.floor(Math.random() * greetingArray.length)
    return greetingArray[randomIndex]
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
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="w-[200px] pl-8 md:w-[300px]" />
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
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
          {user && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">
                {getTimeBasedGreeting()}, {user.firstName || user.emailAddresses[0]?.emailAddress}!
              </h2>
              <p className="text-muted-foreground">Here's what's happening with your admin panel today.</p>
            </div>
          )}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
