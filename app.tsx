"use client"

import { useEffect } from "react"

export default function App() {
  useEffect(() => {
    // Redirect to admin dashboard
    if (typeof window !== "undefined") {
      window.location.href = "/admin"
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
        <div className="space-y-2">
          <a href="/admin" className="block text-primary hover:underline">
            → Go to Dashboard
          </a>
          <a href="/admin/posts" className="block text-primary hover:underline">
            → Manage Posts
          </a>
        </div>
      </div>
    </div>
  )
}
