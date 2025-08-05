export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  roles?: Role[]
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
}

export interface Permission {
  id: number
  name: string
  action: string
  subject: string
}

export interface Post {
  id: number
  title: string
  content: string
  excerpt: string
  category_id: number
  category?: Category
  status: "draft" | "published" | "archived"
  featured_image?: string
  tags: string
  views: number
  author_id: number
  author?: User
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  color?: string
  posts_count: number
  created_at: string
  updated_at: string
}

export interface Form {
  id: number
  name: string
  description?: string
  fields: FormField[]
  steps: FormStep[]
  status: "draft" | "active" | "archived"
  submissions_count: number
  conversion_rate: number
  created_at: string
  updated_at: string
}

export interface FormField {
  id: string
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "radio" | "date" | "number" | "rating"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  step: number
}

export interface FormStep {
  id: number
  title: string
  description?: string
  fields: FormField[]
}

export interface PageProps<T extends Record<string, unknown> = Record<string, unknown>> {
  auth: {
    user: User
  }
  flash: {
    message?: string
    error?: string
  }\
}
& T
