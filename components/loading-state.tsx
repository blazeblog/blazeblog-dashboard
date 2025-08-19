import { Card, CardContent } from "@/components/ui/card"

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function TableLoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index} className="border-b">
          {Array.from({ length: 6 }).map((_, cellIndex) => (
            <td key={cellIndex} className="p-4">
              <div className="h-4 bg-muted animate-pulse rounded"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}