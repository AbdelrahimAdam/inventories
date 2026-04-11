export interface InventoryItem {
  id: string
  name: string
  code: string
  color: string
  size?: string 
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
  createdAt: Date | string
  updatedAt: Date | string
  createdBy: string
  updatedBy: string
  tenantId: string
  // Additional fields for compatibility with the store
  created_by?: string
  updated_by?: string
  created_by_name?: string
  updated_by_name?: string
  created_at?: string
  updated_at?: string
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
  createdAt: Date | string
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
  remainingQuantity?: number
  totalAdded?: number
  supplier?: string
  location?: string
  notes?: string
  photoUrl?: string
}

export interface InventoryFilters {
  search?: string
  warehouseId?: string
  status?: 'in_stock' | 'low_stock' | 'critical_stock' | 'out_of_stock' | ''
  minQuantity?: number
  maxQuantity?: number
  supplier?: string
  location?: string
}

export interface InventoryStats {
  totalItems: number
  totalQuantity: number
  lowStockItems: number
  criticalStockItems?: number
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

// Running Balance type for transaction history
export interface RunningBalance {
  date: string
  voucher: string
  qty_in: number
  qty_out: number
  party: string
  notes: string
  balance: number
}

// Balance Verification Result
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

// Export Result for Excel exports
export interface ExportResult {
  success_count: number
  total_count: number
  failed_items: string[]
  file_path?: string
}

// Item Transaction for manual entry
export interface ItemTransaction {
  id?: number
  item_code: string
  item_name: string
  item_color: string
  item_size?: string
  warehouse_id?: string
  date: string
  type: 'IN' | 'OUT'
  quantity: number
  voucher: string
  party: string
  notes: string
  balance?: number
}