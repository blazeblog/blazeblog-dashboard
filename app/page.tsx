import { SignIn } from "@clerk/nextjs"
import { OnboardingRedirect } from "@/components/onboarding-redirect"
import { PenTool, BarChart3, Sparkles, Globe, Palette } from "lucide-react"

export default function HomePage() {
  return (
    <OnboardingRedirect>
      <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-6 lg:py-8 lg:h-full">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 lg:items-center lg:h-full">
            {/* Mobile: Login Form First, Desktop: Left Column - Branding */}
            <div className="order-2 lg:order-1 space-y-6 lg:space-y-8">
              <div className="text-center lg:text-left space-y-4 lg:space-y-6">
                <div className="flex items-center justify-center lg:justify-start space-x-3 lg:space-x-4 mb-4 lg:mb-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary/10 border-2 border-primary/20 rounded-2xl flex items-center justify-center">
                    <PenTool className="h-6 w-6 lg:h-7 lg:w-7 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                      BlazeBlog
                    </h1>
                    <div className="w-24 lg:w-28 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mt-2"></div>
                  </div>
                </div>
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  Professional blog management made simple. Create, manage, and grow your content with powerful tools.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-xl border bg-gradient-to-br from-card/80 to-card/40 hover:from-card to-card/60 transition-all shadow-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Analytics</h3>
                    <p className="text-xs text-muted-foreground">Track performance</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-xl border bg-gradient-to-br from-card/80 to-card/40 hover:from-card to-card/60 transition-all shadow-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Themes</h3>
                    <p className="text-xs text-muted-foreground">Beautiful designs</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-xl border bg-gradient-to-br from-card/80 to-card/40 hover:from-card to-card/60 transition-all shadow-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Publishing</h3>
                    <p className="text-xs text-muted-foreground">Share worldwide</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-xl border bg-gradient-to-br from-card/80 to-card/40 hover:from-card to-card/60 transition-all shadow-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">AI Features</h3>
                    <p className="text-xs text-muted-foreground">Smart assistance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile: First (Login Form), Desktop: Right Column */}
            <div className="order-1 lg:order-2 flex items-center justify-center">
              <div className="w-full max-w-sm lg:max-w-md">
                <div className="text-center mb-6 lg:mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">Admin Dashboard</h2>
                  <p className="text-muted-foreground text-sm lg:text-base">Sign in to manage your blog</p>
                </div>
                <SignIn
                  appearance={{
                    elements: {
                      rootBox: "mx-auto",
                      card: "shadow-xl border bg-card",
                      headerTitle: "text-xl lg:text-2xl font-bold",
                      headerSubtitle: "text-muted-foreground text-sm lg:text-base",
                      socialButtonsBlockButton: "border hover:bg-accent text-sm lg:text-base",
                      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground text-sm lg:text-base",
                      footerActionLink: "text-primary hover:text-primary/80 text-sm lg:text-base",
                      formFieldInput: "text-sm lg:text-base",
                      formFieldLabel: "text-sm lg:text-base",
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingRedirect>
  )
}
