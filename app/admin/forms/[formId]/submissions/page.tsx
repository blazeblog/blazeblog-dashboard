"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Download,
  Eye,
  Trash2,
  MoreHorizontal,
  Search,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  Loader2,
} from "lucide-react"
import { useFormsService, FormsUtils } from "@/lib/forms-service"
import { type Form, type Submission, type FormStats } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"

export default function FormSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.formId as string

  const [form, setForm] = useState<Form | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState<FormStats | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  const formsService = useFormsService()
  const { toast } = useToast()

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    loadFormData()
  }, [formId])

  // Load submissions when page or debounced search changes
  useEffect(() => {
    loadSubmissions()
  }, [currentPage, debouncedSearchTerm])

  const loadSubmissions = useCallback(async () => {
    if (!form) return
    
    try {
      const submissionsResponse = await formsService.getFormSubmissions(formId, {
        page: currentPage,
        limit: 20,
        search: debouncedSearchTerm || undefined
      })
      setSubmissions(submissionsResponse.items)
      setTotalSubmissions(submissionsResponse.total)
    } catch (error) {
      console.error('Error loading submissions:', error)
    }
  }, [form, formId, currentPage, debouncedSearchTerm, formsService])

  const loadFormData = async () => {
    try {
      setLoading(true)
      const [formData, submissionsResponse, statsData] = await Promise.all([
        formsService.getForm(formId),
        formsService.getFormSubmissions(formId, { page: 1, limit: 20 }),
        formsService.getFormStats(formId).catch(() => ({
          totalSubmissions: 0,
          conversionRate: 0,
          lastSubmissionAt: undefined
        }))
      ])

      setForm(formData)
      setSubmissions(submissionsResponse.items)
      setTotalSubmissions(submissionsResponse.total)
      setForm(formData)
      setSubmissions(submissionsResponse.items)
      setTotalSubmissions(submissionsResponse.total)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading form data:', error)
      toast({
        title: "Error",
        description: "Failed to load form data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      await formsService.deleteSubmission(formId, submissionId)
      setSubmissions(prev => prev.filter(s => s.id !== submissionId))
      toast({
        title: "Success!",
        description: "Submission deleted successfully.",
        variant: "default"
      })
    } catch (error) {
      console.error('Error deleting submission:', error)
      toast({
        title: "Error",
        description: "Failed to delete submission. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleExportCSV = () => {
    if (!form || submissions.length === 0) {
      toast({
        title: "No Data",
        description: "No submissions available to export.",
        variant: "default"
      })
      return
    }

    try {
      const csv = FormsUtils.generateSubmissionsCSV(form, submissions)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${form.name}_submissions_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success!",
        description: "Submissions exported successfully.",
        variant: "default"
      })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast({
        title: "Error",
        description: "Failed to export submissions. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle search with debouncing
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  if (loading) {
    return (
      <AdminLayout title="Form Submissions">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading form submissions...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!form) {
    return (
      <AdminLayout title="Form Not Found">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Form not found</p>
          <Button asChild>
            <a href="/admin/forms">Back to Forms</a>
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Form Submissions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-muted-foreground">{form.name}</p>
            </div>
            <Badge className={
              form.status === 'active' ? 'bg-green-500 text-white' : 
              form.status === 'draft' ? 'bg-yellow-500 text-white' : 
              'bg-gray-500 text-white'
            }>
              {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCSV} disabled={submissions.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSubmissions || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.conversionRate?.toFixed(1) || 0}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.averageCompletionTime} seconds
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Submission</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.lastSubmissionAt 
                  ? new Date(stats.lastSubmissionAt).toLocaleDateString()
                  : 'None'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="submissions" className="w-full">


          <TabsContent value="submissions" className="space-y-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Pagination Info and Controls */}
          {totalSubmissions > 20 && (
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * 20 + 1, totalSubmissions)} to {Math.min(currentPage * 20, totalSubmissions)} of {totalSubmissions} submissions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {Math.ceil(totalSubmissions / 20)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalSubmissions / 20)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
              <CardDescription>View and manage form submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {totalSubmissions === 0 ? "No submissions yet" : "No matching submissions"}
                  </h3>
                  <p className="text-muted-foreground">
                    {totalSubmissions === 0 
                      ? "Submissions will appear here when people fill out your form"
                        : "Try adjusting your search terms"
                      }
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Submission ID</TableHead>
                        <TableHead>Data Preview</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-mono text-sm">
                            {submission.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {Object.entries(submission.data)
                                .slice(0, 3)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ')
                              }
                              {Object.keys(submission.data).length > 3 && '...'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(submission.submittedAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this submission? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSubmission(submission.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submission Detail Dialog */}
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
              <DialogDescription>
                Submission ID: {selectedSubmission?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium">Submitted At:</label>
                    <p>{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="font-medium">Form:</label>
                    <p>{form.name}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Submitted Data:</h4>
                  <div className="space-y-3">
                    {form.steps.map(step => (
                      <div key={step.id}>
                        <h5 className="font-medium text-sm text-muted-foreground mb-2">{step.title}</h5>
                        <div className="grid gap-2">
                          {step.fields.map(field => (
                            <div key={field.id} className="grid grid-cols-3 gap-2 p-2 bg-muted rounded">
                              <div className="font-medium text-sm">{field.label}:</div>
                              <div className="col-span-2 text-sm">
                                {FormsUtils.formatFieldValue(field, selectedSubmission.data[field.id])}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}