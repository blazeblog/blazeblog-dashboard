import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Themes - BlazeBlog Admin"
}
import { AdminLayout } from "@/components/admin-layout"
import { ThemesPage } from "@/components/themes-page"

export default async function AdminThemesPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <AdminLayout title="Themes">
      <ThemesPage />
    </AdminLayout>
  )
}
