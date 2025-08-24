"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpCircle, Zap, CheckCircle } from "lucide-react"

export function NotionUpgradeCard() {
  const handleUpgrade = () => {
    // This would typically redirect to a pricing/upgrade page
    // For now, we'll just show a placeholder
    window.open('/pricing', '_blank')
  }

  return (
    <div className="max-w-2xl">
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100 to-transparent rounded-bl-[100px]" />
        
        <CardHeader className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-orange-600" />
            <Badge variant="secondary" className="text-orange-700 bg-orange-100">
              Premium Feature
            </Badge>
          </div>
          <CardTitle className="text-2xl">Connect with Notion</CardTitle>
          <CardDescription className="text-base">
            Unlock powerful Notion integration to sync your blog posts automatically. 
            Available on Silver plan and above.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm">Automatically sync posts from Notion databases</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm">Custom field mapping between Notion and Blazeblog</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm">Real-time sync with configurable intervals</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm">Support for rich content, images, and metadata</span>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">What you'll get with Silver Plan:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>• Notion Integration</div>
              <div>• Advanced Analytics</div>
              <div>• Custom Themes</div>
              <div>• Priority Support</div>
              <div>• Advanced SEO Tools</div>
              <div>• Custom Domain</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Upgrade to Silver Plan
            </Button>
            <Button variant="outline" onClick={() => window.open('/pricing', '_blank')}>
              View All Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}