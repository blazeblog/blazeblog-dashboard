"use client"

import { useState, useEffect } from "react"
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
  Heart,
  X,
  Star,
  Zap,
  Crown,
  Wand2,
  Sparkle
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
      description: "Tell us about your company and what makes it unique. This helps us personalize your blog experience.",
      icon: Building2,
      fields: ["companyName", "website", "description"],
      tips: [
        "Your company name will appear in your blog header",
        "Website is optional but helps with branding",
        "Description helps visitors understand your business"
      ]
    },
    {
      id: "blog",
      title: "Choose Your Blog Address",
      description: "Pick a unique URL for your blog. This will be your blog's permanent address on the web.",
      icon: Globe,
      fields: ["blogSlug"],
      tips: [
        "This cannot be changed later, so choose carefully",
        "Use lowercase letters, numbers, and hyphens only",
        "Keep it short and memorable",
        "You can connect a custom domain later"
      ]
    },
    {
      id: "theme",
      title: "Select Your Theme",
      description: "Choose a beautiful theme that matches your brand and style. You can always change this later.",
      icon: Palette,
      fields: ["selectedTheme"],
      tips: [
        "Each theme is fully customizable",
        "You can change themes anytime",
        "All themes are mobile-responsive",
        "Custom CSS options available"
      ]
    },
    {
      id: "complete",
      title: "Ready to Launch!",
      description: "Your blog is ready to be created. We'll set everything up for you in just a moment.",
      icon: Rocket,
      fields: [],
      tips: [
        "Your blog will be live immediately",
        "You can start writing posts right away",
        "Invite team members later",
        "Analytics and SEO tools included"
      ]
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
        themeId: onboardingData.selectedTheme
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
        <Card className="bg-black/80 backdrop-blur-xl border-purple-400/30 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  Complete your setup
                </p>
                <p className="text-xs text-white/60">
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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
        {/* Epic Animated Background - Darker */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black" />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 via-blue-900/20 to-pink-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_60%)]" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animation: 'float 6s ease-in-out infinite' }} />
          <div className="absolute -top-20 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite reverse' }} />
          <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl" style={{ animation: 'float 10s ease-in-out infinite' }} />
          <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" style={{ animation: 'float 12s ease-in-out infinite reverse' }} />
        </div>
        
        {/* Floating Sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `sparkle ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Onboarding Modal - 2 Column Layout */}
        <div className="relative w-full h-screen flex items-center justify-center p-4 md:p-6">
          <div className="relative w-full max-w-7xl mx-auto max-h-[95vh] overflow-hidden">
            <Card className="bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden h-full" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
              backdropFilter: 'blur(20px)',
              animation: 'slideInFromBottom 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="absolute top-6 right-6 z-10 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300"
                title={isRequired ? "Hide temporarily (will return in 5 seconds)" : "Close onboarding"}
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Progress Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg" style={{ animation: 'glow 3s ease-in-out infinite alternate' }}>
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Welcome to BlazeBlog!</h1>
                    <p className="text-white/60">Let's set up your blog in minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {steps.map((step, index) => {
                    const isActive = index === currentStep
                    const isCompleted = index < currentStep
                    return (
                      <div key={step.id} className={`w-3 h-3 rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-green-400" : isActive ? "bg-purple-400 animate-pulse" : "bg-white/20"
                      }`} />
                    )
                  })}
                </div>
              </div>

              {/* 2-Column Layout */}
              <div className="flex h-[calc(100%-120px)] overflow-hidden">
                {/* Left Column - Information & Description */}
                <div className="w-1/2 p-8 bg-black/30 border-r border-white/10 overflow-y-auto scrollbar-thin">
                  <div className="space-y-6">
                    {/* Step Icon & Title */}
                    <div className="text-center">
                      <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-2xl ${
                        currentStep === 0 ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-500/50" :
                        currentStep === 1 ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/50" :
                        currentStep === 2 ? "bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-500/50" :
                        "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 shadow-green-500/50"
                      }`} style={{ animation: 'float 3s ease-in-out infinite' }}>
                        <currentStepData.icon className="h-12 w-12 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                        {currentStepData.title}
                      </h2>
                      <p className="text-lg text-white/70 leading-relaxed mb-8">
                        {currentStepData.description}
                      </p>
                    </div>

                    {/* Tips & Information */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkle className="h-5 w-5 text-yellow-400" />
                        <h3 className="text-lg font-semibold text-white">Pro Tips</h3>
                      </div>
                      <ul className="space-y-3">
                        {currentStepData.tips?.map((tip, index) => (
                          <li key={index} className="flex items-start gap-3 text-white/70">
                            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Step Progress */}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                        <span className="text-white/90 font-medium">Step {currentStep + 1} of {steps.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Forms & Actions */}
                <div className="w-1/2 p-8 overflow-y-auto scrollbar-thin">
                  <div className="max-w-md mx-auto space-y-6">
                    
                    {/* Step 1: Company Information */}
                    {currentStep === 0 && (
                      <div className="space-y-6" style={{ animation: 'slideInFromRight 0.6s ease-out' }}>
                        <div className="space-y-4">
                          <Label htmlFor="companyName" className="text-lg font-semibold text-white flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-400" />
                            Company Name *
                          </Label>
                          <Input
                            id="companyName"
                            placeholder="Enter your company name"
                            value={onboardingData.companyName}
                            onChange={(e) => setOnboardingData(prev => ({ ...prev, companyName: e.target.value }))}
                            className="h-12 text-lg bg-black/20 border-white/20 backdrop-blur-xl text-white placeholder:text-white/40 focus:bg-black/30 focus:border-purple-400 transition-all duration-300"
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <Label htmlFor="website" className="text-lg font-semibold text-white flex items-center gap-2">
                            <Globe className="h-5 w-5 text-green-400" />
                            Website (Optional)
                          </Label>
                          <Input
                            id="website"
                            placeholder="https://yourcompany.com"
                            value={onboardingData.website}
                            onChange={(e) => setOnboardingData(prev => ({ ...prev, website: e.target.value }))}
                            className="h-12 text-lg bg-black/20 border-white/20 backdrop-blur-xl text-white placeholder:text-white/40 focus:bg-black/30 focus:border-green-400 transition-all duration-300"
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <Label htmlFor="description" className="text-lg font-semibold text-white flex items-center gap-2">
                            <Heart className="h-5 w-5 text-pink-400" />
                            Description (Optional)
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Tell us about your company..."
                            value={onboardingData.description}
                            onChange={(e) => setOnboardingData(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className="text-lg bg-black/20 border-white/20 backdrop-blur-xl text-white placeholder:text-white/40 focus:bg-black/30 focus:border-pink-400 transition-all duration-300 resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 2: Blog URL */}
                    {currentStep === 1 && (
                      <div className="space-y-6" style={{ animation: 'slideInFromRight 0.6s ease-out' }}>
                        <div className="space-y-4">
                          <Label htmlFor="blogSlug" className="text-lg font-semibold text-white flex items-center gap-2">
                            <Link className="h-5 w-5 text-cyan-400" />
                            Blog URL *
                          </Label>
                          
                          <div className="relative group">
                            <Input
                              id="blogSlug"
                              placeholder="your-blog-name"
                              value={onboardingData.blogSlug}
                              onChange={(e) => handleSlugChange(e.target.value)}
                              className={`h-12 text-lg pr-40 bg-black/20 border-white/20 backdrop-blur-xl text-white placeholder:text-white/40 focus:bg-black/30 transition-all duration-500 ${
                                onboardingData.blogSlug.length >= 3 && slugResult.exists
                                  ? "border-red-400 focus:border-red-500" 
                                  : onboardingData.blogSlug.length >= 3 && !slugResult.exists && !slugResult.isChecking
                                  ? "border-green-400 focus:border-green-500"
                                  : "focus:border-purple-400"
                              }`}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-white/70 bg-black/20 backdrop-blur-xl px-3 py-1 rounded-lg border border-white/10">
                              .blazeblog.xyz
                            </div>
                          </div>

                          {/* URL Status */}
                          {onboardingData.blogSlug.length >= 3 && (
                            <div className="mt-3">
                              {slugResult.isChecking ? (
                                <div className="flex items-center space-x-2 text-blue-400">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent" />
                                  <span className="text-sm">Checking availability...</span>
                                </div>
                              ) : slugResult.exists ? (
                                <div className="flex items-center space-x-2 text-red-400">
                                  <X className="h-4 w-4" />
                                  <span className="text-sm">URL already taken</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2 text-green-400">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm">Available!</span>
                                </div>
                              )}
                            </div>
                          )}

                          {onboardingData.blogSlug && (
                            <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-white/10">
                              <p className="text-sm text-white/70 mb-2">Your blog will be live at:</p>
                              <p className="text-lg font-bold font-mono text-white">
                                {onboardingData.blogSlug}.blazeblog.xyz
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Theme Selection */}
                    {currentStep === 2 && (
                      <div className="space-y-6" style={{ animation: 'slideInFromRight 0.6s ease-out' }}>
                        <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto scrollbar-thin">
                          {mockThemes.map((theme, index) => (
                            <div
                              key={theme.id}
                              onClick={() => setOnboardingData(prev => ({ ...prev, selectedTheme: theme.id }))}
                              className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                                onboardingData.selectedTheme === theme.id
                                  ? "border-purple-400 shadow-lg shadow-purple-500/30"
                                  : "border-white/20 hover:border-white/40"
                              }`}
                            >
                              {/* Theme Preview */}
                              <div className={`h-16 rounded-t-xl ${theme.preview} relative overflow-hidden`}>
                                <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${theme.accent}`} />
                                <div className={`absolute top-2 right-2 w-8 h-1 rounded ${theme.accent} opacity-70`} />
                              </div>
                              
                              {/* Theme Info */}
                              <div className="p-4 bg-black/20 backdrop-blur-xl rounded-b-xl">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-white">{theme.name}</h4>
                                  <Badge className="bg-white/10 text-white/80 text-xs">
                                    {theme.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-white/60">
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

                    {/* Step 4: Summary */}
                    {currentStep === 3 && (
                      <div className="space-y-6 text-center" style={{ animation: 'slideInFromRight 0.6s ease-out' }}>
                        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50" style={{ animation: 'float 3s ease-in-out infinite' }}>
                          <Rocket className="h-12 w-12 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-4">🎉 Ready to Launch!</h3>
                          <p className="text-white/70 mb-6">Your blog setup is complete and ready to go live.</p>
                        </div>

                        {/* Summary */}
                        <div className="space-y-3 text-left">
                          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                            <span className="text-white/70">Company:</span>
                            <span className="text-white font-medium">{onboardingData.companyName}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                            <span className="text-white/70">Blog URL:</span>
                            <span className="text-white font-mono text-sm">{onboardingData.blogSlug}.blazeblog.xyz</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                            <span className="text-white/70">Theme:</span>
                            <span className="text-white font-medium">
                              {mockThemes.find(t => t.id === onboardingData.selectedTheme)?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                      <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={isFirstStep}
                        className="px-6 py-2 bg-black/20 border-white/20 text-white hover:bg-black/40 backdrop-blur-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>

                      {isLastStep ? (
                        <Button
                          onClick={handleComplete}
                          disabled={isLoading}
                          className="px-8 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-semibold shadow-lg"
                          style={{ animation: isLoading ? 'none' : 'glow 2s ease-in-out infinite alternate' }}
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Rocket className="h-4 w-4 mr-2" />
                              Launch Blog!
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          className="px-8 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                        >
                          Continue
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
          100% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8), 0 0 60px rgba(236, 72, 153, 0.4); }
        }
        
        @keyframes slideInFromBottom {
          0% { opacity: 0; transform: translateY(50px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInFromRight {
          0% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        /* Custom scrollbar styles */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Smooth scrolling */
        * {
          scroll-behavior: smooth;
        }
      `}</style>
    </>
  )
}