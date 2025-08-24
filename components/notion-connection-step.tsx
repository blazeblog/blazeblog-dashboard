"use client"

import { useState } from "react"
import { useClientApi } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { 
  CheckCircle, 
  Key, 
  Loader2,
  AlertCircle,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NotionConnectionStepProps {
  onTokenValidated: (token: string, workspaceName?: string) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  existingWorkspaceName?: string
}

export function NotionConnectionStep({ 
  onTokenValidated, 
  loading, 
  setLoading,
  existingWorkspaceName 
}: NotionConnectionStepProps) {
  const api = useClientApi()
  const { toast } = useToast()
  
  const [token, setToken] = useState("")
  const [isValidated, setIsValidated] = useState(false)
  const [workspaceName, setWorkspaceName] = useState<string | undefined>()

  const validateToken = async () => {
    if (!token.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your Notion API token",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await api.notion.testToken(token)
      
      if (result.success) {
        setIsValidated(true)
        setWorkspaceName(result.workspaceName)
        onTokenValidated(token, result.workspaceName)
        
        toast({
          title: "Token Validated",
          description: result.workspaceName 
            ? `Connected to ${result.workspaceName}` 
            : "Notion token is valid",
        })
      } else {
        toast({
          title: "Invalid Token",
          description: "The provided Notion API token is invalid",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      toast({
        title: "Validation Failed",
        description: "Failed to validate token. Please check your token and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isValidated) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Token Validated Successfully!</h3>
          <p className="text-muted-foreground">
            Your Notion API token is valid and ready to use.
          </p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Token Status:</span>
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Valid
                </span>
              </div>
              {workspaceName && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Workspace:</span>
                  <span className="text-sm text-muted-foreground">
                    {workspaceName}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium">Token:</span>
                <span className="text-sm text-muted-foreground font-mono">
                  {token.substring(0, 12)}...
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Key className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {existingWorkspaceName ? "Re-enter Your Notion API Token" : "Enter Your Notion API Token"}
        </h3>
        <p className="text-muted-foreground">
          {existingWorkspaceName 
            ? `Continue setting up your integration with ${existingWorkspaceName}` 
            : "Provide your Notion API token to connect your workspace with Blazeblog."
          }
        </p>
      </div>

      {existingWorkspaceName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              Continuing setup for workspace: <strong>{existingWorkspaceName}</strong>
            </p>
          </div>
        </div>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You can create a Notion API token at{" "}
          <a 
            href="https://www.notion.so/my-integrations" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            notion.so/my-integrations
          </a>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notion-token">Notion API Token</Label>
          <Input
            id="notion-token"
            type="password"
            placeholder="secret_..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3">How to get your Notion API token:</h4>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="bg-muted rounded-full w-4 h-4 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Visit <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="underline">notion.so/my-integrations</a></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-muted rounded-full w-4 h-4 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Click "Create new integration"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-muted rounded-full w-4 h-4 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Copy your "Internal Integration Secret"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-muted rounded-full w-4 h-4 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <span>Share your databases with your integration</span>
            </li>
          </ol>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={validateToken}
            disabled={loading || !token.trim()}
            size="lg"
            className="px-8"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Key className="h-4 w-4 mr-2" />
            Validate Token
          </Button>
        </div>
      </div>
    </div>
  )
}