"use client"

import { useAuth } from "@clerk/nextjs"
import type { PaginationParams, PaginatedResponse, Post, Category, Tag, PostRevision, Comment, User } from "./api"

// Form-related types based on Forms API documentation
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'phone' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'number' 
  | 'rating'

export interface Field {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  fieldOrder: number
  stepId: string
}

export interface Step {
  id: string
  title: string
  description?: string
  stepOrder: number
  formId: string
  fields: Field[]
}

export interface Form {
  id: string
  name: string
  description?: string
  isMultiStep: boolean
  status: 'active' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
  steps: Step[]
  submissions?: Submission[]
}

export interface Submission {
  id: string
  formId: string
  data: Record<string, any>
  submittedAt: string
  createdAt: string
  updatedAt: string
}

export interface FormStats {
  totalSubmissions: number
  conversionRate: number
  averageCompletionTime?: number
  lastSubmissionAt?: string
}

// Related Posts types
export interface RelatedPost {
  id: number
  postId: number
  relatedPostId: number
  sortOrder: number
  createdAt?: string
  updatedAt?: string
  relatedPost?: Post
  post?: Post
}

export interface CreateRelatedPostRequest {
  postId: number
  relatedPostId: number
  sortOrder: number
}

export interface BulkCreateRelatedPostsRequest {
  postId: number
  relatedPostIds: number[]
}

export interface UpdateRelatedPostRequest {
  sortOrder: number
}

export interface ReorderRelatedPostsRequest {
  relatedPostIds: number[]
}

// Newsletter types
export interface Newsletter {
  id: number
  customerId: number
  email: string
  name?: string
  company?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface NewsletterStats {
  totalSubscriptions: number
  activeSubscriptions: number
  inactiveSubscriptions: number
  recentSubscriptions: number
}

export interface CreateNewsletterRequest {
  email: string
  name?: string
  company?: string
}

export interface UpdateNewsletterRequest {
  email?: string
  name?: string
  company?: string
  isActive?: boolean
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  cache?: RequestCache
}

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

async function clientApiCall<T = any>(
  token: string | null,
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  try {
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
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...headers,
      },
    }

    // Only set Content-Type for JSON if it's not already set (allows FormData to set its own)
    if (!headers['Content-Type'] && !(body instanceof FormData)) {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      }
    }

    if (body && method !== 'GET') {
      config.body = body instanceof FormData ? body : JSON.stringify(body)
    }

    const response = await fetch(`${apiUrl}${endpoint}`, config)
    
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`
      let errorData = null
      
      try {
        errorData = await response.json()
        console.log('API Error Response:', errorData)
        
        if (errorData.message) {
          if (Array.isArray(errorData.message)) {
            // Handle validation errors array
            errorMessage = errorData.message.join(', ')
          } else if (typeof errorData.message === 'string') {
            // Handle single error message
            errorMessage = errorData.message
          }
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
        
        console.log('Formatted error message:', errorMessage)
      } catch (parseError) {
        // If can't parse JSON, use default error message
        console.warn('Could not parse error response:', parseError)
      }
      
      const error = new Error(errorMessage)
      ;(error as any).status = response.status
      ;(error as any).statusText = response.statusText
      ;(error as any).responseData = errorData
      throw error
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

export function useClientApi() {
  const { getToken } = useAuth()

  const makeRequest = async <T = any>(endpoint: string, options: ApiOptions = {}) => {
    const token = await getToken()
    return clientApiCall<T>(token, endpoint, options)
  }

  return {
    get: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
      makeRequest<T>(endpoint, { ...options, method: 'GET' }),
      
    getPaginated: <T = any>(endpoint: string, params: PaginationParams = {}, options?: Omit<ApiOptions, 'method'>) =>
      makeRequest<PaginatedResponse<T>>(`${endpoint}${buildQueryString(params)}`, { ...options, method: 'GET' }),
      
    post: <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
      makeRequest<T>(endpoint, { ...options, method: 'POST', body }),
      
    put: <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
      makeRequest<T>(endpoint, { ...options, method: 'PUT', body }),
      
    patch: <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
      makeRequest<T>(endpoint, { ...options, method: 'PATCH', body }),
      
    delete: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
      makeRequest<T>(endpoint, { ...options, method: 'DELETE' }),

    // Related Posts API methods
    relatedPosts: {
      // Create single related post relation
      create: (data: CreateRelatedPostRequest) =>
        makeRequest<RelatedPost>('/related-posts', { method: 'POST', body: data }),
      
      // Bulk create related posts
      bulkCreate: (data: BulkCreateRelatedPostsRequest) =>
        makeRequest<RelatedPost[]>('/related-posts/bulk', { method: 'POST', body: data }),
      
      // Get related posts for a specific post
      getRelatedPosts: (postId: number, includePosts: boolean = true) =>
        makeRequest<RelatedPost[]>(`/related-posts/post/${postId}?includePosts=${includePosts}`),
      
      // Get posts that reference this post
      getReferencedBy: (relatedPostId: number, includePosts: boolean = true) =>
        makeRequest<RelatedPost[]>(`/related-posts/referenced-by/${relatedPostId}?includePosts=${includePosts}`),
      
      // Update related post (sort order)
      update: (id: number, data: UpdateRelatedPostRequest) =>
        makeRequest<RelatedPost>(`/related-posts/${id}`, { method: 'PUT', body: data }),
      
      // Reorder related posts
      reorder: (postId: number, data: ReorderRelatedPostsRequest) =>
        makeRequest<RelatedPost[]>(`/related-posts/post/${postId}/reorder`, { method: 'PUT', body: data }),
      
      // Delete specific relation
      delete: (id: number) =>
        makeRequest<void>(`/related-posts/${id}`, { method: 'DELETE' }),
      
      // Delete all relations for a post
      deleteAll: (postId: number) =>
        makeRequest<{ deleted: number }>(`/related-posts/post/${postId}/all`, { method: 'DELETE' }),
    },

    // Newsletter API methods
    newsletter: {
      // Create newsletter subscription
      create: (data: CreateNewsletterRequest) =>
        makeRequest<Newsletter>('/newsletters', { method: 'POST', body: data }),
      
      // Get all newsletters with pagination and filters
      getAll: (params: PaginationParams = {}) =>
        makeRequest<PaginatedResponse<Newsletter>>(`/newsletters${buildQueryString(params)}`),
      
      // Get newsletter by ID
      getById: (id: number) =>
        makeRequest<Newsletter>(`/newsletters/${id}`),
      
      // Update newsletter
      update: (id: number, data: UpdateNewsletterRequest) =>
        makeRequest<Newsletter>(`/newsletters/${id}`, { method: 'PUT', body: data }),
      
      // Delete newsletter
      delete: (id: number) =>
        makeRequest<void>(`/newsletters/${id}`, { method: 'DELETE' }),
      
      // Get newsletter statistics
      getStats: () =>
        makeRequest<{ data: NewsletterStats }>('/newsletters/stats/overview'),
    },
  }
}

export type { PaginationParams, PaginatedResponse, Post, Category, Tag, PostRevision, Comment, User }