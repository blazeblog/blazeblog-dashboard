"use client"

import { usePageTitle } from "@/hooks/use-page-title"
import { AdminLayout } from "@/components/admin-layout"
import { PostForm } from "@/components/post-form"
import { TourProvider } from "@/components/custom-tour"

function AddPostPage() {
  usePageTitle("Create New Post - BlazeBlog Admin")

  return (
    <AdminLayout title="Create New Post">
      <PostForm mode="add" />
    </AdminLayout>
  )
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
