"use client"

import { useAuth } from "@clerk/nextjs"
import type { PaginationParams, PaginatedResponse, Post, Category, Tag, PostRevision } from "./api"

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
  }
}

export type { PaginationParams, PaginatedResponse, Post, Category, Tag, PostRevision }