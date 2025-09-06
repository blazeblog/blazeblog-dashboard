"use client"

import { useParams } from "next/navigation"
import { usePageTitle } from "@/hooks/use-page-title"
import { PageForm } from "@/components/page-form"

export default function EditPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const pageId = id ? parseInt(id, 10) : undefined
  usePageTitle("Edit Page - BlazeBlog Admin")
  return <PageForm mode="edit" pageId={pageId} />
}

