// src/types/index.ts

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

// ============================================================
// INVENTORY ITEM TYPES
// ============================================================

export interface InventoryItem {
  id: string
  name: string
  code: string
  color: string
  size: string
  warehouseId: string
  warehouseName: string
  cartonsCount: number
  perCartonCount: number
  singleBottlesCount: number
  remainingQuantity: number
  totalAdded: number
  supplier: string
  location: string
  notes: string
  photoUrl: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  tenantId: string
  created_by_name: string
  updated_by_name: string
  version?: number
}

// ============================================================
// TRANSACTION TYPES
// ============================================================

export interface Transaction {
  id: string
  type: string
  typeLabel?: string
  itemId: string
  itemName: string
  itemCode: string
  itemSize: string
  fromWarehouse: string
  toWarehouse: string
  destination: string
  destinationId: string
  cartonsDelta: number
  perCartonUpdated: number
  singleDelta: number
  totalDelta: number
  newRemaining: number
  previousQuantity?: number
  notes: string
  userId: string
  createdBy: string
  createdAt: Date
  tenantId: string
  transaction_id?: string
}

// ============================================================
// TRANSFER PARAMS
// ============================================================

export interface TransferParams {
  item_id: string
  from_warehouse_id: string
  to_warehouse_id: string
  cartons_count: number
  single_bottles_count: number
  notes?: string
  destination?: string
  destination_id?: string
  transaction_id?: string
}

// ============================================================
// TRANSFER RESPONSE
// ============================================================

export interface TransferResponse {
  success: boolean
  transferred?: number
  dest_item_id?: string
  source_new_quantity?: number
  destination_new_quantity?: number
  was_update?: boolean
  source_version?: number
  dest_version?: number
  transaction_id?: string
  message?: string
}

// Item Transaction types for the inventory movement system
export interface ItemTransaction {
  id: number
  item_code: string
  item_name: string
  item_color: string
  date: string
  type: 'IN' | 'OUT'
  quantity: number
  voucher: string
  party: string
  notes: string
  balance?: number
}

export interface RunningBalance {
  date: string
  voucher: string
  qty_in: number
  qty_out: number
  party: string
  source: string
  notes: string
  balance: number
}

export interface ExportResult {
  success_count: number
  total_count: number
  failed_items: string[]
  file_path: string
}

export interface BalanceVerificationResult {
  success: boolean
  current_balance: number
  calculated_balance: number
  current_added: number
  calculated_added: number
  total_in: number
  total_out: number
  message: string
}

// ============================================================
// DELETE CONFIRMATION TYPES
// ============================================================

export interface DeleteConfirmationData {
  invoiceId: string
  returnItems: boolean
}

export interface DeleteConfirmationOption {
  id: 'with_return' | 'without_return'
  label: string
  description: string
  icon: string
  color: string
}

export const DELETE_CONFIRMATION_OPTIONS: DeleteConfirmationOption[] = [
  {
    id: 'with_return',
    label: 'حذف مع إرجاع الكميات',
    description: 'سيتم إرجاع جميع الأصناف إلى المخازن',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    color: 'green'
  },
  {
    id: 'without_return',
    label: 'حذف بدون إرجاع الكميات',
    description: 'سيتم حذف الفاتورة فقط، تبقى الكميات كما هي',
    icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    color: 'red'
  }
]

// ============================================================
// INVOICE TYPES - UPDATED FOR NEW SCHEMA
// ============================================================

export interface InvoiceItem {
  id: string
  invoice_id: string
  item_id: string
  name: string
  code: string | null
  size: string | null
  color: string | null
  quantity: number
  unit_price: number
  total: number
  warehouse_id: string
  per_carton_count: number
  created_at: string | Date
  updated_at: string | Date
  tenant_id: string
}

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
  customer_notes?: string
  payment_terms?: string
  currency: string
  created_by?: string
  created_at: Date | string
  updated_at?: Date | string
  updated_by?: string
  tenant_id: string
}

// For creating a new invoice
export interface CreateInvoiceItem {
  item_id: string
  name: string
  code?: string | null
  size?: string | null
  color?: string | null
  quantity: number
  unit_price: number
  total: number
  warehouse_id: string
  per_carton_count?: number
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
  items: CreateInvoiceItem[]
  warehouse_id: string
  country: string
  vat_country: string
  invoice_date: Date | string
  due_date?: Date | string
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

// For updating an existing invoice
export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  id: string
}

// For invoice list filtering
export interface InvoiceFilters {
  search?: string
  status?: 'draft' | 'issued' | 'paid' | 'cancelled'
  type?: 'B2B' | 'B2C' | 'simplified'
  dateFrom?: Date | string
  dateTo?: Date | string
  customerName?: string
  invoiceNumber?: string
  warehouseId?: string
  dateRange?: string
}

// Invoice pagination
export interface InvoicePagination {
  currentPage: number
  pageSize: number
  totalItems?: number
  totalPages?: number
}

// Invoice statistics
export interface InvoiceStats {
  totalInvoices: number
  totalAmount: number
  pendingAmount: number
  paidAmount: number
  cancelledAmount: number
  draftCount: number
  issuedCount: number
  paidCount: number
  cancelledCount: number
  averageAmount: number
  maxAmount: number
  minAmount: number
}

// Invoice preview data (for modal)
export interface InvoicePreviewData {
  customer: {
    name: string
    phone: string
    email?: string
    address?: string
    tax_number?: string
  }
  items: InvoiceItem[]
  notes: string
  terms: string
  status: 'draft' | 'issued' | 'paid' | 'cancelled'
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  vat_rate: number
  shipping_cost: number
  subtotal: number
  discountAmount: number
  vatAmount: number
  totalAmount: number
}

// Invoice response from API
export interface InvoiceResponse {
  success: boolean
  message?: string
  data?: Invoice
  errors?: Record<string, string>
}

// Invoice list response
export interface InvoiceListResponse {
  success: boolean
  data: Invoice[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================
// COMPANY INFO TYPES
// ============================================================

export interface CompanyInfo {
  name: string
  taxNumber: string
  address: string
  phone: string
  email: string
  logoUrl?: string
}

// ============================================================
// ENUMS
// ============================================================

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
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
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

export enum InvoiceType {
  B2B = 'B2B',
  B2C = 'B2C',
  SIMPLIFIED = 'simplified',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

// ============================================================
// USER TYPES
// ============================================================

export interface User {
  id: string
  email: string
  name: string
  role: 'superadmin' | 'company_manager' | 'warehouse_manager' | 'viewer'
  tenant_id?: string
  created_at: Date | string
  updated_at?: Date | string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'superadmin' | 'company_manager' | 'warehouse_manager' | 'viewer'
  tenantId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  allowedWarehouses: string[]
  allowedDispatchWarehouses: string[]
  permissions: string[]
  is_trial?: boolean
  trial_ends_at?: string | null
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
  role?: 'superadmin' | 'company_manager' | 'warehouse_manager' | 'viewer'
}

// ============================================================
// CUSTOMER TYPES
// ============================================================

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

// ============================================================
// SETTINGS TYPES
// ============================================================

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

// ============================================================
// WAREHOUSE TYPES
// ============================================================

export interface Warehouse {
  id: string
  name: string
  name_ar?: string
  name_en?: string
  type: 'primary' | 'dispatch'
  is_main: boolean
  is_active: boolean
  location?: string
  description?: string
  capacity?: number
  tenant_id: string
  created_at: Date | string
  updated_at?: Date | string
  created_by?: string
  updated_by?: string
}