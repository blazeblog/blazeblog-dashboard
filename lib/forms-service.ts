"use client"

import { useClientApi, type Form, type Step, type Field, type Submission, type FormStats } from './client-api'

/**
 * Custom hook for working with Forms API
 * Provides methods to create, manage, and collect submissions from multi-step forms
 */
export function useFormsService() {
  const api = useClientApi()

  // ============================================================================
  // FORMS MANAGEMENT
  // ============================================================================

  /**
   * Get all forms with optional filtering and pagination
   */
  const getForms = async (filters?: {
    status?: 'active' | 'draft' | 'archived'
    search?: string
    page?: number
    limit?: number
  }): Promise<{
    items: Form[]
    total: number
    page: number
    limit: number
  }> => {
    const queryParams = new URLSearchParams()
    if (filters?.status) queryParams.set('status', filters.status)
    if (filters?.search) queryParams.set('search', filters.search)
    if (filters?.page) queryParams.set('page', filters.page.toString())
    if (filters?.limit) queryParams.set('limit', filters.limit.toString())
    
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/forms?${queryString}` : '/forms'
    
    return api.get<{
      items: Form[]
      total: number
      page: number
      limit: number
    }>(endpoint)
  }

  /**
   * Get a specific form by ID with all steps and fields
   */
  const getForm = async (formId: string): Promise<Form> => {
    return api.get<Form>(`/forms/${formId}`)
  }

  /**
   * Create a new form with steps and fields
   */
  const createForm = async (formData: Omit<Form, 'createdAt' | 'updatedAt'>): Promise<Form> => {
    return api.post<Form>('/forms', formData)
  }

  /**
   * Update an existing form
   */
  const updateForm = async (formId: string, updates: Partial<Form>): Promise<Form> => {
    return api.put<Form>(`/forms/${formId}`, updates)
  }

  /**
   * Delete a form and all its data
   */
  const deleteForm = async (formId: string): Promise<void> => {
    return api.delete(`/forms/${formId}`)
  }

  /**
   * Duplicate an existing form
   */
  const duplicateForm = async (formId: string, newName?: string): Promise<Form> => {
    const originalForm = await getForm(formId)
    
    // Create a new form based on the original
    const duplicatedForm: Omit<Form, 'createdAt' | 'updatedAt'> = {
      ...originalForm,
      id: `form_${Date.now()}`, // Generate new ID
      name: newName || `${originalForm.name} (Copy)`,
      status: 'draft',
      steps: originalForm.steps?.map((step, stepIndex) => ({
        ...step,
        id: `step_${Date.now()}_${stepIndex}`,
        formId: `form_${Date.now()}`,
        fields: step.fields.map((field, fieldIndex) => ({
          ...field,
          id: `field_${Date.now()}_${stepIndex}_${fieldIndex}`,
          stepId: `step_${Date.now()}_${stepIndex}`
        }))
      })) || []
    }
    
    return createForm(duplicatedForm)
  }

  // ============================================================================
  // FORM SUBMISSIONS
  // ============================================================================

  /**
   * Submit a completed form with all step data
   */
  const submitForm = async (formId: string, submissionData: {
    id?: string
    data: Record<string, any>
  }): Promise<Submission> => {
    return api.post<Submission>(`/forms/${formId}/submissions`, submissionData)
  }

  /**
   * Get all submissions for a form with pagination
   */
  const getFormSubmissions = async (formId: string, options?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{
    items: Submission[]
    total: number
    page: number
    limit: number
  }> => {
    const queryParams = new URLSearchParams()
    if (options?.page) queryParams.set('page', options.page.toString())
    if (options?.limit) queryParams.set('limit', options.limit.toString())
    if (options?.search) queryParams.set('search', options.search)
    
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/forms/${formId}/submissions?${queryString}` : `/forms/${formId}/submissions`
    
    return api.get<{
      items: Submission[]
      total: number
      page: number
      limit: number
    }>(endpoint)
  }

  /**
   * Get a specific submission
   */
  const getSubmission = async (formId: string, submissionId: string): Promise<Submission> => {
    return api.get<Submission>(`/forms/${formId}/submissions/${submissionId}`)
  }

  /**
   * Delete a submission
   */
  const deleteSubmission = async (formId: string, submissionId: string): Promise<void> => {
    return api.delete(`/forms/${formId}/submissions/${submissionId}`)
  }

  // ============================================================================
  // FORM STATISTICS
  // ============================================================================

  /**
   * Get analytics data for a form
   */
  const getFormStats = async (formId: string): Promise<FormStats> => {
    return api.get<FormStats>(`/forms/${formId}/stats`)
  }

  /**
   * Get aggregated statistics for all forms
   */
  const getAllFormsStats = async (): Promise<{
    totalForms: number
    activeForms: number
    totalSubmissions: number
    averageConversionRate: number
    topPerformingForms: Array<{ formId: string; name: string; conversionRate: number; submissions: number }>
  }> => {
    const formsResponse = await getForms({ limit: 1000 }) // Get all forms
    const forms = formsResponse.items
    
    // Use the submission counts directly from the API response for better performance
    const totalForms = formsResponse.total
    const activeForms = forms.filter(f => f.status === 'active').length
    const totalSubmissions = forms.reduce((sum, form) => {
      const count = typeof form.submissionCount === 'string' 
        ? parseInt(form.submissionCount) 
        : (form.submissionCount || 0)
      return sum + count
    }, 0)
    
    // For detailed stats like conversion rates, we still need to call the individual APIs
    const statsPromises = forms.slice(0, 10).map(form => // Limit to top 10 for performance
      getFormStats(form.id).catch(() => ({ 
        totalSubmissions: 0, 
        conversionRate: 0,
        lastSubmissionAt: undefined
      }))
    )
    
    const detailedStats = await Promise.all(statsPromises)
    const averageConversionRate = detailedStats.length > 0 
      ? detailedStats.reduce((sum, stats) => sum + stats.conversionRate, 0) / detailedStats.length 
      : 0

    const topPerformingForms = forms
      .slice(0, 10) // Limit to top 10 for performance
      .map((form, index) => ({
        formId: form.id,
        name: form.name,
        conversionRate: detailedStats[index]?.conversionRate || 0,
        submissions: detailedStats[index]?.totalSubmissions || 0
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5)

    return {
      totalForms,
      activeForms,
      totalSubmissions,
      averageConversionRate,
      topPerformingForms
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Generate a unique ID for forms, steps, fields, or submissions
   */
  const generateId = (prefix: 'form' | 'step' | 'field' | 'submission' = 'form'): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `${prefix}_${timestamp}_${random}`
  }

  /**
   * Validate form data before submission
   */
  const validateFormData = (form: Form, submissionData: Record<string, any>): {
    isValid: boolean
    errors: Array<{ fieldId: string; message: string }>
  } => {
    const errors: Array<{ fieldId: string; message: string }> = []

    if (!form.steps) {
      return { isValid: true, errors: [] }
    }

    form.steps.forEach(step => {
      step.fields.forEach(field => {
        const value = submissionData[field.id]
        
        // Check required fields
        if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
          errors.push({
            fieldId: field.id,
            message: `${field.label} is required`
          })
        }

        // Validate email fields
        if (field.type === 'email' && value && typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            errors.push({
              fieldId: field.id,
              message: `${field.label} must be a valid email address`
            })
          }
        }

        // Validate phone fields
        if (field.type === 'phone' && value && typeof value === 'string') {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
          if (!phoneRegex.test(value.replace(/\D/g, ''))) {
            errors.push({
              fieldId: field.id,
              message: `${field.label} must be a valid phone number`
            })
          }
        }

        // Validate number fields
        if (field.type === 'number' && value && isNaN(Number(value))) {
          errors.push({
            fieldId: field.id,
            message: `${field.label} must be a number`
          })
        }
      })
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Calculate form completion percentage
   */
  const calculateCompletionPercentage = (form: Form, submissionData: Record<string, any>): number => {
    if (!form.steps) return 0
    
    const totalFields = form.steps.reduce((sum, step) => sum + step.fields.length, 0)
    const completedFields = Object.keys(submissionData).filter(key => {
      const value = submissionData[key]
      return value !== null && value !== undefined && value !== ''
    }).length

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
  }

  return {
    // Forms management
    getForms,
    getForm,
    createForm,
    updateForm,
    deleteForm,
    duplicateForm,
    
    // Form submissions
    submitForm,
    getFormSubmissions,
    getSubmission,
    deleteSubmission,
    
    // Statistics
    getFormStats,
    getAllFormsStats,
    
    // Utilities
    generateId,
    validateFormData,
    calculateCompletionPercentage
  }
}

/**
 * Utility functions for working with form data
 */
export class FormsUtils {
  /**
   * Convert form field data to a readable format
   */
  static formatFieldValue(field: Field, value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'Not provided'
    }

    switch (field.type) {
      case 'checkbox':
        return value ? 'Yes' : 'No'
      case 'rating':
        return `${value}/5 stars`
      case 'select':
      case 'radio':
        return value.toString()
      case 'date':
        try {
          return new Date(value).toLocaleDateString()
        } catch {
          return value.toString()
        }
      default:
        return value.toString()
    }
  }

  /**
   * Generate a CSV export of form submissions
   */
  static generateSubmissionsCSV(form: Form, submissions: Submission[]): string {
    if (submissions.length === 0 || !form.steps) return ''

    // Get all field labels for headers
    const headers = ['Submission ID', 'Submitted At']
    form.steps.forEach(step => {
      step.fields.forEach(field => {
        headers.push(field.label)
      })
    })

    // Generate CSV rows
    const rows = [headers]
    
    submissions.forEach(submission => {
      const row = [submission.id, new Date(submission.submittedAt).toLocaleString()]
      
      form.steps.forEach(step => {
        step.fields.forEach(field => {
          const value = submission.data[field.id]
          row.push(FormsUtils.formatFieldValue(field, value))
        })
      })
      
      rows.push(row)
    })

    // Convert to CSV string
    return rows.map(row => 
      row.map(cell => `"${cell?.toString().replace(/"/g, '""') || ''}"`).join(',')
    ).join('\n')
  }
}