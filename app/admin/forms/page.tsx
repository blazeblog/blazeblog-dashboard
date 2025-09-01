"use client"

import { useState, useEffect, useCallback } from "react"
import { usePageTitle } from "@/hooks/use-page-title"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
  Loader2,
} from "lucide-react"
import { useFormsService } from "@/lib/forms-service"
import { type Form, type Step, type Field, type FieldType } from "@/lib/client-api"
import { useToast } from "@/hooks/use-toast"

// Use the API types directly - no need for duplicate interfaces

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
] as const

export default function FormsPage() {
  usePageTitle("Forms - BlazeBlog Admin")
  const [forms, setForms] = useState<Form[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const [previewForm, setPreviewForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({
    totalForms: 0,
    activeForms: 0,
    totalSubmissions: 0,
    averageConversionRate: 0
  })

  const formsService = useFormsService()
  const { toast } = useToast()

  // Load forms and stats on component mount
  useEffect(() => {
    loadForms()
    loadStats()
  }, [])

  const loadForms = async () => {
    try {
      setLoading(true)
      const formsData = await formsService.getForms()
      setForms(formsData)
    } catch (error) {
      console.error('Error loading forms:', error)
      toast({
        title: "Error",
        description: "Failed to load forms. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await formsService.getAllFormsStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const FormBuilder = ({
    form,
    onSave,
    onCancel,
  }: { form?: Form; onSave: (form: Form) => void; onCancel: () => void }) => {
    const [activeStepIndex, setActiveStepIndex] = useState(0)
    const [formData, setFormData] = useState<Form>(() => {
      const formId = form?.id || `form_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      const stepId = `step_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      
      return form || {
        id: formId,
        name: "",
        description: "",
        steps: [
          {
            id: stepId,
            title: "Step 1",
            description: "",
            stepOrder: 0,
            formId: formId,
            fields: [],
          },
        ],
        isMultiStep: false,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

    // Reset form data when switching between forms, but only if we're not currently editing
    useEffect(() => {
      if (form && form.id !== formData.id) {
        setFormData(form)
      }
    }, [form, formData.id])

    const addField = useCallback((stepId: string) => {
      setFormData((prev) => {
        const step = prev.steps.find(s => s.id === stepId)
        const newField: Field = {
          id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          type: "text",
          label: "New Field",
          required: false,
          fieldOrder: step?.fields.length || 0,
          stepId: stepId,
        }

        return {
          ...prev,
          steps: prev.steps.map((step) => (step.id === stepId ? { ...step, fields: [...step.fields, newField] } : step)),
        }
      })
    }, [])

    const updateField = useCallback((stepId: string, fieldId: string, updates: Partial<Field>) => {
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
    }, [])

    const removeField = useCallback((stepId: string, fieldId: string) => {
      setFormData((prev) => ({
        ...prev,
        steps: prev.steps.map((step) =>
          step.id === stepId ? { ...step, fields: step.fields.filter((field) => field.id !== fieldId) } : step,
        ),
      }))
    }, [])

    const addStep = useCallback(() => {
      setFormData((prev) => {
        if (prev.steps.length >= 5) return prev

        const newStep: Step = {
          id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          title: `Step ${prev.steps.length + 1}`,
          description: "",
          stepOrder: prev.steps.length,
          formId: prev.id,
          fields: [],
        }

        return {
          ...prev,
          steps: [...prev.steps, newStep],
          isMultiStep: true,
        }
      })
      // Set active step to the newly created step
      setActiveStepIndex((prev) => prev + 1)
    }, [])

    const removeStep = useCallback((stepId: string) => {
      setFormData((prev) => {
        if (prev.steps.length <= 1) return prev
        
        return {
          ...prev,
          steps: prev.steps.filter((step) => step.id !== stepId),
          isMultiStep: prev.steps.length > 2,
        }
      })
    }, [])

    const updateStep = useCallback((stepId: string, updates: Partial<Step>) => {
      setFormData((prev) => ({
        ...prev,
        steps: prev.steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)),
      }))
    }, [])

    return (
      <form onSubmit={(e) => e.preventDefault()}>
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
            <Button type="button" onClick={addStep} disabled={formData.steps.length >= 5} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Step Navigation */}
              <div className="flex items-center justify-center space-x-4 py-4 border-b">
                {formData.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      type="button"
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setActiveStepIndex(index)}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        index === activeStepIndex 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`text-sm font-medium ${
                        index === activeStepIndex ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step.title || `Step ${index + 1}`}
                      </span>
                    </button>
                    {formData.steps.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground ml-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeStep(step.id)
                          if (index === activeStepIndex && activeStepIndex > 0) {
                            setActiveStepIndex(activeStepIndex - 1)
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    {index < formData.steps.length - 1 && (
                      <div className="w-8 h-0.5 bg-border mx-4"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Active Step Content */}
              {formData.steps[activeStepIndex] && (
                <div key={formData.steps[activeStepIndex].id} className="space-y-4">
                  {/* Step Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Step Title</Label>
                      <Input
                        value={formData.steps[activeStepIndex].title}
                        onChange={(e) => updateStep(formData.steps[activeStepIndex].id, { title: e.target.value })}
                        placeholder="Step title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Step Description</Label>
                      <Input
                        value={formData.steps[activeStepIndex].description || ""}
                        onChange={(e) => updateStep(formData.steps[activeStepIndex].id, { description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Fields</h4>
                      <Button type="button" onClick={() => addField(formData.steps[activeStepIndex].id)} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>

                    {formData.steps[activeStepIndex].fields.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No fields added yet. Click "Add Field" to get started.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.steps[activeStepIndex].fields.map((field, _fieldIndex) => (
                          <Card key={field.id} className="p-4">
                            <div className="flex items-start gap-4">
                              <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                              <div className="flex-1 grid grid-cols-4 gap-4">
                                <div className="space-y-2">
                                  <Label>Field Type</Label>
                                  <Select
                                    value={field.type}
                                    onValueChange={(value) =>
                                      updateField(formData.steps[activeStepIndex].id, field.id, { type: value as FieldType })
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
                                    onChange={(e) => updateField(formData.steps[activeStepIndex].id, field.id, { label: e.target.value })}
                                    placeholder="Field label"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Placeholder</Label>
                                  <Input
                                    value={field.placeholder || ""}
                                    onChange={(e) => updateField(formData.steps[activeStepIndex].id, field.id, { placeholder: e.target.value })}
                                    placeholder="Placeholder text"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Required</Label>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={field.required}
                                      onCheckedChange={(checked) =>
                                        updateField(formData.steps[activeStepIndex].id, field.id, { required: checked })
                                      }
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      {field.required ? "Required" : "Optional"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeField(formData.steps[activeStepIndex].id, field.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Options for select/radio/checkbox fields */}
                            {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                              <div className="mt-4 space-y-2">
                                <Label>Options (one per line)</Label>
                                <Textarea
                                  value={field.options?.join("\n") || ""}
                                  onChange={(e) =>
                                    updateField(formData.steps[activeStepIndex].id, field.id, {
                                      options: e.target.value.split("\n"),
                                    })
                                  }
                                  onBlur={(e) => {
                                    // Clean up empty lines when user finishes editing
                                    const cleanedOptions = e.target.value.split("\n").filter((opt) => opt.trim())
                                    if (cleanedOptions.join("\n") !== e.target.value) {
                                      updateField(formData.steps[activeStepIndex].id, field.id, {
                                        options: cleanedOptions,
                                      })
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    // Allow Enter key to create new lines
                                    if (e.key === 'Enter') {
                                      e.stopPropagation()
                                    }
                                  }}
                                  placeholder={"Option 1\nOption 2\nOption 3"}
                                  rows={5}
                                  className="resize-none"
                                />
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
                  disabled={activeStepIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Step
                </Button>
                <span className="text-sm text-muted-foreground">
                  Step {activeStepIndex + 1} of {formData.steps.length}
                </span>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setActiveStepIndex(Math.min(formData.steps.length - 1, activeStepIndex + 1))}
                  disabled={activeStepIndex === formData.steps.length - 1}
                >
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => setPreviewForm(formData)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button type="button" onClick={() => onSave(formData)} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Form
                </>
              )}
            </Button>
          </div>
        </div>
        </div>
      </form>
    )
  }

  const FormPreview = ({ form }: { form: Form }) => {
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

    const renderField = (field: Field) => {
      const value = formValues[field.id] || ""

      switch (field.type) {
        case "text":
        case "email":
        case "phone":
        case "number":
          return (
            <Input
              type={field.type}
              placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
              value={value}
              onChange={(e) => setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
              className="h-12 px-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            />
          )
        case "textarea":
          return (
            <Textarea
              placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
              value={value}
              onChange={(e) => setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
              className="min-h-24 px-4 py-3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors resize-none"
              rows={4}
            />
          )
        case "select":
          return (
            <Select value={value} onValueChange={(val) => setFormValues((prev) => ({ ...prev, [field.id]: val }))}>
              <SelectTrigger className="h-12 px-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400">
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
            <div className="space-y-3">
              {field.options?.length ? (
                field.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={(value as string[])?.includes(option) || false}
                      onChange={(e) => {
                        const currentValues = (value as string[]) || []
                        const newValues = e.target.checked 
                          ? [...currentValues, option]
                          : currentValues.filter(v => v !== option)
                        setFormValues((prev) => ({ ...prev, [field.id]: newValues }))
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{option}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.id]: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.placeholder || "Check this box"}</span>
                </div>
              )}
            </div>
          )
        case "radio":
          return (
            <div className="space-y-3">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{option}</span>
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
              className="h-12 px-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            />
          )
        case "rating":
          return (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormValues((prev) => ({ ...prev, [field.id]: star }))}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                      value >= star 
                        ? "text-yellow-400 hover:text-yellow-500" 
                        : "text-gray-300 dark:text-gray-600 hover:text-gray-400"
                    }`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
              {value && (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {value} out of 5 stars
                </span>
              )}
            </div>
          )
        default:
          return <Input placeholder={field.placeholder} />
      }
    }

    return (
      <div className="w-full">
        {/* Form Container with beautiful styling */}
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Form Header */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{form.name}</h1>
                {form.description && (
                  <p className="text-gray-600 dark:text-gray-300">{form.description}</p>
                )}
              </div>
              {form.isMultiStep && (
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="px-3 py-1">
                    Step {currentStep + 1} of {form.steps.length}
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Progress Bar for Multi-step */}
            {form.isMultiStep && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(((currentStep + 1) / form.steps.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep + 1) / form.steps.length) * 100}%` }}
                  />
                </div>
                
                {/* Step Indicators */}
                <div className="flex justify-between mt-4">
                  {form.steps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center space-y-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        index <= currentStep 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`text-xs font-medium max-w-[80px] text-center ${
                        index <= currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Form Content */}
          <div className="px-8 py-8 space-y-8">
            {/* Step Title and Description */}
            {currentStepData && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h2>
                {currentStepData.description && (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {currentStepData.description}
                  </p>
                )}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {currentStepData?.fields.map((field) => (
                <div key={field.id} className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 text-xs bg-red-50 dark:bg-red-950 px-1.5 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    {renderField(field)}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
              {form.isMultiStep ? (
                <div className="flex items-center justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrev} 
                    disabled={isFirstStep}
                    className="px-6 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLastStep ? "Submit Form" : "Next Step"}
                    {!isLastStep && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              ) : (
                <Button 
                  type="button" 
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Submit Form
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSaveForm = async (formData: Form) => {
    try {
      setSaving(true)
      let savedForm: Form

      if (editingForm) {
        // Update existing form
        savedForm = await formsService.updateForm(formData.id, formData)
        setForms((prev) => prev.map((f) => (f.id === formData.id ? savedForm : f)))
        toast({
          title: "Success!",
          description: `Form "${formData.name}" has been updated successfully.`,
          variant: "default"
        })
      } else {
        // Create new form
        savedForm = await formsService.createForm(formData)
        setForms((prev) => [...prev, savedForm])
        toast({
          title: "Success!",
          description: `Form "${formData.name}" has been created successfully.`,
          variant: "default"
        })
      }

      setIsCreating(false)
      setEditingForm(null)
      loadStats() // Refresh stats
    } catch (error) {
      console.error('Error saving form:', error)
      toast({
        title: "Error",
        description: "Failed to save form. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteForm = async (id: string) => {
    try {
      await formsService.deleteForm(id)
      setForms((prev) => prev.filter((f) => f.id !== id))
      loadStats() // Refresh stats
      toast({
        title: "Success!",
        description: "Form has been deleted successfully.",
        variant: "default"
      })
    } catch (error) {
      console.error('Error deleting form:', error)
      toast({
        title: "Error",
        description: "Failed to delete form. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDuplicateForm = async (form: Form) => {
    try {
      const duplicated = await formsService.duplicateForm(form.id, `${form.name} (Copy)`)
      setForms((prev) => [...prev, duplicated])
      loadStats() // Refresh stats
      toast({
        title: "Success!",
        description: `Form "${duplicated.name}" has been duplicated successfully.`,
        variant: "default"
      })
    } catch (error) {
      console.error('Error duplicating form:', error)
      toast({
        title: "Error",
        description: "Failed to duplicate form. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (isCreating || editingForm) {
    return (
      <AdminLayout title={editingForm ? "Edit Form" : "Create Form"}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
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
    <AdminLayout title="Forms">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">Create and manage custom forms to capture leads</p>
          </div>
          <Button type="button" onClick={() => setIsCreating(true)}>
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
              <div className="text-2xl font-bold">{stats.totalForms}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeForms} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">Across all forms</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Conversion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageConversionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
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
                {forms.length > 0 ? ((forms.filter((f) => f.isMultiStep).length / forms.length) * 100).toFixed(0) : 0}% of total
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
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Loading forms...</h3>
                <p className="text-muted-foreground">Please wait while we fetch your forms</p>
              </div>
            ) : forms.length === 0 ? (
              <div className="text-center py-12">
                <FormInput className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No forms created yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first lead generation form to start capturing leads
                </p>
                <Button type="button" onClick={() => setIsCreating(true)}>
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
                            <span>{form.submissions?.length || 0} submissions</span>
                            <span>Status: {form.status}</span>
                            <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setPreviewForm(form)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/admin/forms/${form.id}/submissions`}>
                            <Users className="h-4 w-4" />
                          </a>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="sm">
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
                            <DropdownMenuItem onClick={() => window.open(`/admin/forms/${form.id}/submissions`, '_blank')}>
                              <Users className="h-4 w-4 mr-2" />
                              View Submissions
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
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Form Preview
              </DialogTitle>
              <DialogDescription className="space-y-2">
                <p>This is how your form will appear to visitors on your website.</p>
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Correct themes and styling will be applied when displayed on your actual website.
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>
            {previewForm && <FormPreview form={previewForm} />}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
