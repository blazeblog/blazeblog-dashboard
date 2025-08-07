"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useOnboarding } from "@/hooks/use-onboarding"

// Mock themes data - will be replaced with API
const mockThemes = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple design focused on content",
    preview: "bg-gradient-to-br from-slate-50 to-slate-100",
    accent: "bg-slate-900",
    category: "Professional"
  },
  {
    id: "tech",
    name: "TechHub",
    description: "Modern tech-focused design with dark elements",
    preview: "bg-gradient-to-br from-blue-900 to-purple-900",
    accent: "bg-cyan-400",
    category: "Tech"
  },
  {
    id: "creative",
    name: "Creative",
    description: "Vibrant and artistic design for creative professionals",
    preview: "bg-gradient-to-br from-pink-400 to-orange-400",
    accent: "bg-white",
    category: "Creative"
  },
  {
    id: "business",
    name: "Business Pro",
    description: "Professional business-focused design",
    preview: "bg-gradient-to-br from-gray-800 to-gray-900",
    accent: "bg-gold-400",
    category: "Business"
  },
  {
    id: "nature",
    name: "Nature",
    description: "Earth-toned design inspired by nature",
    preview: "bg-gradient-to-br from-green-600 to-emerald-700",
    accent: "bg-green-200",
    category: "Lifestyle"
  },
  {
    id: "elegant",
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

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { hasCompletedOnboarding } = useOnboarding()
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companyName: "",
    website: "",
    blogSlug: "",
    selectedTheme: "",
    description: ""
  })

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
        return onboardingData.blogSlug.trim().length >= 3 && /^[a-z0-9-]+$/.test(onboardingData.blogSlug)
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
      // Mock API call to create the blog setup - will be replaced with real API
      const setupData = {
        companyName: onboardingData.companyName,
        website: onboardingData.website,
        blogSlug: onboardingData.blogSlug,
        selectedTheme: onboardingData.selectedTheme,
        description: onboardingData.description,
      }
      
      console.log("Setting up blog with data:", setupData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mark onboarding as completed
      hasCompletedOnboarding()
      
      toast({
        title: "🎉 Welcome to BlazeBlog!",
        description: `Your blog at ${onboardingData.blogSlug}.blazeblog.xyz has been set up successfully!`,
        variant: "default"
      })
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/admin")
      }, 1500)
      
    } catch (error) {
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
  }

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                BlazeBlog
              </h1>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-12">
          {/* Progress Line */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                
                return (
                  <div key={step.id} className="flex flex-col items-center relative">
                    {/* Step Circle */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-110" 
                        : isActive 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-125" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    
                    {/* Step Label */}
                    <div className="mt-3 text-center">
                      <p className={`text-sm font-medium ${
                        isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500"
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    
                    {/* Progress Line */}
                    {index < steps.length - 1 && (
                      <div className={`absolute top-6 left-12 h-0.5 transition-all duration-500 ${
                        index < currentStep ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-300"
                      }`} style={{ width: "calc(100vw / 4 - 6rem)" }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="max-w-2xl mx-auto shadow-2xl border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
              <currentStepData.icon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
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
                    className="h-12"
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
                    className="h-12"
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
                    className="resize-none"
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
                      className="h-12 pr-40"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                      .blazeblog.xyz
                    </div>
                  </div>
                  
                  {onboardingData.blogSlug && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
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
                
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className={`h-24 rounded-t-xl ${theme.preview} relative overflow-hidden`}>
                        <div className={`absolute top-2 left-2 w-3 h-3 rounded-full ${theme.accent}`} />
                        <div className={`absolute top-2 right-2 w-16 h-2 rounded ${theme.accent} opacity-60`} />
                        <div className={`absolute bottom-2 left-2 w-20 h-1 rounded ${theme.accent} opacity-40`} />
                        <div className={`absolute bottom-4 left-2 w-12 h-1 rounded ${theme.accent} opacity-40`} />
                      </div>
                      
                      {/* Theme Info */}
                      <div className="p-4 bg-white dark:bg-gray-900 rounded-b-xl">
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
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Heart className="h-12 w-12 text-white" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    🎉 Congratulations!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Your blog is being set up with all your preferences. This will only take a moment...
                  </p>
                </div>
                
                {/* Setup Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Setup Summary:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Company:</span>
                      <span className="font-medium">{onboardingData.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Blog URL:</span>
                      <span className="font-medium font-mono">{onboardingData.blogSlug}.blazeblog.xyz</span>
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
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={isFirstStep}
                className="px-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Setting up...
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
                  className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}