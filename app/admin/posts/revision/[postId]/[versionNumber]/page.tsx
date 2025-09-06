"use client"

import { useParams } from "next/navigation"
import { usePageTitle } from "@/hooks/use-page-title"
import { RevisionViewer } from "@/components/revision-viewer"

function RevisionViewPage() {
  const params = useParams()
  const postId = Array.isArray(params.postId) ? params.postId[0] : params.postId
  const versionNumber = Array.isArray(params.versionNumber) ? params.versionNumber[0] : params.versionNumber
  
  const postIdNumber = postId ? parseInt(postId, 10) : undefined
  const versionNum = versionNumber ? parseInt(versionNumber, 10) : undefined
  
  usePageTitle(`Revision ${versionNum} - BlazeBlog Admin`)

  if (!postIdNumber || !versionNum) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Invalid Parameters</h1>
          <p className="text-muted-foreground">Post ID and version number are required.</p>
        </div>
      </div>
    )
  }

  return <RevisionViewer postId={postIdNumber} versionNumber={versionNum} />
}

export default RevisionViewPage