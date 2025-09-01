"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { usePageTitle } from "@/hooks/use-page-title"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Globe, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Copy,
  Cloud,
  Loader2,
  RefreshCw,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useClientApi, type CustomHostname, type CustomHostnameStatus, type CreateCustomHostnameRequest } from "@/lib/client-api"

export default function CustomDomainPage() {
  usePageTitle("Custom Domain - BlazeBlog Admin")
  const [domain, setDomain] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [customHostnames, setCustomHostnames] = useState<CustomHostname[]>([])
  const [isPolling, setIsPolling] = useState(false)
  const [domainError, setDomainError] = useState("")
  const [activeTab, setActiveTab] = useState("setup")
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, hostname: '', domainToDelete: '' })
  const [deleteInput, setDeleteInput] = useState('')
  const { toast } = useToast()
  const api = useClientApi()

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    return domainRegex.test(domain)
  }

  const fetchCustomHostnames = useCallback(async () => {
    try {
      console.log('Fetching custom hostnames from /cf/hostnames...')
      const response = await api.get('/cf/hostnames')
      console.log('Raw API response:', response)
      
      // Handle the actual API response format: {hasCustomDomain, isVerified, currentDomain}
      let list: CustomHostname[] = []
      
      if (response && response.hasCustomDomain && response.currentDomain) {
        // Convert the response to CustomHostname format for display
        const mockHostname: CustomHostname = {
          id: 'current-domain',
          hostname: response.currentDomain,
          status: response.isVerified ? 'active' : 'pending',
          ssl_status: response.isVerified ? 'active' : 'pending_validation',
          success: true,
          txtRecord: {
            name: '@',
            value: 'verification-pending'
          },
          cnameRecord: {
            name: '@',
            value: 'target-pending'
          }
        }
        list = [mockHostname]
      }
      
      console.log('Processed hostnames list:', list)
      setCustomHostnames(list)
      return list
    } catch (error) {
      console.error('Failed to fetch custom hostnames:', error)
      setCustomHostnames([])
      return [] as CustomHostname[]
    }
  }, [api])

  const pollHostnameStatus = useCallback(async (hostnameId: string) => {
    try {
      const response = await api.get<CustomHostnameStatus>(`/cf/hostnames/${hostnameId}/status`)
      
      setCustomHostnames(prev => prev.map(hostname => 
        hostname.id === hostnameId 
          ? { ...hostname, status: response.status, ssl_status: response.ssl_status }
          : hostname
      ))

      if (response.status === 'active' && response.ssl_status === 'active') {
        setIsPolling(false)
        toast({
          title: "Domain Active!",
          description: "Your custom domain is now fully configured and active.",
        })
      } else if (response.status === 'pending_deletion' || response.status === 'deleted') {
        setIsPolling(false)
      }
    } catch (error) {
      console.error('Failed to poll hostname status:', error)
    }
  }, [api, toast])

  // Fetch existing hostnames once on mount and prime UI state (guard StrictMode double-invoke)
  const didInitRef = useRef(false)
  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true
    fetchCustomHostnames()
  }, [fetchCustomHostnames])

  // Single timer-based polling loop; avoids duplicate intervals and respects tab/visibility
  const pollTimerRef = useRef<number | null>(null)
  const hostnamesRef = useRef<CustomHostname[]>([])
  const pollFnRef = useRef(pollHostnameStatus)
  useEffect(() => { hostnamesRef.current = customHostnames }, [customHostnames])
  useEffect(() => { pollFnRef.current = pollHostnameStatus }, [pollHostnameStatus])

  useEffect(() => {
    const pollIntervalMs = 10000
    const canPoll = isPolling && activeTab === 'domains' && typeof document !== 'undefined' && document.visibilityState === 'visible'
    
    if (!canPoll) {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current)
        pollTimerRef.current = null
      }
      return
    }

    const schedule = () => {
      pollTimerRef.current = window.setTimeout(async () => {
        const pending = hostnamesRef.current.filter(h => h.status === 'pending' || h.ssl_status !== 'active')
        if (pending.length === 0) {
          setIsPolling(false)
          pollTimerRef.current = null
          return
        }
        // Fire one round of status checks
        await Promise.all(pending.map(h => pollFnRef.current(h.id)))
        schedule()
      }, pollIntervalMs)
    }

    schedule()
    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [isPolling, activeTab])

  // After initial fetch, surface the correct tab and kick off polling if needed
  useEffect(() => {
    if (customHostnames.length > 0) {
      // Switch to domains tab and disable setup tab
      setActiveTab('domains')

      const hasPending = customHostnames.some(
        h => h.status === 'pending' || h.ssl_status !== 'active'
      )
      if (hasPending && !isPolling) {
        setIsPolling(true)
      }
    } else {
      // If no domains, allow setup tab
      setActiveTab('setup')
    }
  }, [customHostnames, isPolling])

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDomainError("")
    
    if (!validateDomain(domain)) {
      setDomainError("Please enter a valid domain name (e.g., example.com)")
      return
    }

    if (customHostnames.some(h => h.hostname === domain)) {
      setDomainError("This domain is already configured")
      return
    }

    setIsLoading(true)
    
    try {
      const createRequest: CreateCustomHostnameRequest = { hostname: domain }
      const response = await api.post<CustomHostname>('/cf/hostnames', createRequest)
      
      if (response.success) {
        setCustomHostnames(prev => [...prev, response])
        setDomain("")
        setIsPolling(true)
        setActiveTab("domains") // Switch to domains tab to show verification instructions
        toast({
          title: "Domain Added Successfully",
          description: "Please add the DNS records shown below to verify your domain ownership.",
        })
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to add domain. Please try again."
      setDomainError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openDeleteConfirmation = (hostnameId: string, hostname: string) => {
    setDeleteConfirmation({ isOpen: true, hostname: hostnameId, domainToDelete: hostname })
    setDeleteInput('')
  }

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ isOpen: false, hostname: '', domainToDelete: '' })
    setDeleteInput('')
  }

  const handleDeleteDomain = async () => {
    if (deleteInput !== deleteConfirmation.domainToDelete) {
      return
    }

    try {
      await api.delete(`/cf/${deleteConfirmation.hostname}`)
      setCustomHostnames(prev => prev.filter(h => h.id !== deleteConfirmation.hostname))
      toast({
        title: "Domain Deleted",
        description: `${deleteConfirmation.domainToDelete} has been removed from your account.`,
      })
      closeDeleteConfirmation()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete domain. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteInput(e.target.value)
  }

  const handleDeleteInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent paste
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault()
    }
  }

  const handleDeleteInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
  }

  const handleRefreshStatus = async () => {
    // Ensure we have the latest hostnames before deciding
    const latest = await fetchCustomHostnames()

    const pendingHostnames = latest.filter(
      h => h.status === 'pending' || h.ssl_status !== 'active'
    )
    
    if (pendingHostnames.length > 0) {
      setActiveTab('domains')
      setIsPolling(true)
      pendingHostnames.forEach(hostname => {
        pollHostnameStatus(hostname.id)
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    })
  }

  const getStatusBadge = (status: string, sslStatus?: string) => {
    if (status === 'active' && sslStatus === 'active') {
      return <Badge className="bg-green-100 text-green-800 border-green-300">✅ Active</Badge>
    } else if (status === 'pending' || sslStatus?.includes('pending') || sslStatus === 'initializing') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">🔄 Verifying</Badge>
    } else if (status === 'pending_deletion' || status === 'deleted') {
      return <Badge variant="destructive">🗑️ Deleted</Badge>
    } else {
      return <Badge variant="secondary">❓ Unknown</Badge>
    }
  }

  return (
    <AdminLayout title="Custom Domain">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">
            Connect your own domain to your blog
          </p>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TooltipProvider>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="setup" 
                  disabled={customHostnames.length > 0}
                  className="data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed text-xs sm:text-sm p-2 sm:p-3"
                >
                  Domain Setup
                </TabsTrigger>
              </TooltipTrigger>
              {customHostnames.length > 0 && (
                <TooltipContent>
                  <p>You already have a domain configured. Delete existing domain to add a new one.</p>
                </TooltipContent>
              )}
            </Tooltip>
            
            <TabsTrigger value="domains" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                My Domains
                {customHostnames.some(h => h.status === 'pending' || h.ssl_status !== 'active') && (
                  <Badge className="text-[10px] sm:text-xs bg-yellow-500 text-white">Action Required</Badge>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="dns" className="text-xs sm:text-sm p-2 sm:p-3">DNS Guide</TabsTrigger>
          </TabsList>
        </TooltipProvider>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Custom Domain</CardTitle>
              <CardDescription>
                Connect your own domain to your blog. We'll automatically generate SSL certificates and provide DNS configuration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDomainSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain Name</Label>
                  <Input
                    id="domain"
                    type="text"
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                    className={domainError ? "border-red-500" : ""}
                  />
                  {domainError && (
                    <p className="text-sm text-red-600">{domainError}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Enter your domain without "www" (e.g., example.com). Make sure you own this domain.
                  </p>
                </div>
                <Button type="submit" disabled={isLoading || !domain} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Domain...
                    </>
                  ) : (
                    "Add Domain"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>What happens next:</strong> After adding your domain, we'll automatically generate DNS records and SSL certificates. 
              You'll need to add the provided DNS records to your domain provider. Changes typically take 5-15 minutes to propagate.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Only add domains you own and control. Adding domains you don't own may result in account suspension.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Your Custom Domains</h3>
              <p className="text-sm text-muted-foreground">
                Manage your connected domains and their configuration status
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefreshStatus}
              disabled={customHostnames.length === 0}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
          </div>

          {customHostnames.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No domains configured</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Get started by adding your first custom domain in the Domain Setup tab.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {customHostnames.map((hostname) => (
                <Card key={hostname.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h4 className="text-lg font-semibold break-all">{hostname.hostname}</h4>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(hostname.status, hostname.ssl_status)}
                            {isPolling && (hostname.status === 'pending' || hostname.ssl_status !== 'active') && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Domain Status: <span className="capitalize">{hostname.status}</span></p>
                          <p>SSL Status: <span className="capitalize">{hostname.ssl_status.replace(/_/g, ' ')}</span></p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        {hostname.status === 'active' && (
                          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                            <a 
                              href={`https://${hostname.hostname}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => openDeleteConfirmation(hostname.id, hostname.hostname)}
                          className="w-full sm:w-auto"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    {(hostname.status === 'pending' || hostname.ssl_status === 'pending_validation') && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h5 className="font-medium">⚠️ DNS Verification Required</h5>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => pollHostnameStatus(hostname.id)}
                              disabled={isPolling}
                              className="w-full sm:w-auto"
                            >
                              {isPolling ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                              Check Now
                            </Button>
                          </div>
                          
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              <strong>Action Required:</strong> Add these DNS records to your domain provider to verify ownership and activate your domain.
                              We're checking automatically every 10 seconds.
                            </AlertDescription>
                          </Alert>

                          <div className="space-y-4">
                            <div className="space-y-3">
                              <div className="p-4 bg-card rounded-lg border">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary">TXT</Badge>
                                      <span className="text-sm font-semibold">Domain Verification Record</span>
                                    </div>
                                    <div className="space-y-2">
                                      <div>
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name/Host:</label>
                                        <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                          <code className="text-sm bg-muted px-2 py-1 rounded border block break-all flex-1 w-full">{hostname.txtRecord.name}</code>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(hostname.txtRecord.name)}
                                            className="w-full sm:w-auto flex-shrink-0"
                                          >
                                            <Copy className="h-4 w-4 mr-1" />
                                            Copy
                                          </Button>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Value:</label>
                                        <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                          <code className="text-sm bg-muted px-2 py-1 rounded border block break-all flex-1 w-full">{hostname.txtRecord.value}</code>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(hostname.txtRecord.value)}
                                            className="w-full sm:w-auto flex-shrink-0"
                                          >
                                            <Copy className="h-4 w-4 mr-1" />
                                            Copy
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-4 bg-card rounded-lg border">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary">CNAME</Badge>
                                      <span className="text-sm font-semibold">Domain Routing Record</span>
                                    </div>
                                    <div className="space-y-2">
                                      <div>
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name/Host:</label>
                                        <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                          <code className="text-sm bg-muted px-2 py-1 rounded border block break-all flex-1 w-full">{hostname.cnameRecord.name}</code>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(hostname.cnameRecord.name)}
                                            className="w-full sm:w-auto flex-shrink-0"
                                          >
                                            <Copy className="h-4 w-4 mr-1" />
                                            Copy
                                          </Button>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Value:</label>
                                        <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                          <code className="text-sm bg-muted px-2 py-1 rounded border block break-all flex-1 w-full">{hostname.cnameRecord.value}</code>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(hostname.cnameRecord.value)}
                                            className="w-full sm:w-auto flex-shrink-0"
                                          >
                                            <Copy className="h-4 w-4 mr-1" />
                                            Copy
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-muted/50 border rounded p-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <p className="font-medium mb-1">Instructions for users:</p>
                                  <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                                    <li>Go to your domain provider's website (where you bought the domain)</li>
                                    <li>Look for "DNS Settings", "DNS Management", or "Domain Management"</li>
                                    <li>Add both records above exactly as shown (copy and paste recommended)</li>
                                    <li>Save the changes and wait 5-15 minutes for verification</li>
                                  </ol>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DNS Setup Guide</CardTitle>
              <CardDescription>
                Step-by-step instructions for configuring your domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">For Beginners (Non-Technical Users)</h4>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium">Step 1: Find Your Domain Provider</h5>
                      <p className="text-sm text-muted-foreground">
                        Your domain provider is where you purchased your domain (e.g., GoDaddy, Namecheap, Domain.com, Google Domains)
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium">Step 2: Access DNS Settings</h5>
                      <p className="text-sm text-muted-foreground">
                        Log into your domain provider's website and look for "DNS Settings", "Domain Management", or "Nameservers"
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium">Step 3: Add DNS Records</h5>
                      <p className="text-sm text-muted-foreground">
                        When you add a domain above, we'll provide specific DNS records to copy and paste into your provider's DNS settings
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium">Step 4: Wait for Activation</h5>
                      <p className="text-sm text-muted-foreground">
                        DNS changes take 5-15 minutes to verify. We'll automatically check and notify you when your domain is ready!
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">For Advanced Users</h4>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Cloudflare Users:</strong> If your domain is already on Cloudflare, you can manage DNS records directly in your Cloudflare dashboard. 
                      No additional setup required - just add the provided DNS records.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Popular DNS Providers</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                          <a href="https://domains.google.com" target="_blank" rel="noopener noreferrer">
                            Google Domains
                            <ExternalLink className="ml-auto h-3 w-3" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                          <a href="https://www.godaddy.com" target="_blank" rel="noopener noreferrer">
                            GoDaddy
                            <ExternalLink className="ml-auto h-3 w-3" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                          <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer">
                            Namecheap
                            <ExternalLink className="ml-auto h-3 w-3" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                          <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer">
                            Cloudflare
                            <ExternalLink className="ml-auto h-3 w-3" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">DNS Record Types</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div>
                          <Badge variant="outline" className="mr-2">A</Badge>
                          Points your domain to an IP address
                        </div>
                        <div>
                          <Badge variant="outline" className="mr-2">CNAME</Badge>
                          Points a subdomain to another domain
                        </div>
                        <div>
                          <Badge variant="outline" className="mr-2">TXT</Badge>
                          Used for domain verification and configuration
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Subfolder Hosting Setup</h4>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Alternative Option:</strong> If you want to host your blog on a subfolder (e.g., yourdomain.com/blog) instead of a subdomain, 
                      you can configure this through your existing website's server or CDN.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium">Step 1: Configure Your Server/CDN</h5>
                      <p className="text-sm text-muted-foreground">
                        Set up a reverse proxy or redirect rule on your main website to forward requests from 
                        <code className="bg-muted px-1 rounded mx-1">yourdomain.com/blog/*</code> to your BlazeBlog subdomain.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium">Step 2: Popular Platform Examples</h5>
                      <div className="text-sm text-muted-foreground space-y-2">
                        <div>
                          <strong>Cloudflare:</strong> Use Page Rules or Workers to proxy <code className="bg-muted px-1 rounded">/blog/*</code>
                        </div>
                        <div>
                          <strong>Nginx:</strong> Add location block: <code className="bg-muted px-1 rounded">location /blog/ {"{ proxy_pass https://your-blazeblog-domain.com/; }"}</code>
                        </div>
                        <div>
                          <strong>Apache:</strong> Use mod_proxy: <code className="bg-muted px-1 rounded">ProxyPass /blog/ https://your-blazeblog-domain.com/</code>
                        </div>
                        <div>
                          <strong>Vercel:</strong> Add rewrite in <code className="bg-muted px-1 rounded">vercel.json</code>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h5 className="font-medium">Step 3: Update BlazeBlog Base Path</h5>
                      <p className="text-sm text-muted-foreground">
                        Contact support to configure your BlazeBlog instance for subfolder hosting. We'll need to update 
                        the base path and internal routing to work correctly with your proxy setup.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Troubleshooting:</strong> If your domain isn't activating after 1 hour, double-check that:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>DNS records are added exactly as provided (copy and paste recommended)</li>
                      <li>No conflicting DNS records exist for the same hostname</li>
                      <li>Your domain provider's changes have propagated (can take up to 48 hours in rare cases)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(open) => !open && closeDeleteConfirmation()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Domain</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the custom domain from your account and your blog will no longer be accessible via this domain, which may cause unexpected issues for your visitors.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive">
                To confirm deletion, type the domain name: <span className="font-mono bg-destructive/20 px-1 rounded">{deleteConfirmation.domainToDelete}</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">Domain name</Label>
              <Input
                id="delete-confirmation"
                value={deleteInput}
                onChange={handleDeleteInputChange}
                onKeyDown={handleDeleteInputKeyDown}
                onPaste={handleDeleteInputPaste}
                placeholder={`Type "${deleteConfirmation.domainToDelete}" to confirm`}
                className="font-mono"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteConfirmation}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDomain}
              disabled={deleteInput !== deleteConfirmation.domainToDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Domain
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
