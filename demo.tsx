"use client"

import { ThemeProvider } from "./components/theme-provider"
import Dashboard from "./pages/dashboard"

export default function Demo() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="admin-ui-theme">
      <div className="min-h-screen bg-background">
        <Dashboard />
      </div>
    </ThemeProvider>
  )
}
