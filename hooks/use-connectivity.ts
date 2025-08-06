"use client"

import { useState, useEffect } from 'react'
import { draftDB, type ConnectivityStatus } from '@/lib/indexeddb'

export function useConnectivity() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine
    }
    return true
  })
  const [lastChecked, setLastChecked] = useState(Date.now())

  useEffect(() => {
    const updateOnlineStatus = async (online: boolean) => {
      setIsOnline(online)
      setLastChecked(Date.now())
      
      // Save connectivity status to IndexedDB
      try {
        await draftDB.saveConnectivityStatus({
          online,
          lastChecked: Date.now()
        })
      } catch (error) {
        console.error('Failed to save connectivity status:', error)
      }
    }

    const handleOnline = () => updateOnlineStatus(true)
    const handleOffline = () => updateOnlineStatus(false)

    // Set initial status
    updateOnlineStatus(navigator.onLine)

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check connectivity periodically (every 30 seconds)
    const intervalId = setInterval(() => {
      updateOnlineStatus(navigator.onLine)
    }, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(intervalId)
    }
  }, [])

  return {
    isOnline,
    lastChecked
  }
}
