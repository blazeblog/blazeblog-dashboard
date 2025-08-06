import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  showRetry?: boolean
}

export function ErrorState({ 
  message = "Something went wrong", 
  onRetry,
  showRetry = true 
}: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Error</h3>
            <p className="text-muted-foreground">{message}</p>
          </div>
          {showRetry && onRetry && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ErrorAlertProps {
  message: string
  onClose?: () => void
}

export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span>{message}</span>
      </div>
      {onClose && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="h-auto p-1 text-destructive hover:text-destructive"
        >
          ×
        </Button>
      )}
    </div>
  )
}