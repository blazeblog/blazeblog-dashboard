"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  MoreHorizontal,
  Settings,
  BarChart3,
  Users,
  FormInput,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  List,
  FileText,
  Star,
  ArrowRight,
  ArrowLeft,
  Save,
  X,
  GripVertical,
} from "lucide-react"

interface FormField {
  id: string
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "radio" | "date" | "number" | "rating"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  step?: number
}

interface FormStep {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

interface LeadForm {
  id: string
  name: string
  description: string
  steps: FormStep[]
  isMultiStep: boolean
  submissions: number
  conversionRate: number
  status: "active" | "draft" | "archived"
  createdAt: string
}

const mockForms: LeadForm[] = [
  {
    id: "1",
    name: "Newsletter Signup",
    description: "Simple email collection form",
    steps: [
      {
        id: "step1",
        title: "Contact Information",
        fields: [
          { id: "email", type: "email", label: "Email Address", required: true, step: 1 },
          { id: "name", type: "text", label: "Full Name", required: false, step: 1 },
        ],
      },
    ],
    isMultiStep: false,
    submissions: 1247,
    conversionRate: 23.5,
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Product Demo Request",
    description: "Multi-step form for demo requests",
    steps: [
      {
        id: "step1",
        title: "Basic Information",
        fields: [
          { id: "name", type: "text", label: "Full Name", required: true, step: 1 },
          { id: "email", type: "email", label: "Work Email", required: true, step: 1 },
          { id: "company", type: "text", label: "Company Name", required: true, step: 1 },
        ],
      },
      {
        id: "step2",
        title: "Company Details",
        fields: [
          {
            id: "size",
            type: "select",
            label: "Company Size",
            required: true,
            options: ["1-10", "11-50", "51-200", "200+"],
            step: 2,
          },
          {
            id: "industry",
            type: "select",
            label: "Industry",
            required: true,
            options: ["Technology", "Healthcare", "Finance", "Other"],
            step: 2,
          },
        ],
      },
      {
        id: "step3",
        title: "Requirements",
        fields: [
          { id: "needs", type: "textarea", label: "Tell us about your needs", required: false, step: 3 },
          {
            id: "timeline",
            type: "select",
            label: "Implementation Timeline",
            required: true,
            options: ["ASAP", "1-3 months", "3-6 months", "6+ months"],
            step: 3,
          },
        ],
      },
    ],
    isMultiStep: true,
    submissions: 89,
    conversionRate: 45.2,
    status: "active",
    createdAt: "2024-01-10",
  },
]

const fieldTypes = [
  { value: "text", label: "Text Input", icon: FormInput },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "textarea", label: "Textarea", icon: FileText },
  { value: "select", label: "Dropdown", icon: List },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare },
  { value: "radio", label: "Radio Button", icon: CheckSquare },
  { value: "date", label: "Date Picker", icon: Calendar },
  { value: "number", label: "Number", icon: FormInput },
  { value: "rating", label: "Rating", icon: Star },
]

export default function FormsPage() {
  const [forms, setForms] = useState<LeadForm[]>(mockForms)
  const [isCreating, setIsCreating] = useState(false)
  const [editingForm, setEditingForm] = useState<LeadForm | null>(null)
  const [previewForm, setPreviewForm] = useState<LeadForm | null>(null)

  const FormBuilder = ({
    form,
    onSave,
    onCancel,
  }: { form?: LeadForm; onSave: (form: LeadForm) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState<LeadForm>(
      form || {
        id: Date.now().toString(),
        name: "",
        description: "",
        steps: [
          {
            id: "step1",
            title: "Step 1",
            description: "",
            fields: [],
          },
        ],
        isMultiStep: false,
        submissions: 0,
        conversionRate: 0,
        status: "draft",
        createdAt: new Date().toISOString().split("T")[0],
      },
    )

    const addField = (stepId: string) => {
      const newField: FormField = {
        id: Date.now().toString(),
        type: "text",
        label: "New Field",
        required: false,
        step: formData.steps.findIndex((s) => s.id === stepId) + 1,
      }

      setFormData((prev) => ({
        ...prev,
        steps: prev.steps.map((step) => (step.id === stepId ? { ...step, fields: [...step.fields, newField] } : step)),
      }))
    }

    const updateField = (stepId: string, fieldId: string, updates: Partial<FormField>) => {
      setFormData((prev) => ({
        ...prev,
        steps: prev.steps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                fields: step.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
              }
            : step,
        ),
      }))
    }

    const removeField = (stepId: string, fieldId: string) => {
      setFormData((prev) => ({
        ...prev,
        steps: prev.steps.map((step) =>
          step.id === stepId ? { ...step, fields: step.fields.filter((field) => field.id !== fieldId) } : step,
        ),
      }))
    }

    const addStep = () => {
      if (formData.steps.length >= 5) return

      const newStep: FormStep = {
        id: `step${formData.steps.length + 1}`,
        title: `Step ${formData.steps.length + 1}`,
        description: "",
        fields: [],
      }

      setFormData((prev) => ({
        ...prev,
        steps: [...prev.steps, newStep],
        isMultiStep: true,
      }))
    }

    const removeStep = (stepId: string) => {
      if (formData.steps.length <= 1) return

      setFormData((prev) => ({
        ...prev,
        steps: prev.steps.filter((step) => step.id !== stepId),
        isMultiStep: prev.steps.length > 2,
      }))
    }

    const updateStep = (stepId: string, updates: Partial<FormStep>) => {
      setFormData((prev) => ({
        ...prev,
        steps: prev.steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)),
      }))
    }

    return (
      <div className="space-y-6">
        {/* Form Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Form Settings</CardTitle>
            <CardDescription>Configure your lead generation form</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">Form Name</Label>
                <Input
                  id="form-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter form name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "draft" | "archived") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-description">Description</Label>
              <Textarea
                id="form-description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your form's purpose"
              />
            </div>
          </CardContent>
        </Card>

        {/* Steps Builder */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Form Steps</CardTitle>
              <CardDescription>
                {formData.isMultiStep ? `Multi-step form (${formData.steps.length} steps)` : "Single step form"}
              </CardDescription>
            </div>
            <Button onClick={addStep} disabled={formData.steps.length >= 5} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={formData.steps[0]?.id} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {formData.steps.map((step, index) => (
                  <TabsTrigger key={step.id} value={step.id} className="relative">
                    Step {index + 1}
                    {formData.steps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeStep(step.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {formData.steps.map((step, stepIndex) => (
                <TabsContent key={step.id} value={step.id} className="space-y-4">
                  {/* Step Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Step Title</Label>
                      <Input
                        value={step.title}
                        onChange={(e) => updateStep(step.id, { title: e.target.value })}
                        placeholder="Step title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Step Description</Label>
                      <Input
                        value={step.description || ""}
                        onChange={(e) => updateStep(step.id, { description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Fields</h4>
                      <Button onClick={() => addField(step.id)} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>

                    {step.fields.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No fields added yet. Click "Add Field" to get started.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {step.fields.map((field) => (
                          <Card key={field.id} className="p-4">
                            <div className="flex items-start gap-4">
                              <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                              <div className="flex-1 grid grid-cols-4 gap-4">
                                <div className="space-y-2">
                                  <Label>Field Type</Label>
                                  <Select
                                    value={field.type}
                                    onValueChange={(value) =>
                                      updateField(step.id, field.id, { type: value as FormField["type"] })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {fieldTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          <div className="flex items-center gap-2">
                                            <type.icon className="h-4 w-4" />
                                            {type.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Label</Label>
                                  <Input
                                    value={field.label}
                                    onChange={(e) => updateField(step.id, field.id, { label: e.target.value })}
                                    placeholder="Field label"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Placeholder</Label>
                                  <Input
                                    value={field.placeholder || ""}
                                    onChange={(e) => updateField(step.id, field.id, { placeholder: e.target.value })}
                                    placeholder="Placeholder text"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Required</Label>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={field.required}
                                      onCheckedChange={(checked) =>
                                        updateField(step.id, field.id, { required: checked })
                                      }
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      {field.required ? "Required" : "Optional"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeField(step.id, field.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Options for select/radio fields */}
                            {(field.type === "select" || field.type === "radio") && (
                              <div className="mt-4 space-y-2">
                                <Label>Options (one per line)</Label>
                                <Textarea
                                  value={field.options?.join("\n") || ""}
                                  onChange={(e) =>
                                    updateField(step.id, field.id, {
                                      options: e.target.value.split("\n").filter((opt) => opt.trim()),
                                    })
                                  }
                                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                                  rows={3}
                                />
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPreviewForm(formData)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={() => onSave(formData)}>
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const FormPreview = ({ form }: { form: LeadForm }) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [formValues, setFormValues] = useState<Record<string, any>>({})

    const currentStepData = form.steps[currentStep]
    const isLastStep = currentStep === form.steps.length - 1
    const isFirstStep = currentStep === 0

    const handleNext = () => {
      if (!isLastStep) {
        setCurrentStep((prev) => prev + 1)
      }
    }

    const handlePrev = () => {
      if (!isFirstStep) {
        setCurrentStep((prev) => prev - 1)
      }
    }

    const renderField = (field: FormField) => {
      const value = formValues[field.id] || ""

      switch (field.type) {
        case "text":
        case "email":
        case "phone":
        case "number":
          return (
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
            />
          )
        case "textarea":
          return (
            <Textarea
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
            />
          )
        case "select":
          return (
            <Select value={value} onValueChange={(val) => setFormValues((prev) => ({ ...prev, [field.id]: val }))}>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        case "checkbox":
          return (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setFormValues((prev) => ({ ...prev, [field.id]: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{field.placeholder || "Check this box"}</span>
            </div>
          )
        case "radio":
          return (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    className="border-gray-300"
                  />
                  <span className="text-sm">{option}</span>
                </div>
              ))}
            </div>
          )
        case "date":
          return (
            <Input
              type="date"
              value={value}
              onChange={(e) => setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
            />
          )
        case "rating":
          return (
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormValues((prev) => ({ ...prev, [field.id]: star }))}
                  className={`p-1 ${value >= star ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <Star className="h-5 w-5 fill-current" />
                </button>
              ))}
            </div>
          )
        default:
          return <Input placeholder={field.placeholder} />
      }
    }

    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{form.name}</CardTitle>
                {form.description && <CardDescription>{form.description}</CardDescription>}
              </div>
              {form.isMultiStep && (
                <Badge variant="outline">
                  Step {currentStep + 1} of {form.steps.length}
                </Badge>
              )}
            </div>
            {form.isMultiStep && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / form.steps.length) * 100}%` }}
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
              {currentStepData.description && (
                <p className="text-muted-foreground mb-4">{currentStepData.description}</p>
              )}
            </div>

            <div className="space-y-4">
              {currentStepData.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="flex items-center gap-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            {form.isMultiStep ? (
              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={handlePrev} disabled={isFirstStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={handleNext}>
                  {isLastStep ? "Submit" : "Next"}
                  {!isLastStep && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            ) : (
              <Button className="w-full">Submit</Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSaveForm = (formData: LeadForm) => {
    if (editingForm) {
      setForms((prev) => prev.map((f) => (f.id === formData.id ? formData : f)))
    } else {
      setForms((prev) => [...prev, formData])
    }
    setIsCreating(false)
    setEditingForm(null)
  }

  const handleDeleteForm = (id: string) => {
    setForms((prev) => prev.filter((f) => f.id !== id))
  }

  const handleDuplicateForm = (form: LeadForm) => {
    const duplicated = {
      ...form,
      id: Date.now().toString(),
      name: `${form.name} (Copy)`,
      status: "draft" as const,
      submissions: 0,
      conversionRate: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setForms((prev) => [...prev, duplicated])
  }

  if (isCreating || editingForm) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{editingForm ? "Edit Form" : "Create New Form"}</h1>
              <p className="text-muted-foreground">
                {editingForm ? "Modify your existing form" : "Build a custom lead generation form"}
              </p>
            </div>
          </div>

          <FormBuilder
            form={editingForm || undefined}
            onSave={handleSaveForm}
            onCancel={() => {
              setIsCreating(false)
              setEditingForm(null)
            }}
          />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lead Generation Forms</h1>
            <p className="text-muted-foreground">Create and manage custom forms to capture leads</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FormInput className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.length}</div>
              <p className="text-xs text-muted-foreground">
                {forms.filter((f) => f.status === "active").length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.reduce((acc, form) => acc + form.submissions, 0)}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Conversion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(forms.reduce((acc, form) => acc + form.conversionRate, 0) / forms.length).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Multi-Step Forms</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.filter((f) => f.isMultiStep).length}</div>
              <p className="text-xs text-muted-foreground">
                {((forms.filter((f) => f.isMultiStep).length / forms.length) * 100).toFixed(0)}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Forms List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Forms</CardTitle>
            <CardDescription>Manage your lead generation forms and track their performance</CardDescription>
          </CardHeader>
          <CardContent>
            {forms.length === 0 ? (
              <div className="text-center py-12">
                <FormInput className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No forms created yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first lead generation form to start capturing leads
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Form
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {forms.map((form) => (
                  <Card key={form.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{form.name}</h3>
                            <Badge
                              variant={
                                form.status === "active" ? "default" : form.status === "draft" ? "secondary" : "outline"
                              }
                            >
                              {form.status}
                            </Badge>
                            {form.isMultiStep && <Badge variant="outline">{form.steps.length} steps</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{form.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{form.submissions} submissions</span>
                            <span>{form.conversionRate}% conversion rate</span>
                            <span>Created {form.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPreviewForm(form)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingForm(form)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateForm(form)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPreviewForm(form)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteForm(form.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={!!previewForm} onOpenChange={() => setPreviewForm(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Form Preview</DialogTitle>
              <DialogDescription>This is how your form will appear to visitors</DialogDescription>
            </DialogHeader>
            {previewForm && <FormPreview form={previewForm} />}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
