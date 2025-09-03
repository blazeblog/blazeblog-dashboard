"use client"

import { usePageTitle } from "@/hooks/use-page-title"
import { PostForm } from "@/components/post-form"
import { TourProvider } from "@/components/custom-tour"

function AddPostPage() {
  usePageTitle("Create New Post - BlazeBlog Admin")

  return <PostForm mode="add" />
}

// Wrap the component with the tour provider
function AddPostPageWithTour() {
  return (
    <TourProvider>
      <AddPostPage />
    </TourProvider>
  )
}

export default AddPostPageWithTour
