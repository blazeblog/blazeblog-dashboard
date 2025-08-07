"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  EyeOff, 
  Focus,
  Maximize,
  Minimize,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FocusModeToggleProps {
  isFocusMode: boolean
  onToggle: (enabled: boolean) => void
  className?: string
  variant?: "button" | "switch" | "badge"
  showLabel?: boolean
}

export function FocusModeToggle({
  isFocusMode,
  onToggle,
  className,
  variant = "button",
  showLabel = true
}: FocusModeToggleProps) {
  const handleToggle = () => {
    onToggle(!isFocusMode)
  }

  if (variant === "switch") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Focus className="h-4 w-4 text-muted-foreground" />
        {showLabel && (
          <label htmlFor="focus-mode" className="text-sm font-medium cursor-pointer">
            Focus Mode
          </label>
        )}
        <Switch
          id="focus-mode"
          checked={isFocusMode}
          onCheckedChange={onToggle}
          className="ml-auto"
        />
      </div>
    )
  }

  if (variant === "badge") {
    return (
      <Badge
        variant={isFocusMode ? "default" : "outline"}
        className={cn(
          "cursor-pointer transition-all hover:scale-105 select-none",
          isFocusMode && "bg-blue-600 text-white",
          className
        )}
        onClick={handleToggle}
      >
        <Focus className="h-3 w-3 mr-1" />
        {isFocusMode ? "Focus On" : "Focus Mode"}
      </Badge>
    )
  }

  // Default button variant
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isFocusMode ? "default" : "outline"}
          size="sm"
          onClick={handleToggle}
          className={cn(
            "transition-all",
            isFocusMode && "bg-blue-600 hover:bg-blue-700 text-white",
            className
          )}
        >
          {isFocusMode ? (
            <>
              <EyeOff className="h-4 w-4 mr-1" />
              {showLabel && "Exit Focus"}
            </>
          ) : (
            <>
              <Focus className="h-4 w-4 mr-1" />
              {showLabel && "Focus Mode"}
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {isFocusMode 
            ? "Exit focus mode to show sidebar and distractions"
            : "Enter focus mode to hide distractions and focus on writing"
          }
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

interface FocusModeContextProps {
  isFocusMode: boolean
  children: React.ReactNode
  className?: string
}

export function FocusModeContext({
  isFocusMode,
  children,
  className
}: FocusModeContextProps) {
  return (
    <div 
      className={cn(
        "transition-all duration-300 ease-in-out",
        isFocusMode && [
          "focus-mode",
          // Hide common UI elements in focus mode
          "[&_.sidebar]:hidden",
          "[&_.nav]:opacity-30", 
          "[&_.breadcrumb]:hidden",
          "[&_.toolbar]:opacity-50",
          "[&_.stats]:hidden",
          "[&_.suggestions]:hidden",
          "[&_.distractions]:hidden",
          // Center content and adjust spacing
          "max-w-4xl mx-auto px-4",
        ],
        className
      )}
      data-focus-mode={isFocusMode}
    >
      {children}
    </div>
  )
}

// Hook for managing focus mode state
export function useFocusMode(initialState = false) {
  const [isFocusMode, setIsFocusMode] = React.useState(initialState)

  // Keyboard shortcut for focus mode (F11 or Cmd/Ctrl + K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F11 key
      if (e.key === "F11") {
        e.preventDefault()
        setIsFocusMode(prev => !prev)
      }
      // Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsFocusMode(prev => !prev)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Save focus mode preference
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("focus-mode", JSON.stringify(isFocusMode))
    }
  }, [isFocusMode])

  // Load focus mode preference
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("focus-mode")
      if (saved) {
        try {
          setIsFocusMode(JSON.parse(saved))
        } catch {
          // Ignore invalid JSON
        }
      }
    }
  }, [])

  return {
    isFocusMode,
    toggleFocusMode: () => setIsFocusMode(prev => !prev),
    enableFocusMode: () => setIsFocusMode(true),
    disableFocusMode: () => setIsFocusMode(false),
    setFocusMode: setIsFocusMode
  }
}