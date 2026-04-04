export interface InventoryItem {
  id: string
  name: string
  code: string
  color: string
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