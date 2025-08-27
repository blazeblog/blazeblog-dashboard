"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface UpgradePlanToggleProps {
  checkoutId?: string
  planName?: string
  planDescription?: string
}

export function UpgradePlanToggle({ 
checkoutId = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_ID,
  planName = "Premium Plan",
  planDescription = "Access advanced features, priority support, and more"
}: UpgradePlanToggleProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleUpgradeClick = () => {
    if (typeof window !== "undefined" && checkoutId) {
      try {
        setIsLoading(true)
        const url = `/admin/checkout?id=${checkoutId}`
        window.location.href = url
      } catch (error) {
        console.error("Error initiating checkout:", error)
        toast({
          title: "Error",
          description: "Failed to start checkout process. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade Plan</CardTitle>
        <CardDescription>
          Unlock premium features and enhance your blogging experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{planName}</h3>
            <p className="text-sm text-muted-foreground">
              {planDescription}
            </p>
          </div>
          <Button 
            onClick={handleUpgradeClick}
            disabled={isLoading || !checkoutId}
          >
            {isLoading ? "Loading..." : "Purchase"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}