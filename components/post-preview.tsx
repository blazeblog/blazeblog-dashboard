"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PostPreviewProps {
  title: string
  content: string
  excerpt: string
}

export function PostPreview({ title, content, excerpt }: PostPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Preview</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(!isPreviewOpen)}>
            {isPreviewOpen ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Preview
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {isPreviewOpen && (
        <CardContent>
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{title || "Untitled Post"}</h1>
              {excerpt && <p className="text-muted-foreground mt-2">{excerpt}</p>}
            </div>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}
