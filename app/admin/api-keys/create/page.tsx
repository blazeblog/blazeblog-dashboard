"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClientApi } from "@/lib/client-api"
import { usePageTitle } from "@/hooks/use-page-title"
import type { CreateApiKeyDto } from "@/lib/client-api"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Key, Copy, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreateApiKeyResponse {
  message: string
  apiKey: string
  keyName: string
  expiresAt?: Date
}

export default function CreateApiKeyPage() {
  usePageTitle("Create API Key - BlazeBlog Admin")
  
  const router = useRouter()
  const { toast } = useToast()
  const api = useClientApi()
  const [formData, setFormData] = useState<CreateApiKeyDto>({
    keyName: '',
    rateLimitDaily: 1000,
    rateLimitPerMinute: 10,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null)

  const validateForm = () => {
    const errors: string[] = []
    
    if (!formData.keyName.trim()) {
      errors.push('API key name is required')
    } else if (formData.keyName.trim().length < 3) {
      errors.push('API key name must be at least 3 characters')
    } else if (formData.keyName.trim().length > 50) {
      errors.push('API key name must be less than 50 characters')
    }
    
    
    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt)
      const now = new Date()
      if (expiryDate <= now) {
        errors.push('Expiry date must be in the future')
      }
      
      const maxExpiry = new Date()
      maxExpiry.setFullYear(maxExpiry.getFullYear() + 5)
      if (expiryDate > maxExpiry) {
        errors.push('Expiry date cannot be more than 5 years in the future')
      }
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '))
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const payload: CreateApiKeyDto = {
        keyName: formData.keyName.trim(),
        rateLimitDaily: formData.rateLimitDaily,
        rateLimitPerMinute: formData.rateLimitPerMinute,
      }

      if (formData.expiresAt) {
        payload.expiresAt = formData.expiresAt
      }

      const response = await api.post<CreateApiKeyResponse>('/customer/api-keys', payload)
      setCreatedKey(response)
      
      toast({
        title: "Success",
        description: "API key created successfully",
        duration: 3000
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey)
      toast({
        title: "Copied",
        description: "API key copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy API key to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleBack = () => {
    router.push('/admin/api-keys')
  }

  if (createdKey) {
    return (
      <AdminLayout title="API Key Created">
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to API Keys
            </Button>
          </div>

          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800 dark:text-green-200">API Key Created Successfully</CardTitle>
              </div>
              <CardDescription className="text-green-700 dark:text-green-300">
                Your API key has been generated. Copy it now as you won't be able to see it again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-green-800 dark:text-green-200">Key Name</Label>
                <div className="mt-1 text-sm font-medium">{createdKey.keyName}</div>
              </div>
              
              <div>
                <Label className="text-green-800 dark:text-green-200">API Key</Label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="text-sm bg-background border px-3 py-2 rounded font-mono flex-1 break-all">
                    {createdKey.apiKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyKey(createdKey.apiKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {createdKey.expiresAt && (
                <div>
                  <Label className="text-green-800 dark:text-green-200">Expires</Label>
                  <div className="mt-1 text-sm">{new Date(createdKey.expiresAt).toLocaleString()}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This is the only time you'll see this API key. 
              Copy it and store it securely. If you lose it, you'll need to create a new one.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Create API Key">
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to API Keys
          </Button>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create API Key</h2>
          <p className="text-muted-foreground">Generate a new API key for programmatic access to your blog</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Key Configuration</CardTitle>
            <CardDescription>Configure your new API key settings and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name *</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Mobile App, Website Integration, Data Analytics"
                  value={formData.keyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyName: e.target.value }))}
                  required
                  minLength={3}
                  maxLength={50}
                  pattern="[a-zA-Z0-9\s\-_]+"
                />
                <p className="text-sm text-muted-foreground">
                  A descriptive name to help you identify this key (3-50 characters, alphanumeric only)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty for a key that never expires
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Notice:</strong> API keys provide full access to your account. 
                  Keep them secure and never share them in public repositories or client-side code.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading || !formData.keyName.trim()}>
                  {loading ? 'Creating...' : 'Create API Key'}
                </Button>
                <Button type="button" variant="outline" onClick={handleBack}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}