export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'superadmin' | 'admin' | 'company_manager' | 'warehouse_manager' | 'user'
  tenantId: string
  avatar?: string
  phone?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  permissions?: string[]
  allowedWarehouses?: string[]
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  email: string
  password: string
  name: string
  tenantId?: string
  phone?: string
}

export interface ResetPasswordData {
  email: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileData {
  name?: string
  phone?: string
  avatar?: string
}

export interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  sessionChecked: boolean
}

export interface AuthResponse {
  success: boolean
  message?: string
  data?: UserProfile
  error?: string
}

// Role-based permission types
export type UserRole = 'superadmin' | 'admin' | 'company_manager' | 'warehouse_manager' | 'user'

export const RolePermissions = {
  superadmin: ['all'],
  admin: ['view_items', 'add_items', 'edit_items', 'delete_items', 'view_transactions', 'view_reports', 'manage_users'],
  company_manager: ['view_items', 'add_items', 'edit_items', 'delete_items', 'view_transactions', 'view_reports', 'manage_users', 'manage_warehouses'],
  warehouse_manager: ['view_items', 'add_items', 'edit_items', 'view_transactions'],
  user: ['view_items'],
} as const

export interface SessionData {
  user: UserProfile
  expiresAt: Date
  token?: string
}