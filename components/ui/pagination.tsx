"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface PaginationProps {
  pagination: PaginationInfo
  baseUrl: string
  searchParams?: Record<string, string>
}

export function Pagination({ pagination, baseUrl, searchParams = {} }: PaginationProps) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    return `${baseUrl}?${params.toString()}`
  }

  const getVisiblePages = () => {
    const pages = []
    const { page, totalPages } = pagination
    
    // Always show first page
    if (totalPages > 0) pages.push(1)
    
    // Show pages around current page
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      if (!pages.includes(i)) pages.push(i)
    }
    
    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages)
    }
    
    return pages.sort((a, b) => a - b)
  }

  if (pagination.totalPages <= 1) return null

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
        {pagination.total} results
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasPreviousPage}
          asChild
        >
          <Link href={buildUrl(pagination.page - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        </Button>
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <div key={page} className="flex items-center">
              {index > 0 && visiblePages[index - 1] !== page - 1 && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
              <Button
                variant={page === pagination.page ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={buildUrl(page)}>
                  {page}
                </Link>
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasNextPage}
          asChild
        >
          <Link href={buildUrl(pagination.page + 1)}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}