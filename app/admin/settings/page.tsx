import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { AdminLayout } from "@/components/admin-layout"
import { SiteConfigForm } from "@/components/site-config-form"
import { UpgradePlanToggle } from "@/components/upgrade-plan-toggle"

export const metadata: Metadata = {
  title: "Settings - BlazeBlog Admin",
  description: "Configure your blog settings, site information, and preferences",
}

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your application settings and preferences</p>
        </div>

        <UpgradePlanToggle />
        
        <SiteConfigForm />
      </div>
    </AdminLayout>
  )
}
