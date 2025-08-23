import { Card, CardContent } from "@/components/ui/card"

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-primary mx-auto"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-transparent border-t-primary/20 mx-auto"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{message}</h3>
          <p className="text-muted-foreground">Fetching your latest data...</p>
        </div>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
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