import { SignIn } from "@clerk/nextjs"
import { OnboardingRedirect } from "@/components/onboarding-redirect"
import { PenTool, BarChart3, Sparkles, Globe, Palette } from "lucide-react"

export default function HomePage() {
  return (
    <OnboardingRedirect>
      <div className="h-screen overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-8 h-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center h-full">
            {/* Left Column - Branding */}
            <div className="space-y-8">
              <div className="text-left space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-primary/10 border-2 border-primary/20 rounded-2xl flex items-center justify-center">
                    <PenTool className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold tracking-tight text-foreground">
                      BlazeBlog
                    </h1>
                    <div className="w-28 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mt-2"></div>
                  </div>
                </div>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Professional blog management made simple. Create, manage, and grow your content with powerful tools.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

            {/* Right Column - Login Form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
                  <p className="text-muted-foreground">Sign in to manage your blog</p>
                </div>
                <SignIn
                  appearance={{
                    elements: {
                      rootBox: "mx-auto",
                      card: "shadow-xl border bg-card",
                      headerTitle: "text-2xl font-bold",
                      headerSubtitle: "text-muted-foreground",
                      socialButtonsBlockButton: "border hover:bg-accent",
                      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                      footerActionLink: "text-primary hover:text-primary/80",
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
