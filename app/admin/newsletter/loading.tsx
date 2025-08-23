import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              {index === 3 && <Skeleton className="h-3 w-20 mt-1" />}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <Skeleton className="h-10 w-32" />

      {/* Filters Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="min-w-[140px]">
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="min-w-[160px]">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 pb-2 border-b">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            
            {/* Table Rows */}
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="grid grid-cols-6 gap-4 py-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-20" />
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            <div className="flex justify-center mt-4">
              <Skeleton className="h-10 w-80" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}