// src/router/guards/inventory.guard.ts
import { watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'

/**
 * Ensures inventory data is loaded without blocking navigation
 * This is a "fire and forget" approach - data loads in background
 */
export function preloadInventoryInBackground(): void {
  try {
    const inventoryStore = useInventoryStore()
    
    // Already loaded or currently loading - skip
    if ((inventoryStore.dataLoaded && inventoryStore.items.length > 0) || 
        inventoryStore.isLoading) {
      return
    }
    
    // Try cache first
    const tenantId = localStorage.getItem('currentTenantId')
    if (tenantId) {
      const cached = inventoryStore.loadFromCache(tenantId)
      if (cached) {
        return
      }
    }
    
    // Fetch from server (fire and forget)
    inventoryStore.fetchItems().catch((error) => {
      console.warn('Background inventory preload failed:', error)
    })
  } catch (error) {
    // Silently fail - never break navigation
    console.warn('Inventory preload error:', error)
  }
}

/**
 * Ensures transactions data is loaded without blocking navigation
 */
export function preloadTransactionsInBackground(): void {
  try {
    const inventoryStore = useInventoryStore()
    
    if ((inventoryStore.transactionsLoaded && inventoryStore.transactions.length > 0) || 
        inventoryStore.isLoading) {
      return
    }
    
    inventoryStore.fetchTransactions(1, 10000, false).catch((error) => {
      console.warn('Background transactions preload failed:', error)
    })
  } catch (error) {
    console.warn('Transactions preload error:', error)
  }
}

/**
 * Ensures warehouses data is loaded without blocking navigation
 */
export function preloadWarehousesInBackground(): void {
  try {
    const warehouseStore = useWarehouseStore()
    
    if (warehouseStore.warehouses.length > 0) {
      return
    }
    
    warehouseStore.fetchWarehouses().catch((error) => {
      console.warn('Background warehouses preload failed:', error)
    })
  } catch (error) {
    console.warn('Warehouses preload error:', error)
  }
}

/**
 * Ensures inventory data is loaded and waits for it
 * Use this only when data must be available before proceeding
 * (Currently not used to avoid blocking navigation)
 */
export async function ensureInventoryLoaded(): Promise<boolean> {
  const inventoryStore = useInventoryStore()
  
  if (inventoryStore.dataLoaded && inventoryStore.items.length > 0) {
    return true
  }
  
  if (inventoryStore.isLoading) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(
        () => inventoryStore.isLoading,
        (loading) => {
          if (!loading) {
            unwatch()
            resolve()
          }
        }
      )
    })
    return inventoryStore.dataLoaded
  }
  
  try {
    const tenantId = localStorage.getItem('currentTenantId')
    if (tenantId) {
      const cached = inventoryStore.loadFromCache(tenantId)
      if (cached) {
        return true
      }
    }
    
    await inventoryStore.fetchItems()
    return true
  } catch (error) {
    console.error('Failed to load inventory data:', error)
    return false
  }
}