"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { draftDB, type DraftPost } from '@/lib/indexeddb'

interface UseAutoSaveOptions {
  postId?: string
  title: string
  content: string
  heroImage?: string
  categoryId?: string
  excerpt?: string
  status?: 'draft' | 'published' | 'archived' | 'scheduled'
  autoSaveInterval?: number
}

export function useAutoSave({
  postId = 'new',
  title,
  content,
  heroImage,
  categoryId,
  excerpt,
  status = 'draft',
  autoSaveInterval = 3000
}: UseAutoSaveOptions) {
  const { userId } = useAuth()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastContentRef = useRef('')

  const saveDraft = useCallback(async (force = false) => {
    if (!autoSaveEnabled && !force) return
    if (!title.trim() && !content.trim()) return
    
    const currentContent = JSON.stringify({ title, content, heroImage, categoryId, excerpt })
    if (currentContent === lastContentRef.current && !force) return

    setIsSaving(true)
    try {
      const draft: DraftPost = {
        id: postId,
        title,
        content,
        heroImage,
        categoryId,
        excerpt,
        status,
        lastSaved: Date.now(),
        userId: userId || undefined
      }

      await draftDB.saveDraft(draft)
      await draftDB.saveConnectivityStatus({
        online: isOnline,
        lastChecked: Date.now()
      })

      lastContentRef.current = currentContent
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setIsSaving(false)
    }
  }, [postId, title, content, heroImage, categoryId, excerpt, status, userId, autoSaveEnabled, isOnline])

  const loadDraft = useCallback(async (id: string): Promise<DraftPost | null> => {
    try {
      return await draftDB.getDraft(id)
    } catch (error) {
      console.error('Failed to load draft:', error)
      return null
    }
  }, [])

  const deleteDraft = useCallback(async (id: string) => {
    try {
      await draftDB.deleteDraft(id)
    } catch (error) {
      console.error('Failed to delete draft:', error)
    }
  }, [])

  const getAllDrafts = useCallback(async (): Promise<DraftPost[]> => {
    try {
      return await draftDB.getAllDrafts(userId || undefined)
    } catch (error) {
      console.error('Failed to get drafts:', error)
      return []
    }
  }, [userId])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      saveDraft(true)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      saveDraft(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [saveDraft])

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft()
    }, autoSaveInterval)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [title, content, heroImage, categoryId, excerpt, saveDraft, autoSaveInterval])

  const manualSave = useCallback(() => {
    saveDraft(true)
  }, [saveDraft])

  return {
    lastSaved,
    isSaving,
    isOnline,
    autoSaveEnabled,
    setAutoSaveEnabled,
    manualSave,
    loadDraft,
    deleteDraft,
    getAllDrafts
  }
}