export interface Warehouse {
  id: string
  name: string
  name_ar?: string
  name_en?: string
  tenantId: string
  type?: 'primary' | 'dispatch'  // ← Make optional since DB has default 'primary'
  is_main: boolean
  is_active: boolean
  location?: string
  description?: string
  capacity: number
  createdAt: Date
  updatedAt?: Date
  itemCount?: number
  totalStock?: number
  created_by?: string
  created_by_name?: string
  updated_by?: string
  updated_by_name?: string
}

export interface WarehouseStats {
  totalItems: number
  totalQuantity: number
  lowStockCount: number
  outOfStockCount: number
}

export interface CreateWarehouseData {
  name: string
  name_ar?: string
  name_en?: string
  type?: 'primary' | 'dispatch'
  location?: string
  description?: string
  capacity?: number
  is_main?: boolean
}

export interface UpdateWarehouseData extends Partial<CreateWarehouseData> {
  id: string
  is_active?: boolean
}