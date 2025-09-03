"use client"

import { useParams } from "next/navigation"
import { usePageTitle } from "@/hooks/use-page-title"
import { PostForm } from "@/components/post-form"

function EditPostPage() {
  const params = useParams()
  const postId = Array.isArray(params.id) ? params.id[0] : params.id
  const postIdNumber = postId ? parseInt(postId, 10) : undefined
  
  usePageTitle(`Edit Post - BlazeBlog Admin`)

  return <PostForm mode="edit" postId={postIdNumber} />
}

export default EditPostPage