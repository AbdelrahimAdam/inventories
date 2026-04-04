export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Luxury Perfume SaaS'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

export const TRANSACTION_TYPES = {
  ADD: 'ADD',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  TRANSFER: 'TRANSFER',
  DISPATCH: 'DISPATCH',
} as const

export const USER_ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  USER: 'user',
} as const

export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100],
}