"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Globe,
  Link,
  Palette,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Rocket,
  Users,
  Heart,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useOnboarding, useSlugCheck } from "@/hooks/use-onboarding"

// Mock themes data - will be replaced with API
const mockThemes = [
  {
    id: "1",
    name: "Minimal",
    description: "Clean and simple design focused on content",
    preview: "bg-gradient-to-br from-slate-50 to-slate-100",
    accent: "bg-slate-900",
    category: "Professional"
  },
  {
    id: "2",
    name: "TechHub",
    description: "Modern tech-focused design with dark elements",
    preview: "bg-gradient-to-br from-blue-900 to-purple-900",
    accent: "bg-cyan-400",
    category: "Tech"
  },
  {
    id: "3",
    name: "Creative",
    description: "Vibrant and artistic design for creative professionals",
    preview: "bg-gradient-to-br from-pink-400 to-orange-400",
    accent: "bg-white",
    category: "Creative"
  },
  {
    id: "4",
    name: "Business Pro",
    description: "Professional business-focused design",
    preview: "bg-gradient-to-br from-gray-800 to-gray-900",
    accent: "bg-yellow-400",
    category: "Business"
  },
  {
    id: "5",
    name: "Nature",
    description: "Earth-toned design inspired by nature",
    preview: "bg-gradient-to-br from-green-600 to-emerald-700",
    accent: "bg-green-200",
    category: "Lifestyle"
  },
  {
    id: "6",
    name: "Elegant",
    description: "Sophisticated and refined design",
    preview: "bg-gradient-to-br from-purple-800 to-indigo-900",
    accent: "bg-purple-300",
    category: "Professional"
  }
]

interface OnboardingData {
  companyName: string
  website: string
  blogSlug: string
  selectedTheme: string
  description: string
}

interface OnboardingOverlayProps {
  isOpen: boolean
  onClose: () => void
  isRequired?: boolean
}

export function OnboardingOverlay({ isOpen, onClose, isRequired = false }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { hasCompletedOnboarding, isOnboarded } = useOnboarding()
  const { checkSlug, result: slugResult, clearResult } = useSlugCheck()
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companyName: "",
    website: "",
    blogSlug: "",
    selectedTheme: "",
    description: ""
  })

  // Auto-close overlay when onboarding is completed
  useEffect(() => {
    if (isOnboarded && isOpen) {
      onClose()
    }
  }, [isOnboarded, isOpen, onClose])

  const steps = [
    {
      id: "company",
      title: "Company Information",
      description: "Tell us about your company",
      icon: Building2,
      fields: ["companyName", "website", "description"]
    },
    {
      id: "blog",
      title: "Your Blog Address",
      description: "Choose your unique blog URL",
      icon: Globe,
      fields: ["blogSlug"]
    },
    {
      id: "theme",
      title: "Choose Your Theme",
      description: "Select a beautiful theme for your blog",
      icon: Palette,
      fields: ["selectedTheme"]
    },
    {
      id: "complete",
      title: "You're All Set!",
      description: "Welcome to BlazeBlog",
      icon: Rocket,
      fields: []
    }
  ]

  const validateStep = (stepIndex: number): boolean => {
    const step = steps[stepIndex]
    
    switch (step.id) {
      case "company":
        return onboardingData.companyName.trim().length > 0
      case "blog":
        return onboardingData.blogSlug.trim().length >= 3 && 
               /^[a-z0-9-]+$/.test(onboardingData.blogSlug) && 
               !slugResult.exists && 
               !slugResult.isChecking
      case "theme":
        return onboardingData.selectedTheme.length > 0
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    } else {
      toast({
        title: "Please complete all required fields",
        description: "Make sure all required information is filled out correctly.",
        variant: "destructive"
      })
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleComplete = async () => {
    setIsLoading(true)
    
    try {
      // Call the complete-onboarding API with proper data structure
      await hasCompletedOnboarding({
        companyName: onboardingData.companyName,
        blogUrl: `${onboardingData.blogSlug}.blazeblog.xyz`,
        themeId: parseInt(onboardingData.selectedTheme)
      })
      
      toast({
        title: "🎉 Welcome to BlazeBlog!",
        description: `Your blog at ${onboardingData.blogSlug}.blazeblog.xyz has been set up successfully!`,
        variant: "default"
      })
      
      // Close the overlay with a small delay to show the success message
      setTimeout(() => {
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Onboarding error:', error)
      toast({
        title: "Setup Error",
        description: "There was an issue setting up your blog. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSlugChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "")
    setOnboardingData(prev => ({ ...prev, blogSlug: sanitized }))
    
    // Check slug availability with debouncing
    if (sanitized.trim().length >= 3) {
      checkSlug(sanitized)
    } else {
      clearResult()
    }
  }

  const handleClose = () => {
    if (isRequired) {
      // If onboarding is required, just hide temporarily and show a helpful message
      setIsHidden(true)
      toast({
        title: "Setup Required",
        description: "Please complete the setup to get started with BlazeBlog. We'll be right here when you're ready!",
        variant: "default"
      })
      
      // Show again after 5 seconds
      setTimeout(() => {
        setIsHidden(false)
      }, 5000)
    } else {
      // If not required, close permanently
      onClose()
    }
  }

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  if (!isOpen) return null

  // Show floating reminder when hidden but required
  if (isHidden && isRequired) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-purple-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Complete your setup
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We'll be back in a moment
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsHidden(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Liquid Glass Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-pink-400/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-blue-400/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-purple-300/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Onboarding Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20 shadow-2xl">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 hover:bg-black/5 dark:hover:bg-white/5"
            title={isRequired ? "Hide temporarily (will return in 5 seconds)" : "Close onboarding"}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header with Progress */}
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-t-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to BlazeBlog!
            </CardTitle>
            <CardDescription className="text-base">
              Let's set up your blog in just a few steps
            </CardDescription>

            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index === currentStep
                  const isCompleted = index < currentStep
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted 
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg" 
                          : isActive 
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110" 
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-8 h-0.5 mx-2 transition-all duration-500 ${
                          index < currentStep ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}: {currentStepData.title}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Step Content */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentStepData.description}
                </p>
              </div>

              {/* Step 1: Company Information */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium">
                      Company Name *
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Enter your company name"
                      value={onboardingData.companyName}
                      onChange={(e) => setOnboardingData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium">
                      Website (Optional)
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://yourcompany.com"
                      value={onboardingData.website}
                      onChange={(e) => setOnboardingData(prev => ({ ...prev, website: e.target.value }))}
                      className="h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Company Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your company..."
                      value={onboardingData.description}
                      onChange={(e) => setOnboardingData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="resize-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Blog URL */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="blogSlug" className="text-sm font-medium">
                      Choose Your Blog URL *
                    </Label>
                    
                    <div className="relative">
                      <Input
                        id="blogSlug"
                        placeholder="your-blog-name"
                        value={onboardingData.blogSlug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className={`h-12 pr-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm ${
                          onboardingData.blogSlug.length >= 3 && slugResult.exists
                            ? "border-red-300 focus:border-red-500" 
                            : onboardingData.blogSlug.length >= 3 && !slugResult.exists && !slugResult.isChecking
                            ? "border-green-300 focus:border-green-500"
                            : ""
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm px-2 py-1 rounded">
                        .blazeblog.xyz
                      </div>
                    </div>
                    
                    {/* Slug status indicator */}
                    {onboardingData.blogSlug.length >= 3 && (
                      <div className="mt-2">
                        {slugResult.isChecking ? (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600" />
                            <span className="text-sm">Checking availability...</span>
                          </div>
                        ) : slugResult.error ? (
                          <div className="flex items-center space-x-2 text-red-600">
                            <X className="h-3 w-3" />
                            <span className="text-sm">Error checking availability</span>
                          </div>
                        ) : slugResult.exists ? (
                          <div className="flex items-center space-x-2 text-red-600">
                            <X className="h-3 w-3" />
                            <span className="text-sm">This URL is already taken</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span className="text-sm">Available!</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {onboardingData.blogSlug && (
                      <div className="p-4 bg-blue-50/80 dark:bg-blue-950/50 backdrop-blur-sm rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-center space-x-2">
                          <Link className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Your blog will be available at:
                          </span>
                        </div>
                        <p className="text-lg font-mono text-blue-900 dark:text-blue-100 mt-1">
                          {onboardingData.blogSlug}.blazeblog.xyz
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-amber-50/80 dark:bg-amber-950/50 backdrop-blur-sm border border-amber-200/50 dark:border-amber-800/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-amber-100/80 dark:bg-amber-900/80 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-amber-600 rounded-full" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Important Notes:
                        </p>
                        <ul className="mt-1 text-sm text-amber-700 dark:text-amber-300 space-y-1">
                          <li>• This name cannot be changed later</li>
                          <li>• You can connect a custom domain later</li>
                          <li>• Use only lowercase letters, numbers, and hyphens</li>
                          <li>• Minimum 3 characters required</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Theme Selection */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose a beautiful theme that represents your brand
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2">
                    {mockThemes.map((theme) => (
                      <div
                        key={theme.id}
                        onClick={() => setOnboardingData(prev => ({ ...prev, selectedTheme: theme.id }))}
                        className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                          onboardingData.selectedTheme === theme.id
                            ? "border-purple-500 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        {/* Theme Preview */}
                        <div className={`h-20 rounded-t-xl ${theme.preview} relative overflow-hidden`}>
                          <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${theme.accent}`} />
                          <div className={`absolute top-2 right-2 w-12 h-1.5 rounded ${theme.accent} opacity-60`} />
                          <div className={`absolute bottom-2 left-2 w-16 h-1 rounded ${theme.accent} opacity-40`} />
                          <div className={`absolute bottom-4 left-2 w-10 h-1 rounded ${theme.accent} opacity-40`} />
                        </div>
                        
                        {/* Theme Info */}
                        <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-b-xl">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{theme.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {theme.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {theme.description}
                          </p>
                        </div>
                        
                        {/* Selection Indicator */}
                        {onboardingData.selectedTheme === theme.id && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Completion */}
              {currentStep === 3 && (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      🎉 Everything looks perfect!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Your blog is ready to be created. This will only take a moment...
                    </p>
                  </div>
                  
                  {/* Setup Summary */}
                  <div className="bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 text-left max-w-md mx-auto">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Setup Summary:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Company:</span>
                        <span className="font-medium">{onboardingData.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Blog URL:</span>
                        <span className="font-medium font-mono text-xs">{onboardingData.blogSlug}.blazeblog.xyz</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Theme:</span>
                        <span className="font-medium">
                          {mockThemes.find(t => t.id === onboardingData.selectedTheme)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={isFirstStep}
                  className="px-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {isLastStep ? (
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Launch My Blog!
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}