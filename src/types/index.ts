// Export all types from individual files
export * from './auth'
export * from './inventory'
export * from './product'
export * from './warehouse'

// Common types used across the application
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface FilterOptions {
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: string
  dateFrom?: Date
  dateTo?: Date
  warehouseId?: string
  categoryId?: string
  brandId?: string
}

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: string
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
  title?: string
}

export interface MenuItem {
  label: string
  path?: string
  icon?: string
  children?: MenuItem[]
  permission?: string
  onClick?: () => void
}

export interface StatsCard {
  title: string
  value: number | string
  icon: string
  change?: number
  color?: string
  background?: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    fill?: boolean
  }[]
}

export interface DateRange {
  start: Date
  end: Date
}

// Form validation types
export interface ValidationError {
  field: string
  message: string
}

export interface FormState<T = any> {
  data: T
  errors: ValidationError[]
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
}

// Export enum for common status values
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DELETED = 'deleted',
}

export enum TransactionType {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  TRANSFER = 'TRANSFER',
  DISPATCH = 'DISPATCH',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  ONLINE = 'online',
}