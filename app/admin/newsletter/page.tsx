import { AdminLayout } from "@/components/admin-layout"
import { NewsletterPage } from "@/components/newsletter-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Newsletter - BlazeBlog Admin"
}

export default function Newsletter() {
  return (
    <AdminLayout title="Newsletter">
      <NewsletterPage />
    </AdminLayout>
  )
}