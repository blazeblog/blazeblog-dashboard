"use client"

import type React from "react"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Save, Upload, Palette, Globe, Shield, Database, Code, ImageIcon, SettingsIcon } from "lucide-react"

const themes = [
  { id: "default", name: "Default", preview: "bg-gradient-to-br from-blue-500 to-purple-600" },
  { id: "dark", name: "Dark Mode", preview: "bg-gradient-to-br from-gray-800 to-gray-900" },
  { id: "minimal", name: "Minimal", preview: "bg-gradient-to-br from-gray-100 to-white" },
  { id: "nature", name: "Nature", preview: "bg-gradient-to-br from-green-400 to-blue-500" },
  { id: "sunset", name: "Sunset", preview: "bg-gradient-to-br from-orange-400 to-pink-500" },
  { id: "ocean", name: "Ocean", preview: "bg-gradient-to-br from-blue-400 to-teal-500" },
  { id: "forest", name: "Forest", preview: "bg-gradient-to-br from-green-600 to-green-800" },
  { id: "corporate", name: "Corporate", preview: "bg-gradient-to-br from-blue-600 to-indigo-700" },
]

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
]

const timezones = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
]

export default function SettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState("default")
  const [settings, setSettings] = useState({
    siteName: "My Blog",
    siteDescription: "A modern blog built with Next.js",
    siteUrl: "https://myblog.com",
    adminEmail: "admin@myblog.com",
    language: "en",
    timezone: "UTC",
    allowRegistration: true,
    requireEmailVerification: true,
    enableComments: true,
    moderateComments: false,
    enableSEO: true,
    enableAnalytics: false,
    maintenanceMode: false,
    enableNotifications: true,
    logo: null as File | null,
    favicon: null as File | null,
    customCSS: "",
    customJS: "",
    socialLinks: {
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      github: "",
    },
  })

  const handleFileUpload = (type: "logo" | "favicon") => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSettings((prev) => ({ ...prev, [type]: file }))
    }
  }

  const handleSave = () => {
    // Here you would send the settings to your NestJS backend
    console.log("Saving settings:", settings)
    // Example API call:
    // await fetch('/api/settings', { method: 'POST', body: JSON.stringify(settings) })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
            <p className="text-muted-foreground">Customize your site's appearance and functionality</p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <Globe className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Database className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Code className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Site Information</CardTitle>
                  <CardDescription>Basic information about your site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings((prev) => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings((prev) => ({ ...prev, siteDescription: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      type="url"
                      value={settings.siteUrl}
                      onChange={(e) => setSettings((prev) => ({ ...prev, siteUrl: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => setSettings((prev) => ({ ...prev, adminEmail: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Localization</CardTitle>
                  <CardDescription>Language and regional settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => setSettings((prev) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => setSettings((prev) => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Selection</CardTitle>
                  <CardDescription>Choose a theme for your site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {themes.map((theme) => (
                      <div
                        key={theme.id}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                          selectedTheme === theme.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedTheme(theme.id)}
                      >
                        <div className={`h-16 w-full rounded-md ${theme.preview} mb-2`} />
                        <p className="text-sm font-medium text-center">{theme.name}</p>
                        {selectedTheme === theme.id && <Badge className="absolute -top-2 -right-2">Selected</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Logo & Branding</CardTitle>
                    <CardDescription>Upload your site logo and favicon</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="logo">Site Logo</Label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                          {settings.logo ? (
                            <img
                              src={URL.createObjectURL(settings.logo) || "/placeholder.svg"}
                              alt="Logo preview"
                              className="h-full w-full object-contain rounded-lg"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id="logo"
                            accept="image/*"
                            onChange={handleFileUpload("logo")}
                            className="hidden"
                          />
                          <Button variant="outline" size="sm" asChild>
                            <label htmlFor="logo" className="cursor-pointer gap-2">
                              <Upload className="h-4 w-4" />
                              Upload Logo
                            </label>
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="favicon">Favicon</Label>
                      <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded border-2 border-dashed border-border flex items-center justify-center">
                          {settings.favicon ? (
                            <img
                              src={URL.createObjectURL(settings.favicon) || "/placeholder.svg"}
                              alt="Favicon preview"
                              className="h-full w-full object-contain rounded"
                            />
                          ) : (
                            <ImageIcon className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id="favicon"
                            accept="image/*"
                            onChange={handleFileUpload("favicon")}
                            className="hidden"
                          />
                          <Button variant="outline" size="sm" asChild>
                            <label htmlFor="favicon" className="cursor-pointer gap-2">
                              <Upload className="h-4 w-4" />
                              Upload Favicon
                            </label>
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">ICO, PNG 32x32px</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                    <CardDescription>Add links to your social media profiles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(settings.socialLinks).map(([platform, url]) => (
                      <div key={platform} className="space-y-2">
                        <Label htmlFor={platform} className="capitalize">
                          {platform}
                        </Label>
                        <Input
                          id={platform}
                          type="url"
                          placeholder={`https://${platform}.com/username`}
                          value={url}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, [platform]: e.target.value },
                            }))
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>Configure how content is displayed and managed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Comments</Label>
                    <p className="text-sm text-muted-foreground">Allow visitors to comment on posts</p>
                  </div>
                  <Switch
                    checked={settings.enableComments}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, enableComments: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Moderate Comments</Label>
                    <p className="text-sm text-muted-foreground">Require approval before comments are published</p>
                  </div>
                  <Switch
                    checked={settings.moderateComments}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, moderateComments: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SEO Optimization</Label>
                    <p className="text-sm text-muted-foreground">Enable SEO meta tags and optimization</p>
                  </div>
                  <Switch
                    checked={settings.enableSEO}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, enableSEO: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">Enable Google Analytics tracking</p>
                  </div>
                  <Switch
                    checked={settings.enableAnalytics}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, enableAnalytics: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow User Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to register accounts</p>
                  </div>
                  <Switch
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, allowRegistration: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, requireEmailVerification: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure email and push notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, enableNotifications: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom CSS</CardTitle>
                  <CardDescription>Add custom CSS to customize your site's appearance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="/* Add your custom CSS here */"
                    value={settings.customCSS}
                    onChange={(e) => setSettings((prev) => ({ ...prev, customCSS: e.target.value }))}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom JavaScript</CardTitle>
                  <CardDescription>Add custom JavaScript for advanced functionality</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="// Add your custom JavaScript here"
                    value={settings.customJS}
                    onChange={(e) => setSettings((prev) => ({ ...prev, customJS: e.target.value }))}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
