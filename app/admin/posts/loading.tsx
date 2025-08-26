import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <AdminLayout title="Posts">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Filters Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full md:w-[180px]" />
              <Skeleton className="h-10 w-full md:w-[180px]" />
              <Skeleton className="h-10 w-20" />
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Table Header */}
              <div className="flex space-x-4 py-2 border-b">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              
              {/* Table Rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-4 py-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            
            {/* Pagination Skeleton */}
            <div className="flex justify-center mt-6">
              <Skeleton className="h-10 w-64" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
