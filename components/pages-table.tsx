"use client"

import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { PageActions } from "@/components/page-actions"
import type { Post } from "@/lib/api"

interface PagesTableProps {
  pages: Post[]
  onDeletePage?: (id: number) => void
}

export function PagesTable({ pages, onDeletePage }: PagesTableProps) {
  const router = useRouter()
  const handleRowClick = (id: number) => {
    router.push(`/admin/pages/edit/${id}`)
  }
  const badge = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500 text-white hover:bg-green-600'
      case 'draft': return 'bg-yellow-500 text-white hover:bg-yellow-600'
      case 'archived': return 'bg-gray-500 text-white hover:bg-gray-600'
      default: return 'bg-blue-500 text-white hover:bg-blue-600'
    }
  }
  return (
    <TableBody>
      {pages.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No pages found</TableCell>
        </TableRow>
      ) : (
        pages.map((p) => (
          <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleRowClick(p.id)}>
            <TableCell className="font-medium">{p.title}</TableCell>
            <TableCell>
              <Badge className={badge(p.status)}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</Badge>
            </TableCell>
            <TableCell>{p.user.username}</TableCell>
            <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <PageActions pageId={p.id} onDelete={onDeletePage} />
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}
