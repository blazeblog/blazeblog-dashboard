"use client"

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HelpCircle, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'

interface TourStep {
  selector: string
  title: string
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

interface TourContextType {
  isActive: boolean
  currentStep: number
  steps: TourStep[]
  startTour: () => void
  endTour: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  hasSeenTour: boolean
}

const TourContext = createContext<TourContextType | null>(null)

const tourSteps: TourStep[] = [
  {
    selector: 'body',
    title: 'Welcome to Post Creation!',
    content: 'This guided tour will help you understand all the features available when creating a new blog post. Let\'s get started!',
    position: 'bottom'
  },
  {
    selector: '[data-tour="post-title"]',
    title: 'Post Title',
    content: 'Start by entering an engaging title for your post. This will be the main headline that readers see first.',
    position: 'bottom'
  },
  {
    selector: '[data-tour="editor-tabs"]',
    title: 'Content Tabs',
    content: 'Switch between Editor (write content), Preview (see how it looks), and Settings (configure options).',
    position: 'bottom'
  },
  {
    selector: '[data-tour="rich-editor"]',
    title: 'Rich Text Editor',
    content: 'Write your content here with full formatting options. You can add headings, lists, links, images, and more using the toolbar above.',
    position: 'top'
  },
  {
    selector: '[data-tour="settings-tab"]',
    title: 'Settings Tab',
    content: 'Click here to access important publishing options like categories, tags, SEO settings, and scheduling.',
    position: 'bottom'
  },
  {
    selector: '[data-tour="publish-settings"]',
    title: 'Publish Settings',
    content: 'Control how your post is published: Draft, Publish Now, or Schedule for Later. Choose your category here too.',
    position: 'right'
  },
  {
    selector: '[data-tour="seo-settings"]',
    title: 'SEO Settings',
    content: 'Optimize your post for search engines with URL slug, meta description, and tags.',
    position: 'left'
  },
  {
    selector: '[data-tour="seo-sidebar"]',
    title: 'SEO Suggestions',
    content: 'This sidebar provides AI-powered suggestions to optimize your post for search engines.',
    position: 'left'
  },
  {
    selector: '[data-tour="save-button"]',
    title: 'Save Your Post',
    content: 'The save button changes based on your settings: Save Draft, Publish Now, or Schedule Post.',
    position: 'bottom'
  }
]

function TourOverlay() {
  const context = useContext(TourContext)
  if (!context || !context.isActive) return null

  const { currentStep, steps, nextStep, prevStep, endTour } = context
  const step = steps[currentStep]
  
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)

  const calculatePosition = useCallback(() => {
    const element = document.querySelector(step.selector)
    if (!element) return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    let top = 0
    let left = 0

    // Special handling for body selector - center in viewport
    if (step.selector === 'body') {
      top = scrollTop + window.innerHeight / 2 - 100 // Center vertically in viewport
      left = scrollLeft + window.innerWidth / 2 - 200 // Center horizontally in viewport
    } else {
      const rect = element.getBoundingClientRect()

      switch (step.position) {
        case 'bottom':
          top = rect.bottom + scrollTop + 10
          left = rect.left + scrollLeft + rect.width / 2 - 200
          break
        case 'top':
          top = rect.top + scrollTop - 10
          left = rect.left + scrollLeft + rect.width / 2 - 200
          break
        case 'right':
          top = rect.top + scrollTop + rect.height / 2 - 100
          left = rect.right + scrollLeft + 10
          break
        case 'left':
          top = rect.top + scrollTop + rect.height / 2 - 100
          left = rect.left + scrollLeft - 410
          break
        default:
          top = rect.bottom + scrollTop + 10
          left = rect.left + scrollLeft + rect.width / 2 - 200
      }
    }

    // Ensure popover stays within viewport
    const popoverWidth = 400
    const popoverHeight = 200
    
    if (left < 10) left = 10
    if (left + popoverWidth > window.innerWidth - 10) {
      left = window.innerWidth - popoverWidth - 10
    }
    if (top < 10) top = 10
    if (top + popoverHeight > window.innerHeight + scrollTop - 10) {
      top = window.innerHeight + scrollTop - popoverHeight - 10
    }

    setPopoverPosition({ top, left })
  }, [step])

  const highlightElement = useCallback(() => {
    // Remove previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight')
    })

    // Add highlight to current element
    const element = document.querySelector(step.selector)
    if (element) {
      // Don't highlight body element as it would highlight the entire page
      if (step.selector !== 'body') {
        element.classList.add('tour-highlight')
      }
      
      // Only scroll element into view if it's not the body
      if (step.selector !== 'body') {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
      }

      // Auto-click settings tab if it's that step
      if (step.selector === '[data-tour="settings-tab"]') {
        setTimeout(() => {
          (element as HTMLElement).click()
        }, 500)
      }
    }
  }, [step])

  useEffect(() => {
    if (step) {
      highlightElement()
      setTimeout(() => {
        calculatePosition()
        setIsVisible(true)
      }, 100)
    }

    const handleResize = () => calculatePosition()
    const handleScroll = () => calculatePosition()
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      // Clean up highlights
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight')
      })
    }
  }, [step, calculatePosition, highlightElement])

  if (!step || !isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        style={{ backdropFilter: 'blur(2px)' }}
      />
      
      {/* Tour Popover */}
      <Card 
        className="fixed z-[9999] w-[400px] shadow-2xl border-2"
        style={{
          top: `${popoverPosition.top}px`,
          left: `${popoverPosition.left}px`,
          transform: popoverPosition.top < 100 ? 'translateY(0)' : 
                     step.position === 'top' ? 'translateY(-100%)' : 'translateY(0)'
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={endTour}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {step.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={endTour}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finish Tour
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export function TourTriggerButton() {
  const context = useContext(TourContext)
  if (!context) return null

  const { startTour } = context

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={startTour}
      className="flex items-center gap-2"
      title="Start guided tour"
    >
      <HelpCircle className="h-4 w-4" />
      Tour
    </Button>
  )
}

interface TourProviderProps {
  children: React.ReactNode
}

export function TourProvider({ children }: TourProviderProps) {
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('hasSeenPostTour', false)
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const startTour = useCallback(() => {
    console.log('Starting custom tour')
    setCurrentStep(0)
    setIsActive(true)
  }, [])

  const endTour = useCallback(() => {
    console.log('Ending custom tour')
    setIsActive(false)
    setHasSeenTour(true)
    setCurrentStep(0)
  }, [setHasSeenTour])

  const nextStep = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < tourSteps.length) {
      setCurrentStep(step)
    }
  }, [])

  // Auto-start tour for first-time users
  useEffect(() => {
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour()
      }, 1500) // Slightly longer delay to ensure page is loaded
      return () => clearTimeout(timer)
    }
  }, [hasSeenTour, startTour])

  const contextValue: TourContextType = {
    isActive,
    currentStep,
    steps: tourSteps,
    startTour,
    endTour,
    nextStep,
    prevStep,
    goToStep,
    hasSeenTour
  }

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      <TourOverlay />
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 9999 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2) !important;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .tour-highlight::before {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid rgb(59, 130, 246);
          border-radius: 8px;
          pointer-events: none;
          animation: pulse-border 2s infinite;
        }
        
        @keyframes pulse-border {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}