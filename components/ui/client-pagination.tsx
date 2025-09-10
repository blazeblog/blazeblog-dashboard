"use client"

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

interface ClientPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  loading?: boolean
}

export function ClientPagination({ pagination, onPageChange, loading = false }: ClientPaginationProps) {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t">
      <div className="text-sm text-muted-foreground">
        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
        {pagination.total} results
      </div>
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasPreviousPage || loading}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Page Numbers */}
        {(() => {
          const pages = []
          const current = pagination.page
          const total = pagination.totalPages
          
          if (total <= 7) {
            // Show all pages if there are 7 or fewer
            for (let i = 1; i <= total; i++) {
              pages.push(
                <Button
                  key={i}
                  variant={current === i ? "default" : "outline"}
                  size="sm"
                  disabled={loading}
                  onClick={() => onPageChange(i)}
                  className="min-w-[32px]"
                >
                  {i}
                </Button>
              )
            }
          } else {
            // Complex pagination for many pages
            // Always show first page
            pages.push(
              <Button
                key={1}
                variant={current === 1 ? "default" : "outline"}
                size="sm"
                disabled={loading}
                onClick={() => onPageChange(1)}
                className="min-w-[32px]"
              >
                1
              </Button>
            )
            
            // Show ellipsis if needed
            if (current > 4) {
              pages.push(<span key="ellipsis1" className="px-2 text-muted-foreground">...</span>)
            }
            
            // Show pages around current page
            const start = Math.max(2, current - 1)
            const end = Math.min(total - 1, current + 1)
            
            for (let i = start; i <= end; i++) {
              if (i > 1 && i < total) {
                pages.push(
                  <Button
                    key={i}
                    variant={current === i ? "default" : "outline"}
                    size="sm"
                    disabled={loading}
                    onClick={() => onPageChange(i)}
                    className="min-w-[32px]"
                  >
                    {i}
                  </Button>
                )
              }
            }
            
            // Show ellipsis if needed
            if (current < total - 3) {
              pages.push(<span key="ellipsis2" className="px-2 text-muted-foreground">...</span>)
            }
            
            // Always show last page
            if (total > 1) {
              pages.push(
                <Button
                  key={total}
                  variant={current === total ? "default" : "outline"}
                  size="sm"
                  disabled={loading}
                  onClick={() => onPageChange(total)}
                  className="min-w-[32px]"
                >
                  {total}
                </Button>
              )
            }
          }
          
          return pages
        })()}
        
        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasNextPage || loading}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}