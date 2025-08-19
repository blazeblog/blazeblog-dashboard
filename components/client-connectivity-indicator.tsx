"use client"

import { useConnectivity } from '@/hooks/use-connectivity'
import { ConnectivityIndicator } from '@/components/connectivity-indicator'

interface ClientConnectivityIndicatorProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ClientConnectivityIndicator({ 
  className, 
  size = 'sm' 
}: ClientConnectivityIndicatorProps) {
  const { isOnline } = useConnectivity()
  
  return (
    <ConnectivityIndicator 
      isOnline={isOnline} 
      className={className} 
      size={size} 
    />
  )
}
