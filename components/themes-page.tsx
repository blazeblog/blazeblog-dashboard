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
      const selectedPalette = palette || themePalettes[themeId] || 'light'
      await api.patch('/customer/theme', {
        themeId,
        colorPalette: selectedPalette
      })
      
      setSelectedThemeId(themeId)
      setColorPalette(selectedPalette)
      
      toast({
        title: "Success!",
        description: `Theme "${themes.find(t => t.id === themeId)?.name}" with "${selectedPalette}" palette has been applied successfully.`,
        variant: "default",
        duration: 3000
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
    { value: 'light', label: 'light', description: 'Clean and bright appearance', colors: ['#3b82f6', '#ec4899', '#10b981', '#374151'] },
    { value: 'dark', label: 'dark', description: 'Easy on the eyes', colors: ['#3b82f6', '#ec4899', '#10b981', '#ffffff'] },
    { value: 'cupcake', label: 'cupcake', description: 'Sweet and colorful', colors: ['#10b981', '#ec4899', '#f59e0b', '#374151'] },
    { value: 'bumblebee', label: 'bumblebee', description: 'Bright and energetic', colors: ['#f59e0b', '#f97316', '#000000', '#6b7280'] },
    { value: 'emerald', label: 'emerald', description: 'Nature-inspired green', colors: ['#10b981', '#3b82f6', '#f97316', '#374151'] },
    { value: 'corporate', label: 'corporate', description: 'Professional business theme', colors: ['#0ea5e9', '#6b7280', '#10b981', '#000000'] },
    { value: 'synthwave', label: 'synthwave', description: 'Retro futuristic vibes', colors: ['#ec4899', '#0ea5e9', '#f59e0b', '#3b82f6'] },
    { value: 'retro', label: 'retro', description: 'Vintage inspired design', colors: ['#dc2626', '#10b981', '#f59e0b', '#6b7280'] },
    { value: 'cyberpunk', label: 'cyberpunk', description: 'High-tech dystopian feel', colors: ['#ec4899', '#0ea5e9', '#ec4899', '#f59e0b'] },
    { value: 'valentine', label: 'valentine', description: 'Romantic pink theme', colors: ['#ec4899', '#a855f7', '#0ea5e9', '#a855f7'] },
    { value: 'halloween', label: 'halloween', description: 'Spooky orange and black', colors: ['#f97316', '#a855f7', '#22c55e', '#ffffff'] },
    { value: 'garden', label: 'garden', description: 'Fresh garden colors', colors: ['#ec4899', '#6b7280', '#22c55e', '#ffffff'] },
    { value: 'forest', label: 'forest', description: 'Deep forest greens', colors: ['#22c55e', '#22c55e', '#22c55e', '#ffffff'] },
    { value: 'aqua', label: 'aqua', description: 'Ocean-inspired blues', colors: ['#0ea5e9', '#6b7280', '#000000', '#3b82f6'] },
    { value: 'lofi', label: 'lofi', description: 'Muted and relaxed', colors: ['#000000', '#6b7280', '#9ca3af', '#d1d5db'] },
    { value: 'pastel', label: 'pastel', description: 'Soft pastel colors', colors: ['#a855f7', '#ec4899', '#10b981', '#6b7280'] },
    { value: 'fantasy', label: 'fantasy', description: 'Magical fantasy theme', colors: ['#a855f7', '#0ea5e9', '#f59e0b', '#000000'] },
    { value: 'wireframe', label: 'wireframe', description: 'Minimalist wireframe style', colors: ['#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'] },
    { value: 'black', label: 'black', description: 'Pure black theme', colors: ['#ffffff', '#9ca3af', '#d1d5db', '#e5e7eb'] },
    { value: 'luxury', label: 'luxury', description: 'Premium luxury feel', colors: ['#ffffff', '#3b82f6', '#a855f7', '#f59e0b'] },
    { value: 'dracula', label: 'dracula', description: 'Dark vampire theme', colors: ['#ec4899', '#a855f7', '#f59e0b', '#ffffff'] },
    { value: 'cmyk', label: 'cmyk', description: 'Print-inspired colors', colors: ['#0ea5e9', '#ec4899', '#f59e0b', '#000000'] },
    { value: 'autumn', label: 'autumn', description: 'Warm autumn colors', colors: ['#dc2626', '#dc2626', '#f59e0b', '#6b7280'] },
    { value: 'business', label: 'business', description: 'Professional business', colors: ['#3b82f6', '#6b7280', '#f97316', '#ffffff'] },
    { value: 'acid', label: 'acid', description: 'Bright neon colors', colors: ['#ec4899', '#f59e0b', '#84cc16', '#3b82f6'] },
    { value: 'lemonade', label: 'lemonade', description: 'Fresh lemon yellow', colors: ['#84cc16', '#000000', '#f59e0b', '#374151'] },
    { value: 'night', label: 'night', description: 'Deep night colors', colors: ['#3b82f6', '#6b7280', '#ec4899', '#ffffff'] },
    { value: 'coffee', label: 'coffee', description: 'Rich coffee browns', colors: ['#f59e0b', '#6b7280', '#0ea5e9', '#ffffff'] },
    { value: 'winter', label: 'winter', description: 'Cool winter palette', colors: ['#3b82f6', '#6b7280', '#ec4899', '#3b82f6'] },
    { value: 'dim', label: 'dim', description: 'Dimmed color scheme', colors: ['#10b981', '#f97316', '#a855f7', '#ffffff'] },
    { value: 'nord', label: 'nord', description: 'Arctic nord palette', colors: ['#3b82f6', '#6b7280', '#9ca3af', '#d1d5db'] },
    { value: 'sunset', label: 'sunset', description: 'Warm sunset colors', colors: ['#f97316', '#ec4899', '#a855f7', '#ffffff'] },
    { value: 'caramellatte', label: 'caramellatte', description: 'Creamy caramel tones', colors: ['#000000', '#6b7280', '#f59e0b', '#dc2626'] },
    { value: 'abyss', label: 'abyss', description: 'Deep abyss theme', colors: ['#84cc16', '#a855f7', '#ffffff', '#0ea5e9'] },
    { value: 'silk', label: 'silk', description: 'Smooth silk texture', colors: ['#f59e0b', '#f97316', '#0ea5e9', '#ffffff'] }
  ]

  const openPreview = (theme: Theme) => {
    setPreviewTheme(theme)
    setShowMobileView(false)
  }

  const closePreview = () => {
    setPreviewTheme(null)
  }

  const groupedThemes = themes.reduce((acc, theme) => {
    const category = theme.category || 'Default'
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
                      value={themePalettes[theme.id] || 'light'}
                      onValueChange={(value) => updateThemePalette(theme.id, value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorPaletteOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                {option.colors.map((color, index) => (
                                  <div 
                                    key={index}
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium capitalize">{option.label}</span>
                                <span className="text-xs text-muted-foreground">{option.description}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    {(() => {
                      const isCurrentTheme = selectedThemeId === theme.id
                      const currentPalette = themePalettes[theme.id] || 'light'
                      const isPaletteChanged = isCurrentTheme && currentPalette !== colorPalette
                      const showApplyButton = !isCurrentTheme || isPaletteChanged
                      
                      return (
                        <Button
                          className="flex-1"
                          onClick={() => selectTheme(theme.id, currentPalette)}
                          disabled={applying === theme.id}
                          variant={showApplyButton ? "default" : "secondary"}
                        >
                          {applying === theme.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Applying...
                            </>
                          ) : showApplyButton ? (
                            "Apply Theme"
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Applied
                            </>
                          )}
                        </Button>
                      )
                    })()}
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
                    value={themePalettes[previewTheme.id] || 'light'}
                    onValueChange={(value) => updateThemePalette(previewTheme.id, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorPaletteOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {option.colors.map((color, index) => (
                                <div 
                                  key={index}
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium capitalize">{option.label}</span>
                              <span className="text-xs text-muted-foreground">{option.description}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {(() => {
                  const isCurrentTheme = selectedThemeId === previewTheme.id
                  const currentPalette = themePalettes[previewTheme.id] || 'light'
                  const isPaletteChanged = isCurrentTheme && currentPalette !== colorPalette
                  const showApplyButton = !isCurrentTheme || isPaletteChanged
                  
                  return (
                    <Button
                      onClick={() => {
                        selectTheme(previewTheme.id, currentPalette)
                        closePreview()
                      }}
                      disabled={applying === previewTheme.id}
                      variant={showApplyButton ? "default" : "secondary"}
                    >
                      {applying === previewTheme.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : showApplyButton ? (
                        "Apply This Theme"
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Applied
                        </>
                      )}
                    </Button>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
