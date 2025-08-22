"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Palette, Check, Eye, Monitor, Smartphone, ExternalLink, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useClientApi } from "@/lib/client-api"
import { getImageUrl } from "@/lib/image-utils"

interface Theme {
  id: number
  name: string
  description: string
  previewImageUrl: string | null
  mobileViewImages: string[] | null
  desktopViewImages: string[] | null
  category: string | null
  demoUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loadingThemes, setLoadingThemes] = useState(true)
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null)
  const [colorPalette, setColorPalette] = useState<string>('')
  const [themePalettes, setThemePalettes] = useState<Record<number, string>>({})
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null)
  const [showMobileView, setShowMobileView] = useState(false)
  const [applying, setApplying] = useState<number | null>(null)
  const api = useClientApi()
  const { toast } = useToast()

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    setLoadingThemes(true)
    try {
      const response = await api.get<{ 
        data: { 
          themes: Theme[], 
          total: number,
          currentTheme?: { themeId: number, colorPalette?: string }
        } 
      }>('/customer/themes')
      const data = response.data || response
      const themes = data.themes || []
      setThemes(Array.isArray(themes) ? themes : [])
      
      if (data.currentTheme) {
        setSelectedThemeId(data.currentTheme.themeId)
        setColorPalette(data.currentTheme.colorPalette || '')
        setThemePalettes(prev => ({
          ...prev,
          [data.currentTheme!.themeId]: data.currentTheme!.colorPalette || 'light'
        }))
      }
    } catch (error) {
      console.error('Error fetching themes:', error)
      toast({
        title: "Error",
        description: "Failed to load themes. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingThemes(false)
    }
  }

  const selectTheme = async (themeId: number, palette?: string) => {
    setApplying(themeId)
    try {
      const selectedPalette = palette || themePalettes[themeId] || ''
      await api.patch('/customer/theme', {
        themeId,
        colorPalette: selectedPalette
      })
      
      setSelectedThemeId(themeId)
      setColorPalette(selectedPalette)
      
      toast({
        title: "Success!",
        description: "Theme has been applied successfully.",
        variant: "default"
      })
    } catch (error) {
      console.error('Error selecting theme:', error)
      toast({
        title: "Error",
        description: "Failed to apply theme. Please try again.",
        variant: "destructive"
      })
    } finally {
      setApplying(null)
    }
  }

  const updateThemePalette = (themeId: number, palette: string) => {
    setThemePalettes(prev => ({
      ...prev,
      [themeId]: palette
    }))
  }

  const colorPaletteOptions = [
    { value: 'light', label: 'Light', description: 'Clean and bright appearance' },
    { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
    { value: 'auto', label: 'Auto', description: 'Follows system preference' },
    { value: 'blue', label: 'Blue', description: 'Professional blue theme' },
    { value: 'green', label: 'Green', description: 'Nature-inspired theme' },
    { value: 'purple', label: 'Purple', description: 'Creative purple theme' },
  ]

  const openPreview = (theme: Theme) => {
    setPreviewTheme(theme)
    setShowMobileView(false)
  }

  const closePreview = () => {
    setPreviewTheme(null)
  }

  const groupedThemes = themes.reduce((acc, theme) => {
    const category = theme.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(theme)
    return acc
  }, {} as Record<string, Theme[]>)

  if (loadingThemes) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Themes</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Palette className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Themes</h1>
        <Badge variant="secondary" className="ml-2">
          {themes.length} Available
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground">
        Choose from our collection of beautiful, responsive themes to customize your blog's appearance.
      </div>

      {Object.entries(groupedThemes).map(([category, categoryThemes]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-semibold capitalize">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryThemes.map((theme) => (
              <Card key={theme.id} className={`relative transition-all hover:shadow-lg ${
                selectedThemeId === theme.id ? 'ring-2 ring-primary' : ''
              }`}>
                {selectedThemeId === theme.id && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                )}
                
                <div className="relative group">
                  <img
                    src={getImageUrl(theme.previewImageUrl) || '/placeholder.jpg'}
                    alt={theme.name}
                    className="aspect-video w-full object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openPreview(theme)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    {theme.demoUrl && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(theme.demoUrl!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Demo
                      </Button>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{theme.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{theme.description}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Color Palette</Label>
                    <Select
                      value={selectedThemeId === theme.id ? colorPalette : (themePalettes[theme.id] || 'light')}
                      onValueChange={(value) => updateThemePalette(theme.id, value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorPaletteOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{option.label}</span>
                              <span className="text-xs text-muted-foreground">{option.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => selectTheme(theme.id)}
                      disabled={applying === theme.id}
                      variant={selectedThemeId === theme.id ? "secondary" : "default"}
                    >
                      {applying === theme.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : selectedThemeId === theme.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Applied
                        </>
                      ) : (
                        "Apply Theme"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {themes.length === 0 && !loadingThemes && (
        <Card className="p-8 text-center">
          <CardContent className="space-y-4">
            <Palette className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold">No themes available</h3>
              <p className="text-sm text-muted-foreground">Check back later for new themes!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {previewTheme && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{previewTheme.name}</h3>
                <p className="text-sm text-muted-foreground">{previewTheme.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileView(!showMobileView)}
                  className={showMobileView ? "bg-accent" : ""}
                >
                  {showMobileView ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                  {showMobileView ? "Desktop" : "Mobile"}
                </Button>
                <Button variant="outline" size="sm" onClick={closePreview}>
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
              <div className={`mx-auto ${showMobileView ? 'max-w-sm' : 'w-full'}`}>
                <img
                  src={showMobileView ? 
                    (getImageUrl(previewTheme.mobileViewImages?.[0]) || getImageUrl(previewTheme.previewImageUrl) || '/placeholder.jpg') : 
                    (getImageUrl(previewTheme.desktopViewImages?.[0]) || getImageUrl(previewTheme.previewImageUrl) || '/placeholder.jpg')
                  }
                  alt={`${previewTheme.name} ${showMobileView ? 'mobile' : 'desktop'} preview`}
                  className="w-full h-auto rounded-lg border"
                />
              </div>
            </div>

            <div className="p-4 border-t flex justify-between items-center gap-4">
              <div className="flex gap-2">
                {previewTheme.demoUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(previewTheme.demoUrl!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Demo
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 min-w-[150px]">
                  <Label className="text-xs">Color Palette</Label>
                  <Select
                    value={selectedThemeId === previewTheme.id ? colorPalette : (themePalettes[previewTheme.id] || 'light')}
                    onValueChange={(value) => updateThemePalette(previewTheme.id, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorPaletteOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={() => {
                    selectTheme(previewTheme.id)
                    closePreview()
                  }}
                  disabled={applying === previewTheme.id}
                >
                  {applying === previewTheme.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : selectedThemeId === previewTheme.id ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Applied
                    </>
                  ) : (
                    "Apply This Theme"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
