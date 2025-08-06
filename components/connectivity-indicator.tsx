"use client"

import { Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConnectivityIndicatorProps {
  isOnline: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ConnectivityIndicator({ 
  isOnline, 
  className,
  size = 'sm' 
}: ConnectivityIndicatorProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div 
        className={cn(
          "rounded-full flex items-center justify-center",
          isOnline 
            ? "bg-green-500 text-white" 
            : "bg-red-500 text-white",
          size === 'sm' && "p-1",
          size === 'md' && "p-1.5",
          size === 'lg' && "p-2"
        )}
      >
        {isOnline ? (
          <Wifi className={sizeClasses[size]} />
        ) : (
          <WifiOff className={sizeClasses[size]} />
        )}
      </div>
      <span className={cn(
        "text-xs font-medium",
        isOnline ? "text-green-600" : "text-red-600"
      )}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  )
}