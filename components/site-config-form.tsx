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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Settings, Flag, Upload, X, BarChart, DollarSign, Plus, Trash2, Link, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useClientApi } from "@/lib/client-api"
import { getImageUrl } from "@/lib/image-utils"
import { MarkdownTextarea } from "@/components/ui/markdown-textarea"

interface FeatureFlags {
  enableTagsPage: boolean
  enableAuthorsPage: boolean
  autoApproveComments: boolean
  enableCommentsReply: boolean
  enableCategoriesPage: boolean
  enableComments: boolean
  enableNewsletters: boolean
  maintenanceMode: boolean
}

interface HeroSettings {
  enabled?: boolean
  content?: string
  ctaLabel?: string
  ctaUrl?: string
}

interface SiteConfig {
  h1: string
  logoPath: string
  seoTitle: string
  aboutUsContent: string
  homeMetaDescription: string
  heroSettings?: HeroSettings
}

interface NavigationLink {
  label: string
  url: string
  children?: NavigationLink[]
}

interface NavigationConfig {
  headerNavigationLinks: NavigationLink[]
  footerNavigationLinks: NavigationLink[]
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

interface AdProvider {
  enabled: boolean
  siteId?: string
  clientId?: string
  networkId?: string
  zoneId?: string
  script?: string
}

interface Ads {
  enabled: boolean
  googleAds: AdProvider
  adThrive: AdProvider
  mediavine: AdProvider
  ezoic: AdProvider
  carbonAds: AdProvider
  buysellads: AdProvider
  custom: any[]
}

interface ConfigData {
  featureFlags: FeatureFlags
  siteConfig: SiteConfig
  navigation?: NavigationConfig
  analytics: Analytics
  ads: Ads
  siteAds?: Ads
  headerNavigationLinks?: NavigationLink[]
  footerNavigationLinks?: NavigationLink[]
   socialMediaLinks?: { platform: string; url: string; label?: string }[];

}

export function SiteConfigForm() {
  const [urlErrors, setUrlErrors] = useState<{[key: string]: string}>({})
  const [heroCtaUrlError, setHeroCtaUrlError] = useState<string>("")

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false
    try {
      const urlObj = new URL(url)
      // Only allow HTTPS URLs
      return urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const validateUrl = (url: string, type: 'header' | 'footer', index: number) => {
    const key = `${type}-${index}`
    if (url.trim() && !isValidUrl(url)) {
      setUrlErrors(prev => ({
        ...prev,
        [key]: 'Please enter a valid HTTPS URL (e.g., https://example.com)'
      }))
      return false
    } else {
      setUrlErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
      return true
    }
  }

  const [config, setConfig] = useState<ConfigData>({
    featureFlags: {
      enableTagsPage: false,
      enableAuthorsPage: false,
      autoApproveComments: false,
      enableCommentsReply: false,
      enableCategoriesPage: false,
      enableComments: true,
      enableNewsletters: false,
      maintenanceMode: false
    },
    siteConfig: {
      h1: '',
      logoPath: '',
      seoTitle: '',
      aboutUsContent: '',
      homeMetaDescription: '',
      heroSettings: {
        enabled: false,
        content: '',
        ctaLabel: '',
        ctaUrl: '',
      },
    },
    headerNavigationLinks: [],
    footerNavigationLinks: [],
    analytics: {
      googleAnalytics: { enabled: false, trackingId: '', script: '' },
      microsoftClarity: { enabled: false, trackingId: '', script: '' },
      hotjar: { enabled: false, trackingId: '', script: '' },
      mixpanel: { enabled: false, trackingId: '', script: '' },
      segment: { enabled: false, trackingId: '', script: '' },
      plausible: { enabled: false, trackingId: '', script: '' },
      fathom: { enabled: false, trackingId: '', script: '' },
      adobe: { enabled: false, trackingId: '', script: '' }
    },
    ads: {
      enabled: false,
      googleAds: { enabled: false, clientId: '', script: '' },
      adThrive: { enabled: false, siteId: '', script: '' },
      mediavine: { enabled: false, siteId: '', script: '' },
      ezoic: { enabled: false, siteId: '', script: '' },
      carbonAds: { enabled: false, zoneId: '', script: '' },
      buysellads: { enabled: false, networkId: '', script: '' },
      custom: []
    },
    socialMediaLinks: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const logoFileInputRef = useRef<HTMLInputElement>(null)
  const api = useClientApi()
  const { toast } = useToast()
  const [socialUrlErrors, setSocialUrlErrors] = useState<{[index: number]: string}>({})

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
        enableNewsletters: false,
        maintenanceMode: false
      }
      
      const defaultSiteConfig = {
        h1: '',
        logoPath: '',
        seoTitle: '',
        aboutUsContent: '',
        homeMetaDescription: '',
        heroSettings: {
          enabled: false,
          content: '',
          ctaLabel: '',
          ctaUrl: '',
        },
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

      const defaultAds = {
        enabled: false,
        googleAds: { enabled: false, clientId: '', script: '' },
        adThrive: { enabled: false, siteId: '', script: '' },
        mediavine: { enabled: false, siteId: '', script: '' },
        ezoic: { enabled: false, siteId: '', script: '' },
        carbonAds: { enabled: false, zoneId: '', script: '' },
        buysellads: { enabled: false, networkId: '', script: '' },
        custom: []
      }
      
      // Map any legacy top-level hero fields into heroSettings for backward compatibility
      const legacyHero: HeroSettings = {
        enabled: (data.siteConfig as any)?.heroEnabled,
        content: (data.siteConfig as any)?.heroContent,
        ctaLabel: (data.siteConfig as any)?.heroCtaLabel,
        ctaUrl: (data.siteConfig as any)?.heroCtaUrl,
      }

      setConfig({
        featureFlags: { ...defaultFeatureFlags, ...data.featureFlags },
        siteConfig: { 
          ...defaultSiteConfig, 
          ...data.siteConfig,
          heroSettings: {
            ...(defaultSiteConfig as any).heroSettings,
            ...(legacyHero || {}),
            ...(data.siteConfig?.heroSettings || {}),
          },
        },
        headerNavigationLinks: data.headerNavigationLinks || [],
        footerNavigationLinks: data.footerNavigationLinks || [],
        analytics: { ...defaultAnalytics, ...data.analytics },
        ads: { ...defaultAds, ...(data.ads || data.siteAds) },
        socialMediaLinks: data.socialMediaLinks || []
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
    // Validate all URLs before saving
    let hasErrors = false
    setHeroCtaUrlError("")
    
    // Validate header navigation links
    config.headerNavigationLinks?.forEach((link, index) => {
      if (link.url.trim() && !isValidUrl(link.url)) {
        validateUrl(link.url, 'header', index)
        hasErrors = true
      }
    })
    
    // Validate footer navigation links
    config.footerNavigationLinks?.forEach((link, index) => {
      if (link.url.trim() && !isValidUrl(link.url)) {
        validateUrl(link.url, 'footer', index)
        hasErrors = true
      }
    })

    // Validate social links
    const socialErrors: {[index: number]: string} = {}
    ;(config.socialMediaLinks || []).forEach((s, i) => {
      if (s.url && !isValidUrl(s.url)) {
        socialErrors[i] = 'Please enter a valid HTTPS URL (e.g., https://example.com)'
        hasErrors = true
      }
    })
    setSocialUrlErrors(socialErrors)
    
    // Validate hero CTA URL if provided
    if (config.siteConfig.heroSettings?.enabled) {
      const ctaUrl = (config.siteConfig.heroSettings?.ctaUrl || '').trim()
      const ctaLabel = (config.siteConfig.heroSettings?.ctaLabel || '').trim()
      if (ctaUrl) {
        if (!isValidUrl(ctaUrl)) {
          setHeroCtaUrlError('Please enter a valid HTTPS URL (e.g., https://example.com)')
          hasErrors = true
        }
      } else if (ctaLabel) {
        // If label is provided but URL is missing, prompt user
        setHeroCtaUrlError('Please add a HTTPS URL for the CTA button')
        hasErrors = true
      }
    }
    
    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix the invalid URLs before saving.",
        variant: "destructive"
      })
      return
    }
    
    setSaving(true)
    try {
      // Prepare the payload with navigation links separate from siteConfig
      const payload = {
        ...config,
        headerNavigationLinks: config.headerNavigationLinks,
        footerNavigationLinks: config.footerNavigationLinks,
        socialMediaLinks: config.socialMediaLinks || []
      }
      
      await api.patch('/customer/config', payload)
      toast({
        title: "Success!",
        description: "Site configuration has been updated successfully.",
        variant: "default",
        duration: 3000
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

  const updateSiteConfig = (key: keyof SiteConfig, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      siteConfig: {
        ...prev.siteConfig,
        [key]: value
      }
    }))
  }

  const updateHeroSettings = (key: keyof HeroSettings, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      siteConfig: {
        ...prev.siteConfig,
        heroSettings: {
          ...(prev.siteConfig.heroSettings || {}),
          [key]: value as any,
        },
      },
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

  const updateAds = (provider: keyof Ads, field: keyof AdProvider, value: boolean | string) => {
    if (provider === 'enabled' || provider === 'custom') return
    setConfig(prev => ({
      ...prev,
      ads: {
        ...prev.ads,
        [provider]: {
          ...prev.ads[provider] as AdProvider,
          [field]: value
        }
      }
    }))
  }

  const updateAdsEnabled = (enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      ads: {
        ...prev.ads,
        enabled
      }
    }))
  }

  const addNavigationLink = (type: 'header' | 'footer') => {
    const fieldName = type === 'header' ? 'headerNavigationLinks' : 'footerNavigationLinks'
    const maxLimit = type === 'header' ? 5 : 5
    
    if ((config[fieldName]?.length || 0) >= maxLimit) {
      toast({
        title: "Limit Reached",
        description: `You can only add up to ${maxLimit} ${type} navigation links.`,
        variant: "destructive"
      })
      return
    }
    
    setConfig(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), { label: '', url: '' }]
    }))
  }

  const removeNavigationLink = (type: 'header' | 'footer', index: number) => {
    const fieldName = type === 'header' ? 'headerNavigationLinks' : 'footerNavigationLinks'
    
    // Clear URL error for this item
    const errorKey = `${type}-${index}`
    setUrlErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[errorKey]
      return newErrors
    })
    
    setConfig(prev => ({
      ...prev,
      [fieldName]: prev[fieldName]?.filter((_, i) => i !== index) || []
    }))
  }

  const updateNavigationLink = (type: 'header' | 'footer', index: number, field: 'label' | 'url', value: string) => {
    const fieldName = type === 'header' ? 'headerNavigationLinks' : 'footerNavigationLinks'
    
    // Validate URL if it's a URL field
    if (field === 'url') {
      validateUrl(value, type, index)
    }
    
    setConfig(prev => ({
      ...prev,
      [fieldName]: prev[fieldName]?.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      ) || []
    }))
  }

  const addChildLink = (type: 'header' | 'footer', parentIndex: number) => {
    const fieldName = type === 'header' ? 'headerNavigationLinks' : 'footerNavigationLinks'
    const maxChildLimit = type === 'header' ? 5 : 7
    
    setConfig(prev => {
      const links = prev[fieldName] || []
      const parentLink = links[parentIndex]
      
      if (!parentLink) return prev
      
      const currentChildren = parentLink.children || []
      if (currentChildren.length >= maxChildLimit) {
        toast({
          title: "Limit Reached",
          description: `You can only add up to ${maxChildLimit} child links.`,
          variant: "destructive"
        })
        return prev
      }
      
      const updatedLinks = links.map((link, i) => 
        i === parentIndex 
          ? { ...link, children: [...currentChildren, { label: '', url: '' }] }
          : link
      )
      
      return {
        ...prev,
        [fieldName]: updatedLinks
      }
    })
  }

  const removeChildLink = (type: 'header' | 'footer', parentIndex: number, childIndex: number) => {
    const fieldName = type === 'header' ? 'headerNavigationLinks' : 'footerNavigationLinks'
    
    setConfig(prev => {
      const links = prev[fieldName] || []
      const updatedLinks = links.map((link, i) => 
        i === parentIndex 
          ? { 
              ...link, 
              children: link.children?.filter((_, ci) => ci !== childIndex) 
            }
          : link
      )
      
      return {
        ...prev,
        [fieldName]: updatedLinks
      }
    })
  }

  const updateChildLink = (type: 'header' | 'footer', parentIndex: number, childIndex: number, field: 'label' | 'url', value: string) => {
    const fieldName = type === 'header' ? 'headerNavigationLinks' : 'footerNavigationLinks'
    
    setConfig(prev => {
      const links = prev[fieldName] || []
      const updatedLinks = links.map((link, i) => 
        i === parentIndex 
          ? { 
              ...link, 
              children: link.children?.map((child, ci) => 
                ci === childIndex ? { ...child, [field]: value } : child
              )
            }
          : link
      )
      
      return {
        ...prev,
        [fieldName]: updatedLinks
      }
    })
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
            variant: "default",
            duration: 3000
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
        <div className="overflow-x-auto overflow-y-hidden">
          <TabsList className="inline-flex h-auto p-1 w-max min-w-full">
            <TabsTrigger value="site-config" className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 text-xs md:text-sm whitespace-nowrap flex-shrink-0">
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="hidden md:inline">Configuration</span>
              <span className="md:hidden">Config</span>
            </TabsTrigger>
            <TabsTrigger value="feature-flags" className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 text-xs md:text-sm whitespace-nowrap flex-shrink-0">
              <Flag className="h-4 w-4 flex-shrink-0" />
              <span className="hidden md:inline">Features</span>
              <span className="md:hidden">Flags</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 text-xs md:text-sm whitespace-nowrap flex-shrink-0">
              <BarChart className="h-4 w-4 flex-shrink-0" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 text-xs md:text-sm whitespace-nowrap flex-shrink-0">
              <DollarSign className="h-4 w-4 flex-shrink-0" />
              <span>Ads</span>
            </TabsTrigger>
            <TabsTrigger value="socials" className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 text-xs md:text-sm whitespace-nowrap flex-shrink-0">
              <Link className="h-4 w-4 flex-shrink-0" />
              <span>Socials</span>
            </TabsTrigger>
          </TabsList>
        </div>

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
              {/* Hero Segment (Optional) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      Hero Segment (optional)
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Label>
                    <p className="text-sm text-muted-foreground">Supports markdown (#md). Renders before the main heading.</p>
                  </div>
                  <Switch
                    checked={!!config.siteConfig.heroSettings?.enabled}
                    onCheckedChange={(checked) => updateHeroSettings('enabled', checked)}
                  />
                </div>
                {config.siteConfig.heroSettings?.enabled && (
                  <div className="space-y-3 pl-4 border-l-2 border-muted">
                    <MarkdownTextarea
                      id="hero-content"
                      label="Hero Content"
                      value={config.siteConfig.heroSettings?.content || ''}
                      onChange={(value) => updateHeroSettings('content', value)}
                      placeholder="Add a short intro. Use markdown for headings, emphasis, and links."
                      enablePreview={true}
                      minHeight={120}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="hero-cta-label">CTA Button Label</Label>
                        <Input
                          id="hero-cta-label"
                          value={config.siteConfig.heroSettings?.ctaLabel || ''}
                          onChange={(e) => updateHeroSettings('ctaLabel', e.target.value)}
                          placeholder="e.g., Get Started"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-cta-url">CTA Link</Label>
                        <Input
                          id="hero-cta-url"
                          value={config.siteConfig.heroSettings?.ctaUrl || ''}
                          onChange={(e) => {
                            const v = e.target.value
                            updateHeroSettings('ctaUrl', v)
                            if (v && !isValidUrl(v)) {
                              setHeroCtaUrlError('Please enter a valid HTTPS URL (e.g., https://example.com)')
                            } else {
                              setHeroCtaUrlError('')
                            }
                          }}
                          placeholder="https://example.com/signup"
                          className={heroCtaUrlError ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {heroCtaUrlError && (
                          <p className="text-sm text-red-500 mt-1">{heroCtaUrlError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                        src={getImageUrl(config.siteConfig.logoPath)} 
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
              
              <Separator />
              
              {/* Header Navigation Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-semibold">Header Navigation Links</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => toast({
                          title: "Navigation Info",
                          description: "Each parent link can have up to 5 child links. Child links create dropdown menus in your site navigation.",
                          variant: "default"
                        })}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Add navigation links for your site header (max 5)</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNavigationLink('header')}
                    disabled={(config.headerNavigationLinks?.length || 0) >= 5}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>
                
                {config.headerNavigationLinks?.map((link, index) => {
                  const errorKey = `header-${index}`
                  const hasError = urlErrors[errorKey]
                  return (
                    <div key={index} className="space-y-3 border rounded-lg p-4">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`header-label-${index}`}>Label</Label>
                          <Input
                            id={`header-label-${index}`}
                            value={link.label}
                            onChange={(e) => updateNavigationLink('header', index, 'label', e.target.value)}
                            placeholder="Link text"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`header-url-${index}`}>URL</Label>
                          <Input
                            id={`header-url-${index}`}
                            value={link.url}
                            onChange={(e) => updateNavigationLink('header', index, 'url', e.target.value)}
                            placeholder="https://example.com"
                            className={hasError ? "border-red-500 focus:border-red-500" : ""}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addChildLink('header', index)}
                          disabled={(link.children?.length || 0) >= 5}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNavigationLink('header', index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {hasError && (
                        <p className="text-sm text-red-500 mt-1">{hasError}</p>
                      )}
                      
                      {/* Child Links */}
                      {link.children && link.children.length > 0 && (
                        <div className="ml-4 pl-4 border-l-2 border-muted space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Child Links (max 5)</Label>
                          {link.children.map((child, childIndex) => (
                            <div key={childIndex} className="flex gap-2 items-end">
                              <div className="flex-1 space-y-1">
                                <Input
                                  value={child.label}
                                  onChange={(e) => updateChildLink('header', index, childIndex, 'label', e.target.value)}
                                  placeholder="Child link text"
                                  className="text-sm"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <Input
                                  value={child.url}
                                  onChange={(e) => updateChildLink('header', index, childIndex, 'url', e.target.value)}
                                  placeholder="https://example.com"
                                  className="text-sm"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeChildLink('header', index, childIndex)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }) || []}
              </div>
              
              <Separator />
              
              {/* Footer Navigation Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-semibold">Footer Navigation Links</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => toast({
                          title: "Navigation Info",
                          description: "Each parent link can have up to 7 child links. Child links create dropdown menus in your site navigation.",
                          variant: "default"
                        })}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Add navigation links for your site footer (max 5)</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNavigationLink('footer')}
                    disabled={(config.footerNavigationLinks?.length || 0) >= 5}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>
                
                {config.footerNavigationLinks?.map((link, index) => {
                  const errorKey = `footer-${index}`
                  const hasError = urlErrors[errorKey]
                  return (
                    <div key={index} className="space-y-3 border rounded-lg p-4">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`footer-label-${index}`}>Label</Label>
                          <Input
                            id={`footer-label-${index}`}
                            value={link.label}
                            onChange={(e) => updateNavigationLink('footer', index, 'label', e.target.value)}
                            placeholder="Link text"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`footer-url-${index}`}>URL</Label>
                          <Input
                            id={`footer-url-${index}`}
                            value={link.url}
                            onChange={(e) => updateNavigationLink('footer', index, 'url', e.target.value)}
                            placeholder="https://example.com"
                            className={hasError ? "border-red-500 focus:border-red-500" : ""}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addChildLink('footer', index)}
                          disabled={(link.children?.length || 0) >= 7}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNavigationLink('footer', index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {hasError && (
                        <p className="text-sm text-red-500 mt-1">{hasError}</p>
                      )}
                      
                      {/* Child Links */}
                      {link.children && link.children.length > 0 && (
                        <div className="ml-4 pl-4 border-l-2 border-muted space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Child Links (max 7)</Label>
                          {link.children.map((child, childIndex) => (
                            <div key={childIndex} className="flex gap-2 items-end">
                              <div className="flex-1 space-y-1">
                                <Input
                                  value={child.label}
                                  onChange={(e) => updateChildLink('footer', index, childIndex, 'label', e.target.value)}
                                  placeholder="Child link text"
                                  className="text-sm"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <Input
                                  value={child.url}
                                  onChange={(e) => updateChildLink('footer', index, childIndex, 'url', e.target.value)}
                                  placeholder="https://example.com"
                                  className="text-sm"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeChildLink('footer', index, childIndex)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }) || []}
              </div>
              
              <Button onClick={saveConfig} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </CardContent>
          </Card>
      </TabsContent>

      <TabsContent value="socials" className="space-y-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Social Links
            </CardTitle>
            <CardDescription>Add your social media profiles. HTTPS URLs only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(config.socialMediaLinks || []).map((s, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-start">
                <div className="sm:col-span-2">
                  <Label className="text-xs">Platform</Label>
                  <Select
                    value={s.platform || 'custom'}
                    onValueChange={(v) => setConfig(prev => ({
                      ...prev,
                      socialMediaLinks: (prev.socialMediaLinks || []).map((x, idx) => idx === i ? { ...x, platform: v } : x)
                    }))}
                  >
                    <SelectTrigger className="h-9 text-sm md:h-8 md:text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: 'twitter', label: 'Twitter / X' },
                        { value: 'facebook', label: 'Facebook' },
                        { value: 'instagram', label: 'Instagram' },
                        { value: 'linkedin', label: 'LinkedIn' },
                        { value: 'youtube', label: 'YouTube' },
                        { value: 'github', label: 'GitHub' },
                        { value: 'tiktok', label: 'TikTok' },
                        { value: 'reddit', label: 'Reddit' },
                        { value: 'threads', label: 'Threads' },
                        { value: 'bluesky', label: 'Bluesky' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'substack', label: 'Substack' },
                        { value: 'whatsapp', label: 'WhatsApp' },
                        { value: 'email', label: 'Email' },
                        { value: 'custom', label: 'Custom' },
                      ].map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-4">
                  <Label className="text-xs">URL</Label>
                  <Input
                    placeholder="https://example.com/your-profile"
                    value={s.url || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setConfig(prev => ({
                        ...prev,
                        socialMediaLinks: (prev.socialMediaLinks || []).map((x, idx) => idx === i ? { ...x, url: val } : x)
                      }))
                      if (val && !isValidUrl(val)) {
                        setSocialUrlErrors(prev => ({ ...prev, [i]: 'Please enter a valid HTTPS URL (e.g., https://example.com)' }))
                      } else {
                        setSocialUrlErrors(prev => {
                          const next = { ...prev }
                          delete next[i]
                          return next
                        })
                      }
                    }}
                    className="h-9 text-sm md:h-8 md:text-xs"
                  />
                  {socialUrlErrors[i] ? (
                    <p className="text-xs text-red-500 mt-1">{socialUrlErrors[i]}</p>
                  ) : null}
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfig(prev => ({
                  ...prev,
                  socialMediaLinks: [...(prev.socialMediaLinks || []), { platform: 'custom', url: '' }]
                }))}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Link
              </Button>
              <Button onClick={saveConfig} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
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
                  <Label>Enable Newsletters</Label>
                  <p className="text-sm text-muted-foreground">Allow users to subscribe to newsletters</p>
                </div>
                <Switch
                  checked={config.featureFlags.enableNewsletters}
                  onCheckedChange={(checked) => updateFeatureFlag('enableNewsletters', checked)}
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

        <TabsContent value="ads" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Advertisement Networks
              </CardTitle>
              <CardDescription>Configure ad networks and monetization providers for your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Global Ads Enable/Disable */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Advertisements</Label>
                    <p className="text-sm text-muted-foreground">Enable or disable all advertisements on your site</p>
                  </div>
                  <Switch
                    checked={config.ads.enabled}
                    onCheckedChange={updateAdsEnabled}
                  />
                </div>
              </div>

              {config.ads.enabled && (
                <>
                  <Separator />
                  
                  {/* Google Ads */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Google Ads</Label>
                        <p className="text-sm text-muted-foreground">Google AdSense and Ad Manager integration</p>
                      </div>
                      <Switch
                        checked={config.ads.googleAds.enabled}
                        onCheckedChange={(checked) => updateAds('googleAds', 'enabled', checked)}
                      />
                    </div>
                    {config.ads.googleAds.enabled && (
                      <div className="space-y-2 pl-4 border-l-2 border-muted">
                        <Label htmlFor="google-ads-client-id">Client ID</Label>
                        <Input
                          id="google-ads-client-id"
                          value={config.ads.googleAds.clientId || ''}
                          onChange={(e) => updateAds('googleAds', 'clientId', e.target.value)}
                          placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* AdThrive */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>AdThrive</Label>
                        <p className="text-sm text-muted-foreground">Premium ad management platform</p>
                      </div>
                      <Switch
                        checked={config.ads.adThrive.enabled}
                        onCheckedChange={(checked) => updateAds('adThrive', 'enabled', checked)}
                      />
                    </div>
                    {config.ads.adThrive.enabled && (
                      <div className="space-y-2 pl-4 border-l-2 border-muted">
                        <Label htmlFor="adthrive-site-id">Site ID</Label>
                        <Input
                          id="adthrive-site-id"
                          value={config.ads.adThrive.siteId || ''}
                          onChange={(e) => updateAds('adThrive', 'siteId', e.target.value)}
                          placeholder="Enter AdThrive site ID"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Mediavine */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mediavine</Label>
                        <p className="text-sm text-muted-foreground">Full-service ad management network</p>
                      </div>
                      <Switch
                        checked={config.ads.mediavine.enabled}
                        onCheckedChange={(checked) => updateAds('mediavine', 'enabled', checked)}
                      />
                    </div>
                    {config.ads.mediavine.enabled && (
                      <div className="space-y-2 pl-4 border-l-2 border-muted">
                        <Label htmlFor="mediavine-site-id">Site ID</Label>
                        <Input
                          id="mediavine-site-id"
                          value={config.ads.mediavine.siteId || ''}
                          onChange={(e) => updateAds('mediavine', 'siteId', e.target.value)}
                          placeholder="Enter Mediavine site ID"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Ezoic */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Ezoic</Label>
                        <p className="text-sm text-muted-foreground">AI-powered ad optimization platform</p>
                      </div>
                      <Switch
                        checked={config.ads.ezoic.enabled}
                        onCheckedChange={(checked) => updateAds('ezoic', 'enabled', checked)}
                      />
                    </div>
                    {config.ads.ezoic.enabled && (
                      <div className="space-y-2 pl-4 border-l-2 border-muted">
                        <Label htmlFor="ezoic-site-id">Site ID</Label>
                        <Input
                          id="ezoic-site-id"
                          value={config.ads.ezoic.siteId || ''}
                          onChange={(e) => updateAds('ezoic', 'siteId', e.target.value)}
                          placeholder="Enter Ezoic site ID"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Carbon Ads */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Carbon Ads</Label>
                        <p className="text-sm text-muted-foreground">Developer-focused ad network</p>
                      </div>
                      <Switch
                        checked={config.ads.carbonAds.enabled}
                        onCheckedChange={(checked) => updateAds('carbonAds', 'enabled', checked)}
                      />
                    </div>
                    {config.ads.carbonAds.enabled && (
                      <div className="space-y-2 pl-4 border-l-2 border-muted">
                        <Label htmlFor="carbon-zone-id">Zone ID</Label>
                        <Input
                          id="carbon-zone-id"
                          value={config.ads.carbonAds.zoneId || ''}
                          onChange={(e) => updateAds('carbonAds', 'zoneId', e.target.value)}
                          placeholder="Enter Carbon Ads zone ID"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* BuySellAds */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>BuySellAds</Label>
                        <p className="text-sm text-muted-foreground">Premium advertising marketplace</p>
                      </div>
                      <Switch
                        checked={config.ads.buysellads.enabled}
                        onCheckedChange={(checked) => updateAds('buysellads', 'enabled', checked)}
                      />
                    </div>
                    {config.ads.buysellads.enabled && (
                      <div className="space-y-2 pl-4 border-l-2 border-muted">
                        <Label htmlFor="buysellads-network-id">Network ID</Label>
                        <Input
                          id="buysellads-network-id"
                          value={config.ads.buysellads.networkId || ''}
                          onChange={(e) => updateAds('buysellads', 'networkId', e.target.value)}
                          placeholder="Enter BuySellAds network ID"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <Button onClick={saveConfig} disabled={saving} className="w-full mt-6">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Ad Configuration'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
