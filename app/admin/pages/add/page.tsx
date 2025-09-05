"use client"

import { usePageTitle } from "@/hooks/use-page-title"
import { PageForm } from "@/components/page-form"

export default function AddPage() {
  usePageTitle("Create New Page - BlazeBlog Admin")
  return <PageForm mode="add" />
}

