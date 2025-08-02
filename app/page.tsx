"use client"

import { useEffect } from "react"

export default function HomePage() {
  useEffect(() => {
    // Redirect to admin dashboard
    window.location.href = "/admin"
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Admin Panel...</h1>
        <p className="text-muted-foreground">
          If you're not redirected automatically,{" "}
          <a href="/admin" className="text-primary underline">
            click here
          </a>
        </p>
      </div>
    </div>
  )
}
