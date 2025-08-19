"use client"

import { Clock, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface AutoSaveIndicatorProps {
  lastSaved: Date | null
  isSaving: boolean
  autoSaveEnabled: boolean
  className?: string
}

export function AutoSaveIndicator({ 
  lastSaved, 
  isSaving, 
  autoSaveEnabled,
  className 
}: AutoSaveIndicatorProps) {
  const getStatus = () => {
    if (!autoSaveEnabled) {
      return {
        icon: AlertCircle,
        text: 'Auto-save disabled',
        variant: 'secondary' as const,
        color: 'text-gray-600'
      }
    }
    
    if (isSaving) {
      return {
        icon: Save,
        text: 'Saving...',
        variant: 'outline' as const,
        color: 'text-blue-600'
      }
    }
    
    if (lastSaved) {
      return {
        icon: CheckCircle,
        text: `Saved ${formatDistanceToNow(lastSaved)} ago`,
        variant: 'outline' as const,
        color: 'text-green-600'
      }
    }
    
    return {
      icon: Clock,
      text: 'Not saved',
      variant: 'outline' as const,
      color: 'text-yellow-600'
    }
  }

  const status = getStatus()
  const Icon = status.icon

  return (
    <Badge 
      variant={status.variant} 
      className={cn("text-xs flex items-center gap-1", className)}
    >
      <Icon className={cn("h-3 w-3", status.color)} />
      <span className={status.color}>{status.text}</span>
    </Badge>
  )
}