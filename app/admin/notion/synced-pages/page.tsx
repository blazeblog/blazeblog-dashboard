"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { NotionSyncedPages } from "@/components/notion-synced-pages"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotionSyncedPagesPage() {
  const searchParams = useSearchParams()
  const integrationId = searchParams.get('id')

  if (!integrationId) {
    return (
      <AdminLayout title="Synced Pages">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Integration ID is required</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/admin/notion">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notion Integration
            </Link>
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Synced Pages">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/notion">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        <NotionSyncedPages integrationId={integrationId} />
      </div>
    </AdminLayout>
  )
}