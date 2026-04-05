export interface InventoryItem {
  id: string
  name: string
  code: string
  color: string
  size?: string // Added size property (optional)
  warehouseId: string
  warehouseName?: string
  cartonsCount: number
  perCartonCount: number
  singleBottlesCount: number
  remainingQuantity: number
  totalAdded: number
  supplier?: string
  location?: string
  notes?: string
  photoUrl?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  tenantId: string
}

export interface Transaction {
  id: string
  type: 'ADD' | 'UPDATE' | 'DELETE' | 'TRANSFER' | 'DISPATCH'
  itemId: string
  itemName: string
  itemCode: string
  fromWarehouse?: string
  toWarehouse?: string
  destination?: string
  destinationId?: string
  cartonsDelta: number
  perCartonUpdated?: number
  singleDelta: number
  totalDelta: number
  newRemaining: number
  previousQuantity?: number
  notes?: string
  userId: string
  createdBy: string
  createdAt: Date
  tenantId: string
}

export interface TransferData {
  itemId: string
  fromWarehouseId: string
  toWarehouseId: string
  cartonsCount: number
  singleBottlesCount: number
  notes?: string
}

export interface DispatchData {
  itemId: string
  fromWarehouseId: string
  destination: string
  destinationId: string
  quantity: number
  cartonsCount?: number
  singleBottlesCount?: number
  notes?: string
}

// Additional useful types for inventory management
export interface CreateInventoryItemData {
  name: string
  code: string
  color: string
  size?: string
  warehouseId: string
  perCartonCount: number
  cartonsCount: number
  singleBottlesCount: number
  supplier?: string
  location?: string
  notes?: string
  photoUrl?: string
}

export interface UpdateInventoryItemData {
  name?: string
  code?: string
  color?: string
  size?: string
  warehouseId?: string
  perCartonCount?: number
  cartonsCount?: number
  singleBottlesCount?: number
  supplier?: string
  location?: string
  notes?: string
  photoUrl?: string
}

export interface InventoryFilters {
  search?: string
  warehouseId?: string
  status?: 'in_stock' | 'low_stock' | 'out_of_stock' | ''
  minQuantity?: number
  maxQuantity?: number
  supplier?: string
  location?: string
}

export interface InventoryStats {
  totalItems: number
  totalQuantity: number
  lowStockItems: number
  outOfStockItems: number
  totalWarehouses: number
  totalSuppliers: number
  mostStockedItem?: InventoryItem
  leastStockedItem?: InventoryItem
}

export interface StockAlert {
  itemId: string
  itemName: string
  itemCode: string
  currentQuantity: number
  threshold: number
  warehouseId: string
  warehouseName: string
}

export interface BulkUpdateData {
  itemIds: string[]
  updates: Partial<InventoryItem>
}

export interface InventoryExportData {
  items: InventoryItem[]
  exportDate: Date
  filters?: InventoryFilters
  totalRecords: number
}