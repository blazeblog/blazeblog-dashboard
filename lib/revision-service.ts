"use client"

import { useClientApi, type PostRevision } from './client-api'

/**
 * Hook for working with post revisions
 * Provides methods to fetch, compare, and restore revisions
 */
export function useRevisionService() {
  const api = useClientApi()

  /**
   * Fetch all revisions for a specific post
   * @param postId - The ID of the post
   * @returns Promise<PostRevision[]> - Array of revisions ordered by version number (newest first)
   */
  const getPostRevisions = async (postId: string | number): Promise<PostRevision[]> => {
    return api.get<PostRevision[]>(`/posts/${postId}/revisions`)
  }

  /**
   * Fetch a specific revision by version number
   * @param postId - The ID of the post
   * @param versionNumber - The version number to fetch
   * @returns Promise<PostRevision> - The specific revision
   */
  const getRevision = async (postId: string | number, versionNumber: number): Promise<PostRevision> => {
    return api.get<PostRevision>(`/posts/${postId}/revisions/${versionNumber}`)
  }

  /**
   * Restore a post to a previous version
   * @param postId - The ID of the post
   * @param versionNumber - The version number to restore to
   * @returns Promise<any> - The updated post object
   */
  const restoreRevision = async (postId: string | number, versionNumber: number): Promise<any> => {
    return api.post(`/posts/${postId}/revisions/${versionNumber}/restore`)
  }

  /**
   * Compare two revisions and return differences
   * @param postId - The ID of the post
   * @param version1 - First version number
   * @param version2 - Second version number
   * @returns Promise<{revision1: PostRevision, revision2: PostRevision, differences: object}>
   */
  const compareRevisions = async (postId: string | number, version1: number, version2: number) => {
    const [revision1, revision2] = await Promise.all([
      getRevision(postId, version1),
      getRevision(postId, version2)
    ])
    
    const differences = {
      titleChanged: revision1.title !== revision2.title,
      contentChanged: revision1.content !== revision2.content,
      statusChanged: revision1.status !== revision2.status,
      categoryChanged: revision1.categoryId !== revision2.categoryId,
      excerptChanged: revision1.excerpt !== revision2.excerpt,
      metaTitleChanged: revision1.metaTitle !== revision2.metaTitle,
      metaDescriptionChanged: revision1.metaDescription !== revision2.metaDescription
    }
    
    return { revision1, revision2, differences }
  }

  /**
   * Get revision statistics for a post
   * @param revisions - Array of revisions
   * @returns Statistics object
   */
  const getRevisionStats = (revisions: PostRevision[]) => {
    const totalRevisions = revisions.length
    const publishedVersions = revisions.filter(r => r.isPublishedVersion).length
    const lastModified = revisions[0]?.createdAt
    const contributors = [...new Set(revisions.map(r => r.creator?.username).filter(Boolean))].length
    
    return {
      totalRevisions,
      publishedVersions,
      lastModified,
      contributors
    }
  }

  return {
    getPostRevisions,
    getRevision,
    restoreRevision,
    compareRevisions,
    getRevisionStats
  }
}

/**
 * Utility functions for working with revision content
 */
export class RevisionUtils {
  /**
   * Calculate word count difference between two revisions
   */
  static getWordCountDiff(content1: string, content2: string) {
    const words1 = content1.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length
    const words2 = content2.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length
    return words2 - words1
  }

  /**
   * Get character count difference between two revisions
   */
  static getCharCountDiff(content1: string, content2: string) {
    const chars1 = content1.replace(/<[^>]*>/g, '').length
    const chars2 = content2.replace(/<[^>]*>/g, '').length
    return chars2 - chars1
  }

  /**
   * Format revision timestamp for display
   */
  static formatTimestamp(timestamp: string) {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  /**
   * Extract plain text from HTML content
   */
  static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim()
  }

  /**
   * Truncate text to specified length
   */
  static truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }
}