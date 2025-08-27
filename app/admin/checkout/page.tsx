"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const checkoutId = searchParams.get("id")
  const [checkoutStatus, setCheckoutStatus] = useState<"loading" | "error" | "redirected">("loading")

  useEffect(() => {
    if (checkoutId && typeof window !== "undefined") {
      try {
        const checkoutElement = document.createElement("a")
        checkoutElement.href = `https://buy.polar.sh/${checkoutId}`
        checkoutElement.setAttribute("data-polar-checkout", "")
        checkoutElement.setAttribute("data-polar-checkout-theme", "dark")
        checkoutElement.style.display = "none"
        document.body.appendChild(checkoutElement)
        
        // Set up success/error callbacks
        const handlePolarSuccess = () => {
          toast({
            title: "Payment Successful!",
            description: "Your upgrade has been processed successfully.",
          })
          router.push("/admin/settings")
        }

        const handlePolarError = () => {
          setCheckoutStatus("error")
          toast({
            title: "Payment Failed",
            description: "There was an issue processing your payment. Please try again.",
            variant: "destructive",
          })
        }

        // Listen for Polar events
        window.addEventListener("polar:checkout:success", handlePolarSuccess)
        window.addEventListener("polar:checkout:error", handlePolarError)
        
        checkoutElement.click()
        setCheckoutStatus("redirected")
        
        return () => {
          window.removeEventListener("polar:checkout:success", handlePolarSuccess)
          window.removeEventListener("polar:checkout:error", handlePolarError)
          if (document.body.contains(checkoutElement)) {
            document.body.removeChild(checkoutElement)
          }
        }
      } catch (error) {
        console.error("Checkout error:", error)
        setCheckoutStatus("error")
        toast({
          title: "Checkout Error",
          description: "Failed to initialize checkout. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [checkoutId, router, toast])

  if (!checkoutId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid Checkout</CardTitle>
          <CardDescription>No checkout ID provided</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Please return to the settings page and try again.</p>
            <Button onClick={() => router.push("/admin/settings")}>
              Back to Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (checkoutStatus === "error") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Checkout Error</CardTitle>
          <CardDescription>There was an issue processing your checkout</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Please try again or contact support if the issue persists.</p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push("/admin/settings")}>
                Back to Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Checkout</CardTitle>
        <CardDescription>
          {checkoutStatus === "redirected" 
            ? "Checkout window opened. Complete your purchase in the popup."
            : "Redirecting you to the payment page..."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            {checkoutStatus === "redirected"
              ? "If the checkout window didn't open, please disable your popup blocker and try again."
              : "Please wait while we redirect you to complete your purchase."
            }
          </p>
          {checkoutStatus === "redirected" && (
            <Button variant="outline" onClick={() => router.push("/admin/settings")}>
              Cancel & Return to Settings
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CheckoutPage() {
  return (
    <AdminLayout title="Checkout">
      <Suspense fallback={
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Preparing checkout...</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please wait...</p>
          </CardContent>
        </Card>
      }>
        <CheckoutContent />
      </Suspense>
    </AdminLayout>
  )
}