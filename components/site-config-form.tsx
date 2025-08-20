"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Settings, Flag, Upload, X, BarChart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useClientApi } from "@/lib/client-api"

interface FeatureFlags {
  enableTagsPage: boolean
  enableAuthorsPage: boolean
  autoApproveComments: boolean
  enableCommentsReply: boolean
  enableCategoriesPage: boolean
  enableComments: boolean
  maintenanceMode: boolean
}

interface SiteConfig {
  h1: string
  logoPath: string
  seoTitle: string
  aboutUsContent: string
  homeMetaDescription: string
}

interface AnalyticsProvider {
  enabled: boolean
  trackingId: string
  script?: string
}

interface Analytics {
  googleAnalytics: AnalyticsProvider
  microsoftClarity: AnalyticsProvider
  hotjar: AnalyticsProvider
  mixpanel: AnalyticsProvider
  segment: AnalyticsProvider
  plausible: AnalyticsProvider
  fathom: AnalyticsProvider
  adobe: AnalyticsProvider
}

interface ConfigData {
  featureFlags: FeatureFlags
  siteConfig: SiteConfig
  analytics: Analytics
}

export function SiteConfigForm() {
  const [config, setConfig] = useState<ConfigData>({
    featureFlags: {
      enableTagsPage: false,
      enableAuthorsPage: false,
      autoApproveComments: false,
      enableCommentsReply: false,
      enableCategoriesPage: false,
      maintenanceMode: false,
      enableComments: true
    },
    siteConfig: {
      h1: '',
      logoPath: '',
      seoTitle: '',
      aboutUsContent: '',
      homeMetaDescription: ''
    },
    analytics: {
      googleAnalytics: { enabled: false, trackingId: '', script: '' },
      microsoftClarity: { enabled: false, trackingId: '', script: '' },
      hotjar: { enabled: false, trackingId: '', script: '' },
      mixpanel: { enabled: false, trackingId: '', script: '' },
      segment: { enabled: false, trackingId: '', script: '' },
      plausible: { enabled: false, trackingId: '', script: '' },
      fathom: { enabled: false, trackingId: '', script: '' },
      adobe: { enabled: false, trackingId: '', script: '' }
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const logoFileInputRef = useRef<HTMLInputElement>(null)
  const api = useClientApi()
  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await api.get<{ data: ConfigData }>('/customer/config')
      
      const data = response.data || response
      
      const defaultFeatureFlags = {
        enableTagsPage: false,
        enableAuthorsPage: false,
        autoApproveComments: false,
        enableCommentsReply: false,
        enableCategoriesPage: false,
        enableComments: true,
        maintenanceMode: false
      }
      
      const defaultSiteConfig = {
        h1: '',
        logoPath: '',
        seoTitle: '',
        aboutUsContent: '',
        homeMetaDescription: ''
      }

      const defaultAnalytics = {
        googleAnalytics: { enabled: false, trackingId: '', script: '' },
        microsoftClarity: { enabled: false, trackingId: '', script: '' },
        hotjar: { enabled: false, trackingId: '', script: '' },
        mixpanel: { enabled: false, trackingId: '', script: '' },
        segment: { enabled: false, trackingId: '', script: '' },
        plausible: { enabled: false, trackingId: '', script: '' },
        fathom: { enabled: false, trackingId: '', script: '' },
        adobe: { enabled: false, trackingId: '', script: '' }
      }
      
      setConfig({
        featureFlags: { ...defaultFeatureFlags, ...data.featureFlags },
        siteConfig: { ...defaultSiteConfig, ...data.siteConfig },
        analytics: { ...defaultAnalytics, ...data.analytics }
      })
    } catch (error) {
      console.error('Error fetching config:', error)
      toast({
        title: "Error",
        description: "Failed to load site configuration. Please try again.",
        variant: "destructive"
      })
      // Keep the default values if API call fails
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      await api.patch('/customer/config', config)
      toast({
        title: "Success!",
        description: "Site configuration has been updated successfully.",
        variant: "default"
      })
    } catch (error) {
      console.error('Error saving config:', error)
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateFeatureFlag = (key: keyof FeatureFlags, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [key]: value
      }
    }))
  }

  const updateSiteConfig = (key: keyof SiteConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      siteConfig: {
        ...prev.siteConfig,
        [key]: value
      }
    }))
  }

  const updateAnalytics = (provider: keyof Analytics, field: keyof AnalyticsProvider, value: boolean | string) => {
    setConfig(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        [provider]: {
          ...prev.analytics[provider],
          [field]: value
        }
      }
    }))
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('image', file)
        
        const response = await api.post('/file/upload', formData)
        
        if (response && response.url) {
          updateSiteConfig('logoPath', response.url)
          toast({
            title: "Success!",
            description: "Logo has been uploaded successfully.",
            variant: "default"
          })
        } else {
          throw new Error('Upload response did not contain URL')
        }
      } catch (error) {
        console.error('Error uploading logo:', error)
        toast({
          title: "Error",
          description: "Failed to upload logo. Please try again.",
          variant: "destructive"
        })
      } finally {
        setUploading(false)
      }
    }
  }

  const removeLogo = () => {
    updateSiteConfig('logoPath', '')
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="site-config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="site-config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Site Configuration
          </TabsTrigger>
          <TabsTrigger value="feature-flags" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site-config" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Site Configuration
              </CardTitle>
              <CardDescription>Configure your site's basic information and SEO settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="h1">Main Heading (H1)</Label>
                <Input
                  id="h1"
                  value={config.siteConfig.h1}
                  onChange={(e) => updateSiteConfig('h1', e.target.value)}
                  placeholder="Enter your site's main heading"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {config.siteConfig.logoPath ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 p-3 border rounded-lg">
                      <img 
                        src={config.siteConfig.logoPath} 
                        alt="Logo preview" 
                        className="h-12 w-12 object-contain rounded"
                      />
                      <div className="flex-1 text-sm text-muted-foreground">
                        Logo uploaded successfully
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeLogo}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoFileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Logo
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={config.siteConfig.seoTitle}
                  onChange={(e) => updateSiteConfig('seoTitle', e.target.value)}
                  placeholder="Enter SEO title for your site"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeMetaDescription">Home Meta Description</Label>
                <Textarea
                  id="homeMetaDescription"
                  value={config.siteConfig.homeMetaDescription}
                  onChange={(e) => updateSiteConfig('homeMetaDescription', e.target.value)}
                  placeholder="Enter meta description for your home page"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutUsContent">About Us Content</Label>
                <Textarea
                  id="aboutUsContent"
                  value={config.siteConfig.aboutUsContent}
                  onChange={(e) => updateSiteConfig('aboutUsContent', e.target.value)}
                  placeholder="Enter content for your about us page"
                  rows={4}
                />
              </div>
              <Button onClick={saveConfig} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feature-flags" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>Control which features are enabled on your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Tags Page</Label>
                  <p className="text-sm text-muted-foreground">Show tags page for content categorization</p>
                </div>
                <Switch
                  checked={config.featureFlags.enableTagsPage}
                  onCheckedChange={(checked) => updateFeatureFlag('enableTagsPage', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Authors Page</Label>
                  <p className="text-sm text-muted-foreground">Show authors page with contributor profiles</p>
                </div>
                <Switch
                  checked={config.featureFlags.enableAuthorsPage}
                  onCheckedChange={(checked) => updateFeatureFlag('enableAuthorsPage', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Comments</Label>
                  <p className="text-sm text-muted-foreground">Allow users to comment</p>
                </div>
                <Switch
                  checked={config.featureFlags.enableComments}
                  onCheckedChange={(checked) => updateFeatureFlag('enableComments', checked)}
                />
              </div>
              {config.featureFlags.enableComments && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Approve Comments</Label>
                      <p className="text-sm text-muted-foreground">Automatically approve new comments without moderation</p>
                    </div>
                    <Switch
                      checked={config.featureFlags.autoApproveComments}
                      onCheckedChange={(checked) => updateFeatureFlag('autoApproveComments', checked)}
                    />
                  </div>
                  {/* <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Comments Reply</Label>
                      <p className="text-sm text-muted-foreground">Allow users to reply to comments</p>
                    </div>
                    <Switch
                      checked={config.featureFlags.enableCommentsReply}
                      onCheckedChange={(checked) => updateFeatureFlag('enableCommentsReply', checked)}
                    />
                  </div> */}
                </>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Categories Page</Label>
                  <p className="text-sm text-muted-foreground">Show categories page for content organization</p>
                </div>
                <Switch
                  checked={config.featureFlags.enableCategoriesPage}
                  onCheckedChange={(checked) => updateFeatureFlag('enableCategoriesPage', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable maintenance mode to prevent public access</p>
                </div>
                <Switch
                  checked={config.featureFlags.maintenanceMode}
                  onCheckedChange={(checked) => updateFeatureFlag('maintenanceMode', checked)}
                />
              </div>
              <Button onClick={saveConfig} disabled={saving} className="w-full mt-6">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Feature Flags'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Analytics & Tracking
              </CardTitle>
              <CardDescription>Configure analytics and tracking providers for your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Analytics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Google Analytics</Label>
                    <p className="text-sm text-muted-foreground">Track website traffic and user behavior</p>
                  </div>
                  <Switch
                    checked={config.analytics.googleAnalytics.enabled}
                    onCheckedChange={(checked) => updateAnalytics('googleAnalytics', 'enabled', checked)}
                  />
                </div>
                {config.analytics.googleAnalytics.enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <Label htmlFor="ga-tracking-id">Tracking ID (GA_MEASUREMENT_ID)</Label>
                    <Input
                      id="ga-tracking-id"
                      value={config.analytics.googleAnalytics.trackingId}
                      onChange={(e) => updateAnalytics('googleAnalytics', 'trackingId', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Microsoft Clarity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Microsoft Clarity</Label>
                    <p className="text-sm text-muted-foreground">User session recordings and heatmaps</p>
                  </div>
                  <Switch
                    checked={config.analytics.microsoftClarity.enabled}
                    onCheckedChange={(checked) => updateAnalytics('microsoftClarity', 'enabled', checked)}
                  />
                </div>
                {config.analytics.microsoftClarity.enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <Label htmlFor="clarity-tracking-id">Tracking ID</Label>
                    <Input
                      id="clarity-tracking-id"
                      value={config.analytics.microsoftClarity.trackingId}
                      onChange={(e) => updateAnalytics('microsoftClarity', 'trackingId', e.target.value)}
                      placeholder="Enter Clarity tracking ID"
                    />
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Hotjar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hotjar</Label>
                    <p className="text-sm text-muted-foreground">User behavior analytics and feedback</p>
                  </div>
                  <Switch
                    checked={config.analytics.hotjar.enabled}
                    onCheckedChange={(checked) => updateAnalytics('hotjar', 'enabled', checked)}
                  />
                </div>
                {config.analytics.hotjar.enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <Label htmlFor="hotjar-tracking-id">Site ID</Label>
                    <Input
                      id="hotjar-tracking-id"
                      value={config.analytics.hotjar.trackingId}
                      onChange={(e) => updateAnalytics('hotjar', 'trackingId', e.target.value)}
                      placeholder="Enter Hotjar site ID"
                    />
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Mixpanel */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mixpanel</Label>
                    <p className="text-sm text-muted-foreground">Product analytics and user tracking</p>
                  </div>
                  <Switch
                    checked={config.analytics.mixpanel.enabled}
                    onCheckedChange={(checked) => updateAnalytics('mixpanel', 'enabled', checked)}
                  />
                </div>
                {config.analytics.mixpanel.enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <Label htmlFor="mixpanel-tracking-id">Project Token</Label>
                    <Input
                      id="mixpanel-tracking-id"
                      value={config.analytics.mixpanel.trackingId}
                      onChange={(e) => updateAnalytics('mixpanel', 'trackingId', e.target.value)}
                      placeholder="Enter Mixpanel project token"
                    />
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Segment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Segment</Label>
                    <p className="text-sm text-muted-foreground">Customer data platform and analytics</p>
                  </div>
                  <Switch
                    checked={config.analytics.segment.enabled}
                    onCheckedChange={(checked) => updateAnalytics('segment', 'enabled', checked)}
                  />
                </div>
                {config.analytics.segment.enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <Label htmlFor="segment-tracking-id">Write Key</Label>
                    <Input
                      id="segment-tracking-id"
                      value={config.analytics.segment.trackingId}
                      onChange={(e) => updateAnalytics('segment', 'trackingId', e.target.value)}
                      placeholder="Enter Segment write key"
                    />
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Plausible */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Plausible</Label>
                    <p className="text-sm text-muted-foreground">Privacy-friendly web analytics</p>
                  </div>
                  <Switch
                    checked={config.analytics.plausible.enabled}
                    onCheckedChange={(checked) => updateAnalytics('plausible', 'enabled', checked)}
                  />
                </div>
                {config.analytics.plausible.enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <Label htmlFor="plausible-tracking-id">Domain</Label>
                    <Input
                      id="plausible-tracking-id"
                      value={config.analytics.plausible.trackingId}
                      onChange={(e) => updateAnalytics('plausible', 'trackingId', e.target.value)}
                      placeholder="yourdomain.com"
                    />
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Fathom */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Fathom Analytics</Label>
                    <p className="text-sm text-muted-foreground">Simple, privacy-focused analytics</p>
                  </div>
                  <Switch
                    checked={config.analytics.fathom.enabled}
                    onCheckedChange={(checked) => updateAnalytics('fathom', 'enabled', checked)}
                  />
                </div>
                {config.analytics.fathom.enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <Label htmlFor="fathom-tracking-id">Site ID</Label>
                    <Input
                      id="fathom-tracking-id"
                      value={config.analytics.fathom.trackingId}
                      onChange={(e) => updateAnalytics('fathom', 'trackingId', e.target.value)}
                      placeholder="Enter Fathom site ID"
                    />
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Adobe Analytics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Adobe Analytics</Label>
                    <p className="text-sm text-muted-foreground">Enterprise web analytics solution</p>
                  </div>
                  <Switch
                    checked={config.analytics.adobe.enabled}
                    onCheckedChange={(checked) => updateAnalytics('adobe', 'enabled', checked)}
                  />
                </div>
                {config.analytics.adobe.enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <Label htmlFor="adobe-tracking-id">Report Suite ID</Label>
                    <Input
                      id="adobe-tracking-id"
                      value={config.analytics.adobe.trackingId}
                      onChange={(e) => updateAnalytics('adobe', 'trackingId', e.target.value)}
                      placeholder="Enter Adobe Analytics report suite ID"
                    />
                  </div>
                )}
              </div>
              
              <Button onClick={saveConfig} disabled={saving} className="w-full mt-6">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Analytics Configuration'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}