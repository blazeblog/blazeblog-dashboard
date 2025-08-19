"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Globe, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Copy,
  Cloud
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CustomDomainPage() {
  const [domain, setDomain] = useState("")
  const [isCloudflareConnected, setIsCloudflareConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Domain Added",
        description: "Your custom domain has been configured successfully.",
      })
    }, 2000)
  }

  const handleCloudflareConnect = () => {
    // Redirect to Cloudflare OAuth or open popup
    window.open("https://dash.cloudflare.com/login", "_blank")
    setIsCloudflareConnected(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    })
  }

  return (
    <AdminLayout title="Custom Domain">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Custom Domain</h1>
            <p className="text-muted-foreground">
              Connect your own domain to your blog
            </p>
          </div>
        </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup">Domain Setup</TabsTrigger>
          <TabsTrigger value="dns">DNS Configuration</TabsTrigger>
          <TabsTrigger value="cloudflare">Cloudflare Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Custom Domain</CardTitle>
              <CardDescription>
                Enter your domain name to get started. Make sure you own this domain.
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
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter your domain without "www" (e.g., example.com)
                  </p>
                </div>
                <Button type="submit" disabled={isLoading || !domain}>
                  {isLoading ? "Configuring..." : "Add Domain"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              After adding your domain, you'll need to configure DNS records to point to our servers.
              We'll provide you with the exact records to add.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="dns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DNS Configuration</CardTitle>
              <CardDescription>
                Add these DNS records to your domain provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 font-medium text-sm">
                  <div>Type</div>
                  <div>Name</div>
                  <div>Value</div>
                  <div>Action</div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Badge variant="outline">A</Badge>
                  <code className="text-sm">@</code>
                  <code className="text-sm">76.76.19.19</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("76.76.19.19")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Badge variant="outline">CNAME</Badge>
                  <code className="text-sm">www</code>
                  <code className="text-sm">cname.vercel-dns.com</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("cname.vercel-dns.com")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  DNS changes can take up to 48 hours to propagate worldwide, but usually take effect within a few hours.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domain Status</CardTitle>
              <CardDescription>
                Current status of your domain configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Domain Added</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>DNS Configuration</span>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>SSL Certificate</span>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloudflare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Cloudflare Integration
              </CardTitle>
              <CardDescription>
                Automatically configure your domain with Cloudflare
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isCloudflareConnected ? (
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Connect your Cloudflare account to automatically configure DNS records and enable advanced features like CDN, DDoS protection, and SSL.
                    </AlertDescription>
                  </Alert>
                  
                  <Button onClick={handleCloudflareConnect} className="w-full">
                    <Cloud className="h-4 w-4 mr-2" />
                    Connect to Cloudflare
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Benefits of Cloudflare integration:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Automatic DNS configuration</li>
                      <li>Free SSL certificate</li>
                      <li>Global CDN for faster loading</li>
                      <li>DDoS protection</li>
                      <li>Analytics and insights</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your Cloudflare account is connected! You can now automatically configure domains.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Label htmlFor="cf-domain">Domain to configure</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cf-domain"
                        placeholder="example.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                      />
                      <Button>
                        Auto-Configure
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Connected Domains</h4>
                    <div className="text-sm text-muted-foreground">
                      No domains configured yet
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual Cloudflare Setup</CardTitle>
              <CardDescription>
                If you prefer to configure manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm">
                  1. Log in to your Cloudflare dashboard
                </p>
                <p className="text-sm">
                  2. Add your domain to Cloudflare
                </p>
                <p className="text-sm">
                  3. Update your nameservers at your domain registrar
                </p>
                <p className="text-sm">
                  4. Add the DNS records provided in the DNS Configuration tab
                </p>
              </div>
              
              <Button variant="outline" asChild>
                <a 
                  href="https://dash.cloudflare.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Open Cloudflare Dashboard
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  )
}
