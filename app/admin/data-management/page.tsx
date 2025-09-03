"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientPagination } from "@/components/ui/client-pagination"
import { Download, Upload, FileText, Globe, CheckCircle, AlertCircle, Clock, Info, FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useClientApi } from "@/lib/client-api"

interface ImportJob {
  id: string
  source: string
  status: 'waiting' | 'active' | 'completed' | 'failed'
  progress: number
  createdAt: string
  processedOn?: string
  finishedOn?: string
  failedReason?: string
  result?: {
    success: boolean
    articlesImported: number
    articlesSkipped: number
    imagesProcessed: number
    errors?: string[]
    warnings?: string[]
  }
}

interface ImportOptions {
  preservePublishDate: boolean
  overwriteExisting: boolean
  generateSlug: boolean
  processImages: boolean
  maxArticles?: number
}

export default function ImportPage() {
  const [importing, setImporting] = useState(false)
  const [importJobs, setImportJobs] = useState<ImportJob[]>([])
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    preservePublishDate: true,
    overwriteExisting: false,
    generateSlug: true,
    processImages: true
  })
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [jobsPerPage] = useState(10)
  const [exporting, setExporting] = useState(false)
  const importFileInputRef = useRef<HTMLInputElement>(null)
  const api = useClientApi()
  const { toast } = useToast()

  useEffect(() => {
    fetchImportJobs()
  }, [])

  const handleImport = async (platform: 'medium' | 'wordpress' | 'ghost' | 'substack' | 'csv') => {
    importFileInputRef.current?.click()
    importFileInputRef.current?.setAttribute('data-platform', platform)
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const platform = event.target.getAttribute('data-platform')
    
    if (!file || !platform) return
    
    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Add import options
      Object.entries(importOptions).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })
      
      const endpoint = platform === 'medium' ? '/data-management/medium/export' : 
                      platform === 'ghost' ? '/data-management/ghost/export' :
                      platform === 'wordpress' ? '/data-management/wordpress/export' :
                      platform === 'substack' ? '/data-management/substack/export' :
                      '/data-management/export'

      const response = await api.post(endpoint, formData)
      
      toast({
        title: "Import Queued",
        description: `Your ${platform} import request has been queued. You'll receive an email notification on success or failure.`,
        variant: "default"
      })

      // Refresh job list
      await fetchImportJobs()
      
    } catch (error: any) {
      console.error('Error importing data:', error)
      
      // Extract error message from API response
      let errorMessage = "Failed to start import. Please check your file and try again."
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setImporting(false)
      if (importFileInputRef.current) {
        importFileInputRef.current.value = ''
      }
    }
  }

  const fetchImportJobs = async () => {
    try {
      const response = await api.get('/data-management/jobs')
      setImportJobs(response.jobs || [])
    } catch (error) {
      console.error('Error fetching import jobs:', error)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true)
    try {
      const response = await api.get(`/data-management/export?format=${format}`, {
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `export.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Export Complete",
        description: `Your data has been exported as ${format.toUpperCase()} file.`,
        variant: "default"
      })
    } catch (error: any) {
      console.error('Error exporting data:', error)
      
      let errorMessage = "Failed to export data. Please try again."
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast({
        title: "Export Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setExporting(false)
    }
  }

  const getStatusIcon = (status: ImportJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'medium':
        return (
          <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden bg-white border">
            <Image src="/medium.png" alt="Medium" width={24} height={24} className="object-contain" />
          </div>
        )
      case 'wordpress':
        return (
          <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden bg-white border">
            <Image src="/wordpress-logo.png" alt="WordPress" width={24} height={24} className="object-contain" />
          </div>
        )
      case 'ghost':
        return (
          <div className="h-8 w-8 bg-gray-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">G</span>
          </div>
        )
      case 'substack':
        return (
          <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
        )
      case 'csv':
        return (
          <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
        )
      default:
        return (
          <div className="h-8 w-8 bg-gray-500 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
        )
    }
  }

  const showInstructions = (platform: string) => {
    setSelectedPlatform(platform)
    setInstructionsOpen(true)
  }

  const getInstructionContent = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'medium':
        return {
          title: "Medium Import Instructions",
          steps: [
            "Go to your Medium settings: https://medium.com/me/settings",
            "Click on \"Download your information\"",
            "Select \"Posts\" and click \"Export\"", 
            "Download the ZIP file when ready",
            "Upload the ZIP file here to import your articles"
          ],
          note: "Images will be imported but may need manual review.",
          acceptedFormats: "ZIP files only"
        }
      case 'wordpress':
        return {
          title: "WordPress Import Instructions",
          steps: [
            "Log into your WordPress admin dashboard",
            "Go to Tools → Export",
            "Select \"All content\" or \"Posts\"",
            "Click \"Download Export File\"",
            "Upload the XML file here"
          ],
          note: "Make sure to export as WordPress XML format for best compatibility.",
          acceptedFormats: "XML files only"
        }
      case 'ghost':
        return {
          title: "Ghost Import Instructions", 
          steps: [
            "Access your Ghost admin panel",
            "Go to Settings → Labs",
            "Click \"Export your content\"",
            "Download the JSON file",
            "Upload the JSON file here"
          ],
          note: "This will import posts, pages, tags, and basic settings.",
          acceptedFormats: "JSON files only"
        }
      case 'substack':
        return {
          title: "Substack Import Instructions",
          steps: [
            "Go to your Substack dashboard",
            "Click on Settings → Exports", 
            "Request a full export of your posts",
            "Download the ZIP file when ready",
            "Upload the ZIP file here"
          ],
          note: "This will import your posts, subscriber lists, and basic publication settings.",
          acceptedFormats: "ZIP files only"
        }
      case 'csv':
        return {
          title: "CSV Import Instructions",
          steps: [
            "Prepare your CSV file with the required columns",
            "Ensure proper formatting (see example below)",
            "Save as CSV format",
            "Upload the CSV file here"
          ],
          note: "Required columns: title (required), content (required), tags (optional), category (optional), publishedAt (optional)",
          acceptedFormats: "CSV files only",
          example: `title,content,tags,category,publishedAt
"My First Post","This is the content of my post","tech,web","Technology","2024-01-01T00:00:00Z"
"Another Post","More content here","design","Design","2024-01-02T00:00:00Z"`
        }
      default:
        return {
          title: "Import Instructions",
          steps: [],
          note: "",
          acceptedFormats: ""
        }
    }
  }

  return (
    <AdminLayout title="Data Management">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">
            Import content from other platforms or export your existing data
          </p>
        </div>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Import Data
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Export Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  Export Your Data
                </CardTitle>
                <CardDescription>Download all your content as CSV or JSON</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleExport('csv')}
                    disabled={exporting}
                    className="flex-1"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    {exporting ? 'Exporting...' : 'Export as CSV'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleExport('json')}
                    disabled={exporting}
                    className="flex-1"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    {exporting ? 'Exporting...' : 'Export as JSON'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Export includes all posts, categories, tags, and relationships. JSON format preserves full metadata.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-6">
            {/* Import Options */}
            <Card>
            <CardHeader>
              <CardTitle>Import Options</CardTitle>
              <CardDescription>Configure how your content should be imported</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Preserve Publish Date</Label>
                    <p className="text-sm text-muted-foreground">Keep original publication dates</p>
                  </div>
                  <Switch
                    checked={importOptions.preservePublishDate}
                    onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, preservePublishDate: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Overwrite Existing</Label>
                    <p className="text-sm text-muted-foreground">Replace posts with same title/slug</p>
                  </div>
                  <Switch
                    checked={importOptions.overwriteExisting}
                    onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, overwriteExisting: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Generate Slug</Label>
                    <p className="text-sm text-muted-foreground">Auto-generate URL slugs from titles</p>
                  </div>
                  <Switch
                    checked={importOptions.generateSlug}
                    onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, generateSlug: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Process Images</Label>
                    <p className="text-sm text-muted-foreground">Download and host images locally</p>
                  </div>
                  <Switch
                    checked={importOptions.processImages}
                    onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, processImages: checked }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxArticles">Max Articles (optional)</Label>
                <Input
                  id="maxArticles"
                  type="number"
                  placeholder="Leave empty for no limit"
                  value={importOptions.maxArticles || ''}
                  onChange={(e) => setImportOptions(prev => ({ 
                    ...prev, 
                    maxArticles: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full md:w-48"
                />
              </div>
            </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Import Sources
                </CardTitle>
                <CardDescription>Choose a platform to import your content from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hidden file input for imports */}
                <input
                  ref={importFileInputRef}
                  type="file"
                  accept=".zip,.xml,.json,.csv"
                  onChange={handleImportFile}
                  className="hidden"
                />
                
                {/* Medium Import */}
                <div className="space-y-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center overflow-hidden bg-white border">
                      <Image src="/medium.png" alt="Medium" width={32} height={32} className="object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Medium</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => showInstructions('medium')}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">Import articles from Medium export</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleImport('medium')}
                      disabled={importing}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {importing ? 'Importing...' : 'Import'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground pl-15">
                    Export your Medium data and upload the ZIP file to import your articles.
                  </p>
                </div>

                {/* WordPress Import */}
                <div className="space-y-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center overflow-hidden bg-white border">
                      <Image src="/wordpress-logo.png" alt="WordPress" width={32} height={32} className="object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">WordPress</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => showInstructions('wordpress')}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">Import posts from WordPress export</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => handleImport('wordpress')}
                      disabled={importing}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {importing ? 'Importing...' : 'Import'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground pl-15">
                    Export your WordPress content as XML and upload to import posts and pages.
                  </p>
                </div>

                {/* Ghost Import */}
                <div className="space-y-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gray-800 rounded-lg flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="white">
                        <path d="M9.604 19.199H.008V24h9.597c.061 0 .123-.007.185-.02 4.806-.892 7.604-5.807 7.604-12.98C17.405 4.814 13.531 0 9.609 0 4.808 0 .609 4.799.609 10.199v.648c0 .273.221.495.495.495h8.5c.273 0 .495-.222.495-.495v-.648c0-2.646-2.14-4.795-4.795-4.795s-4.795 2.149-4.795 4.795c0 2.646 2.14 4.795 4.795 4.795h4.1z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Ghost</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => showInstructions('ghost')}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">Import content from Ghost export</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => handleImport('ghost')}
                      disabled={importing}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {importing ? 'Importing...' : 'Import'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground pl-15">
                    Export your Ghost content as JSON and upload to import posts and settings.
                  </p>
                </div>

                {/* Substack Import */}
                <div className="space-y-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">S</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Substack</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => showInstructions('substack')}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">Import posts from Substack export</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => handleImport('substack')}
                      disabled={importing}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {importing ? 'Importing...' : 'Import'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground pl-15">
                    Export your Substack content and upload the ZIP file to import posts and subscriber data.
                  </p>
                </div>

                {/* CSV Import */}
                <div className="space-y-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="white">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        <path d="M8.5,16.5L10.5,14.5L12.5,16.5L14.5,14.5L16.5,16.5V12.5L14.5,10.5L12.5,12.5L10.5,10.5L8.5,12.5V16.5Z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">CSV File</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => showInstructions('csv')}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">Import structured data from CSV</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => handleImport('csv')}
                      disabled={importing}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {importing ? 'Importing...' : 'Import'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground pl-15">
                    Upload a CSV file with columns: title, content, tags, category, publishedAt.
                  </p>
                </div>
              </CardContent>
            </Card>

      {/* Import Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Import Jobs ({importJobs.length})</CardTitle>
                <CardDescription>Track your import job progress and history (Last 6 hours)</CardDescription>
              </CardHeader>
                    <CardContent>
                {importJobs.length === 0 ? (
                  <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-8 text-center">
                    No import jobs yet. Start by selecting a platform above.
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {importJobs
                        .slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)
                        .map((job) => (
                      <div key={job.id} className="flex items-center gap-3 p-4 border rounded-lg">
                        {getPlatformIcon(job.source?.replace('_export', '') || 'unknown')}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{job.source?.replace('_export', '') || 'Unknown'}</span>
                            {getStatusIcon(job.status)}
                            <span className="text-sm text-muted-foreground capitalize">{job.status}</span>
                            {job.status === 'active' && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {job.progress}%
                              </span>
                            )}
                          </div>
                          {job.result?.articlesImported && (
                            <p className="text-xs text-green-600">
                              {job.result.articlesImported} articles imported, {job.result.articlesSkipped} skipped
                            </p>
                          )}
                          {job.result?.imagesProcessed && (
                            <p className="text-xs text-blue-600">
                              {job.result.imagesProcessed} images processed
                            </p>
                          )}
                          {job.failedReason && (
                            <p className="text-xs text-red-600">{job.failedReason}</p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    </div>
                    
                    {importJobs.length > jobsPerPage && (
                      <div className="mt-4">
                        <ClientPagination
                          pagination={{
                            page: currentPage,
                            limit: jobsPerPage,
                            total: importJobs.length,
                            totalPages: Math.ceil(importJobs.length / jobsPerPage),
                            hasNextPage: currentPage < Math.ceil(importJobs.length / jobsPerPage),
                            hasPreviousPage: currentPage > 1
                          }}
                          onPageChange={setCurrentPage}
                          loading={false}
                        />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Instructions Modal */}
      <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {getInstructionContent(selectedPlatform).title}
            </DialogTitle>
            <DialogDescription>
              Follow these steps to export your data from {selectedPlatform} and import it here.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <h4 className="font-semibold mb-3">Step-by-step Instructions:</h4>
              <ol className="space-y-2">
                {getInstructionContent(selectedPlatform).steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {getInstructionContent(selectedPlatform).example && (
              <div>
                <h4 className="font-semibold mb-2">Example CSV Format:</h4>
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                  {getInstructionContent(selectedPlatform).example}
                </pre>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Accepted Formats: {getInstructionContent(selectedPlatform).acceptedFormats}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    {getInstructionContent(selectedPlatform).note}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setInstructionsOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setInstructionsOpen(false)
                handleImport(selectedPlatform as 'medium' | 'wordpress' | 'ghost' | 'substack' | 'csv')
              }}>
                <Upload className="h-4 w-4 mr-2" />
                Start Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}