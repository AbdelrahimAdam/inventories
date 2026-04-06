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

// Invoice Types
export interface Invoice {
  id: string
  invoice_number: string
  type: 'B2B' | 'B2C' | 'simplified'
  customer: {
    name: string
    phone: string
    email?: string
    address?: string
    tax_number?: string
  }
  items: InvoiceItem[]
  warehouse_id: string
  warehouse_name?: string
  country: string
  vat_country: string
  invoice_date: Date | string
  due_date: Date | string
  subtotal: number
  vat_rate: number
  vat_amount: number
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  status: 'draft' | 'issued' | 'paid' | 'cancelled'
  notes?: string
  terms?: string
  payment_terms?: string
  currency: string
  created_by?: string
  created_at: Date | string
  updated_at?: Date | string
  tenant_id: string
}

export interface InvoiceItem {
  item_id: string
  name: string
  code: string
  size?: string
  quantity: number
  unit_price: number
  total: number
  maxQuantity?: number
}

export interface CreateInvoiceData {
  type: 'B2B' | 'B2C' | 'simplified'
  customer: {
    name: string
    phone: string
    email?: string
    address?: string
    tax_number?: string
  }
  items: Omit<InvoiceItem, 'total'>[]
  warehouse_id: string
  country: string
  vat_country: string
  invoice_date: string
  due_date: string
  subtotal: number
  vat_rate: number
  vat_amount: number
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  status: 'draft' | 'issued' | 'paid' | 'cancelled'
  notes?: string
  terms?: string
  payment_terms?: string
  currency: string
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  id: string
}

export interface InvoiceFilters {
  search?: string
  status?: InvoiceStatus
  type?: 'B2B' | 'B2C' | 'simplified'
  dateFrom?: Date | string
  dateTo?: Date | string
  customerName?: string
  invoiceNumber?: string
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

// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'super_admin'
  tenant_id?: string
  created_at: Date | string
  updated_at?: Date | string
}

export interface AuthResponse {
  user: User
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  tenant_id?: string
}

// Customer types
export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  tax_number?: string
  created_at: Date | string
  updated_at?: Date | string
  tenant_id: string
}

// Settings types
export interface Settings {
  id: string
  company_name: string
  company_logo?: string
  vat_rate: number
  currency: string
  language: string
  timezone: string
  date_format: string
  tenant_id: string
  updated_at: Date | string
}

export interface SystemSettings {
  app_name: string
  app_version: string
  maintenance_mode: boolean
  allowed_origins: string[]
  max_upload_size: number
  supported_languages: string[]
  default_language: string
  default_currency: string
}