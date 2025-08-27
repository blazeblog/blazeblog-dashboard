"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Settings, Home } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const checkoutId = searchParams.get("id")
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    // Show success toast
    toast({
      title: "Payment Successful! 🎉",
      description: "Your premium plan has been activated successfully.",
    })

    // Countdown timer for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/admin/settings")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router, toast])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Card */}
      <Card className="text-center border-green-200 bg-green-50/50">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
          <CardDescription className="text-green-600 text-base">
            Welcome to Premium! Your upgrade has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-2">What's included in your Premium plan:</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>✨ Advanced editor features</li>
              <li>📊 Enhanced analytics and insights</li>
              <li>🎨 Premium themes and customization</li>
              <li>⚡ Priority support</li>
              <li>🔧 Advanced SEO tools</li>
              <li>📈 Unlimited posts and pages</li>
            </ul>
          </div>

          <div className="text-sm text-gray-500">
            Checkout ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{checkoutId}</code>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => router.push("/admin/settings")}
              className="bg-green-600 hover:bg-green-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Go to Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/admin")}
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>

          <div className="text-xs text-gray-400">
            Redirecting to settings in {countdown} seconds...
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Next Steps
          </CardTitle>
          <CardDescription>
            Here's how to make the most of your premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" 
                 onClick={() => router.push("/admin/posts/add")}>
              <h4 className="font-medium mb-1">Create Your First Premium Post</h4>
              <p className="text-sm text-gray-600">Try out the enhanced editor with new features</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                 onClick={() => router.push("/admin/analytics")}>
              <h4 className="font-medium mb-1">Explore Analytics</h4>
              <p className="text-sm text-gray-600">View detailed insights about your content</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                 onClick={() => router.push("/admin/themes")}>
              <h4 className="font-medium mb-1">Customize Your Theme</h4>
              <p className="text-sm text-gray-600">Access premium themes and customization options</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                 onClick={() => router.push("/admin/settings")}>
              <h4 className="font-medium mb-1">Configure Settings</h4>
              <p className="text-sm text-gray-600">Set up your premium features and preferences</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <AdminLayout title="Payment Successful">
      <Suspense fallback={
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Processing your payment confirmation...</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please wait...</p>
            </CardContent>
          </Card>
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </AdminLayout>
  )
}