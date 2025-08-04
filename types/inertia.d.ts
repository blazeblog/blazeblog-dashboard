export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  clerkId: string
  role: string
  createdAt: string
  updatedAt: string
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

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

export interface DashboardStats {
  totalUsers: number
  totalPosts: number
  totalViews: number
  totalForms: number
  totalCategories: number
  totalComments: number
}

export interface PageProps<T extends Record<string, unknown> = Record<string, unknown>> {
  auth: {
    user: User
  }
  flash: {
    message?: string
    error?: string
  }
  errors: Record<string, string>
}

// Extend page props for specific pages
export interface DashboardPageProps extends PageProps<Record<string, unknown>> {
  stats: DashboardStats
  recentPosts: Post[]
  recentUsers: User[]
}

export interface PostsIndexPageProps extends PageProps<Record<string, unknown>> {
  posts: PaginatedResponse<Post>
  categories: Category[]
  filters: {
    search?: string
    category?: string
    status?: string
  }
}

export interface PostsCreatePageProps extends PageProps<Record<string, unknown>> {
  categories: Category[]
}

export interface PostsEditPageProps extends PageProps<Record<string, unknown>> {
  post: Post
  categories: Category[]
}

// Global Inertia props
declare global {
  namespace Inertia {
    interface PageProps<T extends Record<string, unknown> = Record<string, unknown>> {
      auth: {
        user: User
      }
      flash: {
        message?: string
        error?: string
      }
      errors: Record<string, string>
    }
  }
}
