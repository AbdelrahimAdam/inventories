export interface Warehouse {
  id: string
  name: string
  tenantId: string
  createdAt: Date
  updatedAt?: Date
  itemCount?: number
  totalStock?: number
}

export interface WarehouseStats {
  totalItems: number
  totalQuantity: number
  lowStockCount: number
  outOfStockCount: number
}