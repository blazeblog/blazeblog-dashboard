"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PostPreviewProps {
  title: string
  content: string
  excerpt: string
}

export function PostPreview({ title, content, excerpt }: PostPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{title || "Untitled Post"}</h1>
            {excerpt && <p className="text-muted-foreground mt-2">{excerpt}</p>}
          </div>
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content || "<p>Start writing to see the preview...</p>" }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
