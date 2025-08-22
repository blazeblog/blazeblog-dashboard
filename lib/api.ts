import { auth } from "@clerk/nextjs/server"

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  cache?: RequestCache
}

interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  // Post specific filters
  title?: string
  content?: string
  status?: 'draft' | 'published' | 'archived'
  userId?: number
  categoryId?: number
  tagIds?: number[]
  hasFeaturedImage?: boolean
  createdAfter?: string
  createdBefore?: string
  updatedAfter?: string
  updatedBefore?: string
  // Category specific filters
  name?: string
  slug?: string
  description?: string
  isActive?: boolean
  // Comment specific filters
  postId?: number
  isApproved?: boolean
  topLevelOnly?: boolean
  parentCommentId?: number
  // User specific filters
  username?: string
  email?: string
  firstName?: string
  lastName?: string
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

interface Post {
  id: number
  title: string
  content: string
  excerpt?: string
  status: 'draft' | 'published' | 'archived'
  featuredImage?: string
  userId: number
  categoryId?: number
  createdAt: string
  updatedAt: string
  user: {
    id: number
    username: string
    email: string
  }
  category?: {
    id: number
    name: string
    slug: string
  }
  tags?: {
    id: number
    name: string
    slug: string
  }[]
  relatedPosts?: {
    id: number
    relatedPostId: number
    sortOrder: number
    relatedPost: {
      id: number
      title: string
      slug: string | null
    }
  }[]
}

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  isActive: boolean
  sortOrder?: number
  createdAt: string
  postCount?: number
  posts?: {
    id: number
  }[]
}

interface Tag {
  id: number
  customerId: number
  name: string
  slug: string
  description?: string | null
  color?: string | null
  isActive: boolean
  postCount?: number
  createdAt: string
  updatedAt: string
  posts?: {
    id: number
    title: string
    status: string
    createdAt: string
  }[]
}

interface PostRevision {
  id: number
  postId: number
  versionNumber: number
  title: string
  content: string
  excerpt?: string
  status: 'draft' | 'published' | 'archived'
  categoryId?: number
  slug: string
  metaTitle?: string
  metaDescription?: string
  createdBy: number
  isPublishedVersion: boolean
  createdAt: string
  creator?: {
    id: number
    username: string
    email: string
  }
}

interface Comment {
  id: number
  content: string
  authorName: string
  authorEmail: string
  authorWebsite?: string
  postId: number
  parentCommentId?: number
  isApproved: boolean
  createdAt: string
  updatedAt: string
  post?: {
    id: number
    title: string
    slug: string
  }
  replies?: Comment[]
  replyCount?: number
}

interface User {
  id: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
  clerkUserId?: string
  customerId: number
  createdAt: string
  updatedAt: string
}

/**
 * Common API function with Clerk JWT authentication
 * @param endpoint - API endpoint (e.g., '/posts', '/users')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise with the API response data
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  try {
    const { getToken } = await auth()
    const token = await getToken()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    
    if (!apiUrl) {
      throw new Error('API URL not configured')
    }

    const {
      method = 'GET',
      body,
      headers = {},
      cache = 'no-store'
    } = options

    const config: RequestInit = {
      method,
      cache,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...headers,
      },
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(`${apiUrl}${endpoint}`, config)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

/**
 * Helper function to build query string from pagination params
 */
function buildQueryString(params: PaginationParams): string {
  const searchParams = new URLSearchParams()
  
  // Basic pagination params
  if (params.page !== undefined) searchParams.set('page', params.page.toString())
  if (params.limit !== undefined) searchParams.set('limit', params.limit.toString())
  if (params.search) searchParams.set('search', params.search)
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
  
  // Post specific filters
  if (params.title) searchParams.set('title', params.title)
  if (params.content) searchParams.set('content', params.content)
  if (params.status) searchParams.set('status', params.status)
  if (params.userId !== undefined) searchParams.set('userId', params.userId.toString())
  if (params.categoryId !== undefined) searchParams.set('categoryId', params.categoryId.toString())
  if (params.tagIds?.length) {
    params.tagIds.forEach(id => searchParams.append('tagIds', id.toString()))
  }
  if (params.hasFeaturedImage !== undefined) searchParams.set('hasFeaturedImage', params.hasFeaturedImage.toString())
  if (params.createdAfter) searchParams.set('createdAfter', params.createdAfter)
  if (params.createdBefore) searchParams.set('createdBefore', params.createdBefore)
  if (params.updatedAfter) searchParams.set('updatedAfter', params.updatedAfter)
  if (params.updatedBefore) searchParams.set('updatedBefore', params.updatedBefore)
  
  // Category specific filters
  if (params.name) searchParams.set('name', params.name)
  if (params.slug) searchParams.set('slug', params.slug)
  if (params.description) searchParams.set('description', params.description)
  if (params.isActive !== undefined) searchParams.set('isActive', params.isActive.toString())
  
  // Comment specific filters
  if (params.postId !== undefined) searchParams.set('postId', params.postId.toString())
  if (params.isApproved !== undefined) searchParams.set('isApproved', params.isApproved.toString())
  if (params.topLevelOnly !== undefined) searchParams.set('topLevelOnly', params.topLevelOnly.toString())
  if (params.parentCommentId !== undefined) searchParams.set('parentCommentId', params.parentCommentId.toString())
  
  // User specific filters
  if (params.username) searchParams.set('username', params.username)
  if (params.email) searchParams.set('email', params.email)
  if (params.firstName) searchParams.set('firstName', params.firstName)
  if (params.lastName) searchParams.set('lastName', params.lastName)
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    apiCall<T>(endpoint, { ...options, method: 'GET' }),
    
  getPaginated: <T = any>(endpoint: string, params: PaginationParams = {}, options?: Omit<ApiOptions, 'method'>) =>
    apiCall<PaginatedResponse<T>>(`${endpoint}${buildQueryString(params)}`, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, { ...options, method: 'POST', body }),
    
  put: <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, { ...options, method: 'PUT', body }),
    
  patch: <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiCall<T>(endpoint, { ...options, method: 'PATCH', body }),
    
  delete: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    apiCall<T>(endpoint, { ...options, method: 'DELETE' }),
}

// Export types for use in components
export type { PaginationParams, PaginatedResponse, Post, Category, Tag, PostRevision, Comment, User }
