import { defineStore } from 'pinia'
import { ref, computed, onScopeDispose } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import type { InventoryItem, Transaction } from '@/types'

// Helper to convert DB row to InventoryItem (reused everywhere)
function mapDbItemToInventoryItem(item: any): InventoryItem {
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    color: item.color,
    size: item.size || '',
    warehouseId: item.warehouse_id,
    warehouseName: item.warehouses?.name,
    cartonsCount: item.cartons_count,
    perCartonCount: item.per_carton_count,
    singleBottlesCount: item.single_bottles_count,
    remainingQuantity: item.remaining_quantity,
    totalAdded: item.total_added,
    supplier: item.supplier,
    location: item.item_location,
    notes: item.notes,
    photoUrl: item.photo_url,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    createdBy: item.created_by,
    updatedBy: item.updated_by,
    tenantId: item.tenant_id,
    // Additional fields for compatibility
    created_by: item.created_by,
    updated_by: item.updated_by,
    created_by_name: item.created_by_user?.name || null,
    updated_by_name: item.updated_by_user?.name || null,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }
}

export const useInventoryStore = defineStore('inventory', () => {
  const authStore = useAuthStore()

  // ---------- State ----------
  const items = ref<InventoryItem[]>([])
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Pagination state (internal, not exposed unless needed)
  const currentPage = ref(1)
  const pageSize = ref(50)
  const totalCount = ref(0)

  // Cache for getItemsByWarehouse (TTL 30 seconds)
  const warehouseCache = new Map<string, { data: InventoryItem[]; timestamp: number }>()
  const CACHE_TTL = 30_000

  // AbortController for search
  let searchAbortController: AbortController | null = null

  // Realtime subscription handle
  let itemsSubscription: any = null

  // ---------- Computed (unchanged) ----------
  const totalItems = computed(() => items.value.length)
  const totalQuantity = computed(() =>
    items.value.reduce((sum, item) => sum + (item.remainingQuantity || 0), 0)
  )
  const lowStockItems = computed(() =>
    items.value.filter(item => item.remainingQuantity < 10 && item.remainingQuantity > 0)
  )
  const outOfStockItems = computed(() =>
    items.value.filter(item => item.remainingQuantity === 0)
  )

  // ---------- Permission helpers (unchanged) ----------
  const canModifyWarehouse = (warehouseId: string): boolean => {
    if (authStore.isSuperAdmin || authStore.isCompanyManager) return true
    if (authStore.isWarehouseManager) {
      return authStore.canAccessWarehouse(warehouseId)
    }
    return false
  }

  const canDeleteItem = (): boolean => {
    return authStore.isSuperAdmin || authStore.isCompanyManager
  }

  // ---------- Helper: invalidate warehouse cache ----------
  function invalidateWarehouseCache(warehouseId?: string) {
    if (warehouseId) {
      warehouseCache.delete(warehouseId)
    } else {
      warehouseCache.clear()
    }
  }

  // ---------- Helper: update local items after mutation ----------
  function updateLocalItem(updatedItem: InventoryItem) {
    const index = items.value.findIndex(i => i.id === updatedItem.id)
    if (index !== -1) {
      items.value[index] = updatedItem
    } else {
      items.value.push(updatedItem)
    }
    // Also update cache entries that might contain this item
    for (const [_key, cacheEntry] of warehouseCache.entries()) {
      const idx = cacheEntry.data.findIndex(i => i.id === updatedItem.id)
      if (idx !== -1) {
        cacheEntry.data[idx] = updatedItem
      }
    }
  }

  function removeLocalItem(itemId: string) {
    items.value = items.value.filter(i => i.id !== itemId)
    for (const cacheEntry of warehouseCache.values()) {
      cacheEntry.data = cacheEntry.data.filter(i => i.id !== itemId)
    }
  }

  // ---------- fetchItems (unchanged for backward compatibility) ----------
  async function fetchItems(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      let query = supabase
        .from('items')
        .select(
          `
          *,
          warehouses(name),
          created_by_user:created_by(name),
          updated_by_user:updated_by(name)
        `
        )
        .eq('tenant_id', authStore.currentTenantId)
        .order('name')

      if (authStore.isWarehouseManager) {
        const allowedWarehouses = authStore.user?.allowedWarehouses || []
        if (allowedWarehouses.length > 0 && !allowedWarehouses.includes('all')) {
          query = query.in('warehouse_id', allowedWarehouses)
        }
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      items.value = (data || []).map(mapDbItemToInventoryItem)
      totalCount.value = items.value.length
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching items:', err)
    } finally {
      isLoading.value = false
    }
  }

  // ---------- NEW: Paginated fetch (optional) ----------
  async function fetchItemsPage(page: number, pageSizeArg?: number, append = false): Promise<void> {
    const size = pageSizeArg ?? pageSize.value
    const from = (page - 1) * size
    const to = from + size - 1

    isLoading.value = true
    error.value = null

    try {
      let query = supabase
        .from('items')
        .select(
          `
          *,
          warehouses(name),
          created_by_user:created_by(name),
          updated_by_user:updated_by(name)
        `,
          { count: 'exact' }
        )
        .eq('tenant_id', authStore.currentTenantId)
        .order('name')
        .range(from, to)

      if (authStore.isWarehouseManager) {
        const allowedWarehouses = authStore.user?.allowedWarehouses || []
        if (allowedWarehouses.length > 0 && !allowedWarehouses.includes('all')) {
          query = query.in('warehouse_id', allowedWarehouses)
        }
      }

      const { data, count, error: fetchError } = await query
      if (fetchError) throw fetchError

      const mapped = (data || []).map(mapDbItemToInventoryItem)
      if (append) {
        items.value = [...items.value, ...mapped]
      } else {
        items.value = mapped
      }
      totalCount.value = count || 0
      currentPage.value = page
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching paginated items:', err)
    } finally {
      isLoading.value = false
    }
  }

  // ---------- fetchTransactions (unchanged) ----------
  async function fetchTransactions(limit: number = 50): Promise<void> {
    try {
      let query = supabase
        .from('transactions')
        .select('*, items(name, code)')
        .eq('tenant_id', authStore.currentTenantId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (authStore.isWarehouseManager) {
        const allowedWarehouses = authStore.user?.allowedWarehouses || []
        if (allowedWarehouses.length > 0 && !allowedWarehouses.includes('all')) {
          query = query.or(
            `from_warehouse.in.(${allowedWarehouses.join(',')}),to_warehouse.in.(${allowedWarehouses.join(',')})`
          )
        }
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      transactions.value = (data || []).map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        itemId: tx.item_id,
        itemName: tx.item_name,
        itemCode: tx.item_code,
        fromWarehouse: tx.from_warehouse,
        toWarehouse: tx.to_warehouse,
        destination: tx.destination,
        destinationId: tx.destination_id,
        cartonsDelta: tx.cartons_delta,
        perCartonUpdated: tx.per_carton_updated,
        singleDelta: tx.single_delta,
        totalDelta: tx.total_delta,
        newRemaining: tx.new_remaining,
        previousQuantity: tx.previous_quantity,
        notes: tx.notes,
        userId: tx.user_id,
        createdBy: tx.created_by,
        createdAt: new Date(tx.created_at),
        tenantId: tx.tenant_id,
      }))
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
    }
  }

  // ---------- GET ITEMS BY WAREHOUSE (cached) ----------
  async function getItemsByWarehouse(warehouseId: string): Promise<InventoryItem[]> {
    if (!canModifyWarehouse(warehouseId)) {
      console.warn('Unauthorized access to warehouse:', warehouseId)
      return []
    }

    const cached = warehouseCache.get(warehouseId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }

    // Fetch from DB with warehouse name
    let query = supabase
      .from('items')
      .select(
        `
        *,
        warehouses(name)
      `
      )
      .eq('tenant_id', authStore.currentTenantId)
      .eq('warehouse_id', warehouseId)
      .gt('remaining_quantity', 0)
      .order('name')

    if (authStore.isWarehouseManager) {
      const allowed = authStore.user?.allowedWarehouses || []
      if (allowed.length && !allowed.includes('all') && !allowed.includes(warehouseId)) {
        return []
      }
    }

    const { data, error: fetchError } = await query
    if (fetchError) {
      console.error('Error fetching warehouse items:', fetchError)
      return []
    }

    const mapped = (data || []).map(mapDbItemToInventoryItem)
    warehouseCache.set(warehouseId, { data: mapped, timestamp: Date.now() })
    return mapped
  }

  // ============================================
  // ADD INVENTORY ITEM - ORIGINAL LOGIC PRESERVED
  // Only removed await fetchItems() and added local update + optimistic
  // ============================================
  async function addItem(itemData: Partial<InventoryItem> & { 
    isAddingCartons?: boolean;
    size?: string;
  }): Promise<{ success: boolean; type?: string; id?: string; message?: string; item?: InventoryItem; quantityAdded?: number }> {
    const tenantId = authStore.currentTenantId
    if (!tenantId) throw new Error('No tenant')
    if (!authStore.user) throw new Error('Not authenticated')

    if (!authStore.canEdit) {
      error.value = 'You do not have permission to add items'
      return { success: false, message: 'You do not have permission to add items' }
    }
    if (itemData.warehouseId && !canModifyWarehouse(itemData.warehouseId)) {
      error.value = 'You do not have access to this warehouse'
      return { success: false, message: 'You do not have access to this warehouse' }
    }

    isLoading.value = true
    error.value = null

    // Optimistic temporary id (for new items only)
    const tempId = `temp_${Date.now()}_${Math.random()}`

    try {
      // 1. Check existing item (exact same logic as original)
      const { data: existingItem, error: findError } = await supabase
        .from('items')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('name', itemData.name?.trim())
        .eq('code', itemData.code?.trim())
        .eq('color', itemData.color?.trim())
        .eq('size', itemData.size?.trim() || '')
        .eq('warehouse_id', itemData.warehouseId)
        .maybeSingle()

      if (findError) throw findError

      const newCartons = Number(itemData.cartonsCount) || 0
      const newPerCarton = Number(itemData.perCartonCount) || 12
      const newSingles = Number(itemData.singleBottlesCount) || 0

      let finalCartons = newCartons
      let finalSingles = newSingles
      let convertedCartons = 0

      if (finalSingles >= newPerCarton) {
        convertedCartons = Math.floor(finalSingles / newPerCarton)
        finalSingles = finalSingles % newPerCarton
        finalCartons += convertedCartons
      }

      const totalQty = (finalCartons * newPerCarton) + finalSingles
      if (totalQty <= 0) throw new Error('Invalid quantity')

      if (existingItem) {
        // --- UPDATE EXISTING ITEM (original logic) ---
        console.log('🔄 Updating existing item...')

        const currentCartons = existingItem.cartons_count || 0
        const currentSingles = existingItem.single_bottles_count || 0

        let newCartonsTotal = currentCartons
        let newSinglesTotal = currentSingles
        const isAddingCartons = itemData.isAddingCartons !== false

        if (isAddingCartons && newCartons > 0) {
          newCartonsTotal = currentCartons + finalCartons
          newSinglesTotal = currentSingles + finalSingles
        } else if (!isAddingCartons) {
          newCartonsTotal = finalCartons
          newSinglesTotal = finalSingles
        }

        let extraCartons = 0
        if (newSinglesTotal >= newPerCarton) {
          extraCartons = Math.floor(newSinglesTotal / newPerCarton)
          newSinglesTotal = newSinglesTotal % newPerCarton
          newCartonsTotal += extraCartons
        }

        const newTotal = (newCartonsTotal * newPerCarton) + newSinglesTotal
        const quantityAdded = newTotal - (existingItem.remaining_quantity || 0)

        const updateData = {
          name: itemData.name?.trim(),
          code: itemData.code?.trim(),
          color: itemData.color?.trim(),
          size: itemData.size?.trim() || '',
          warehouse_id: itemData.warehouseId,
          cartons_count: newCartonsTotal,
          per_carton_count: newPerCarton,
          single_bottles_count: newSinglesTotal,
          remaining_quantity: newTotal,
          total_added: (existingItem.total_added || 0) + (quantityAdded > 0 ? quantityAdded : 0),
          updated_at: new Date().toISOString(),
          updated_by: authStore.user?.id,
          supplier: itemData.supplier?.trim() || existingItem.supplier,
          item_location: itemData.location?.trim() || existingItem.item_location,
          notes: itemData.notes?.trim() || existingItem.notes,
          photo_url: itemData.photoUrl || existingItem.photo_url
        }

        // Optimistic update: apply to local state immediately
        const optimisticUpdated = mapDbItemToInventoryItem({
          ...existingItem,
          ...updateData,
          warehouses: { name: existingItem.warehouses?.name },
          created_by_user: { name: existingItem.created_by_user?.name },
          updated_by_user: { name: authStore.user?.name || authStore.user?.email }
        })
        updateLocalItem(optimisticUpdated)

        // Perform DB update (original)
        const { error: updateError } = await supabase
          .from('items')
          .update(updateData)
          .eq('id', existingItem.id)

        if (updateError) throw updateError

        if (quantityAdded !== 0) {
          await supabase.from('transactions').insert({
            type: 'ADD',
            item_id: existingItem.id,
            item_name: updateData.name,
            item_code: updateData.code,
            to_warehouse: itemData.warehouseId,
            cartons_delta: finalCartons,
            per_carton_updated: newPerCarton,
            single_delta: finalSingles,
            total_delta: quantityAdded,
            new_remaining: newTotal,
            user_id: authStore.user?.id,
            notes: itemData.notes || `Added ${finalCartons} cartons, ${finalSingles} singles`,
            created_by: authStore.user?.name || authStore.user?.email,
            tenant_id: tenantId
          })
        }

        // Invalidate cache for this warehouse
        invalidateWarehouseCache(itemData.warehouseId)

        // Refresh the item from DB to ensure consistency (optional but safe)
        const { data: refreshed } = await supabase
          .from('items')
          .select(`
            *,
            warehouses(name),
            created_by_user:created_by(name),
            updated_by_user:updated_by(name)
          `)
          .eq('id', existingItem.id)
          .single()
        if (refreshed) {
          updateLocalItem(mapDbItemToInventoryItem(refreshed))
        }

        return { 
          success: true, 
          type: 'updated', 
          id: existingItem.id,
          item: items.value.find(i => i.id === existingItem.id),
          quantityAdded,
          message: `Updated ${itemData.name}: Added ${quantityAdded} units`
        }
      } else {
        // --- CREATE NEW ITEM (original logic) ---
        console.log('➕ Creating new item...')

        const newItem = {
          name: itemData.name?.trim(),
          code: itemData.code?.trim(),
          color: itemData.color?.trim(),
          size: itemData.size?.trim() || '',
          warehouse_id: itemData.warehouseId,
          cartons_count: finalCartons,
          per_carton_count: newPerCarton,
          single_bottles_count: finalSingles,
          remaining_quantity: totalQty,
          total_added: totalQty,
          supplier: itemData.supplier?.trim() || null,
          item_location: itemData.location?.trim() || null,
          notes: itemData.notes?.trim() || null,
          photo_url: itemData.photoUrl || null,
          created_by: authStore.user?.id,
          updated_by: authStore.user?.id,
          tenant_id: tenantId
        }

        // Optimistic: create temporary item and add to list
        const optimisticItem = mapDbItemToInventoryItem({
          ...newItem,
          id: tempId,
          warehouses: { name: undefined },
          created_by_user: { name: authStore.user?.name || authStore.user?.email },
          updated_by_user: { name: authStore.user?.name || authStore.user?.email }
        })
        items.value.unshift(optimisticItem)

        // Perform DB insert (original)
        const { data: inserted, error: insertError } = await supabase
          .from('items')
          .insert(newItem)
          .select()
          .single()

        if (insertError) throw insertError

        await supabase.from('transactions').insert({
          type: 'ADD',
          item_id: inserted.id,
          item_name: inserted.name,
          item_code: inserted.code,
          to_warehouse: itemData.warehouseId,
          cartons_delta: finalCartons,
          per_carton_updated: newPerCarton,
          single_delta: finalSingles,
          total_delta: totalQty,
          new_remaining: totalQty,
          user_id: authStore.user?.id,
          notes: convertedCartons > 0 ? `New item (converted ${convertedCartons} cartons from singles)` : 'New item added',
          created_by: authStore.user?.name || authStore.user?.email,
          tenant_id: tenantId
        })

        // Replace temp item with real one
        const realItem = mapDbItemToInventoryItem(inserted)
        const index = items.value.findIndex(i => i.id === tempId)
        if (index !== -1) {
          items.value.splice(index, 1, realItem)
        }

        invalidateWarehouseCache(itemData.warehouseId)

        return { 
          success: true, 
          type: 'created', 
          id: inserted.id,
          item: realItem,
          quantityAdded: totalQty,
          message: `Created new item: ${itemData.name}`
        }
      }
    } catch (err: any) {
      // Rollback optimistic changes
      const tempIndex = items.value.findIndex(i => i.id === tempId)
      if (tempIndex !== -1) items.value.splice(tempIndex, 1)
      error.value = err.message
      console.error('Error adding item:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // UPDATE ITEM - ORIGINAL LOGIC PRESERVED
  // ============================================
  async function updateItem(itemId: string, itemData: Partial<InventoryItem>): Promise<boolean> {
    if (!authStore.canEdit) {
      error.value = 'You do not have permission to update items'
      return false
    }
    const existingItem = items.value.find(i => i.id === itemId)
    if (existingItem && !canModifyWarehouse(existingItem.warehouseId)) {
      error.value = 'You do not have access to this warehouse'
      return false
    }
    if (itemData.warehouseId && !canModifyWarehouse(itemData.warehouseId)) {
      error.value = 'You do not have access to the target warehouse'
      return false
    }

    isLoading.value = true
    error.value = null

    // Optimistic update
    const originalItem = existingItem ? { ...existingItem } : null
    if (existingItem) {
      const updated = { ...existingItem, ...itemData, updatedAt: new Date() }
      updateLocalItem(updated)
    }

    try {
      const { error: updateError } = await supabase
        .from('items')
        .update({
          name: itemData.name,
          code: itemData.code,
          color: itemData.color,
          size: itemData.size || '',
          warehouse_id: itemData.warehouseId,
          cartons_count: itemData.cartonsCount,
          per_carton_count: itemData.perCartonCount,
          single_bottles_count: itemData.singleBottlesCount,
          remaining_quantity: itemData.remainingQuantity,
          supplier: itemData.supplier,
          item_location: itemData.location,
          notes: itemData.notes,
          photo_url: itemData.photoUrl,
          updated_at: new Date().toISOString(),
          updated_by: authStore.user?.id,
        })
        .eq('id', itemId)

      if (updateError) throw updateError

      invalidateWarehouseCache(itemData.warehouseId || existingItem?.warehouseId)
      return true
    } catch (err: any) {
      // Rollback
      if (originalItem) updateLocalItem(originalItem)
      error.value = err.message
      console.error('Error updating item:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // DELETE ITEM - ORIGINAL LOGIC PRESERVED
  // ============================================
  async function deleteItem(itemId: string): Promise<boolean> {
    if (!canDeleteItem()) {
      error.value = 'Only super admin and company managers can delete items'
      return false
    }
    const existingItem = items.value.find(i => i.id === itemId)
    if (existingItem && !canModifyWarehouse(existingItem.warehouseId)) {
      error.value = 'You do not have access to this warehouse'
      return false
    }

    isLoading.value = true
    error.value = null

    // Optimistic delete
    removeLocalItem(itemId)

    try {
      const { error: deleteError } = await supabase.from('items').delete().eq('id', itemId)
      if (deleteError) throw deleteError

      invalidateWarehouseCache(existingItem?.warehouseId)
      return true
    } catch (err: any) {
      // Restore item
      if (existingItem) items.value.push(existingItem)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // TRANSFER ITEM - ORIGINAL LOGIC PRESERVED
  // Only removed fetchItems and added local updates + cache invalidation
  // ============================================
  async function transferItem(transferData: {
    item_id: string
    from_warehouse_id: string
    to_warehouse_id: string
    cartons_count: number
    single_bottles_count: number
    notes?: string
  }): Promise<{ success: boolean; message?: string; transferTotalQuantity?: number; transactionId?: string }> {
    if (!authStore.canEdit) {
      error.value = 'You do not have permission to transfer items'
      return { success: false, message: 'You do not have permission to transfer items' }
    }
    if (!canModifyWarehouse(transferData.from_warehouse_id)) {
      error.value = 'You do not have access to the source warehouse'
      return { success: false, message: 'You do not have access to the source warehouse' }
    }
    if (authStore.isWarehouseManager && !canModifyWarehouse(transferData.to_warehouse_id)) {
      error.value = 'You do not have access to the destination warehouse'
      return { success: false, message: 'You do not have access to the destination warehouse' }
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('🔄 Starting transfer:', transferData)

      const { data: result, error: transferError } = await supabase.rpc('transfer_item', {
        p_item_id: transferData.item_id,
        p_from_warehouse: transferData.from_warehouse_id,
        p_to_warehouse: transferData.to_warehouse_id,
        p_cartons: transferData.cartons_count,
        p_singles: transferData.single_bottles_count,
        p_user_id: authStore.user?.id,
        p_notes: transferData.notes || '',
        p_tenant_id: authStore.currentTenantId,
      })

      if (transferError) throw transferError

      // Instead of fetchItems(), update local state and invalidate caches
      await fetchItems() // For simplicity, we keep fetchItems here to ensure consistency after RPC.
      // But we could optimistically update source/destination items. Since RPC is complex, we keep fetchItems for now.
      // To improve performance later, we can fetch only the affected items. This does not break business logic.

      invalidateWarehouseCache(transferData.from_warehouse_id)
      invalidateWarehouseCache(transferData.to_warehouse_id)

      return { 
        success: true, 
        transferTotalQuantity: result?.transferred || 0,
        transactionId: result?.transaction_id,
        message: `Successfully transferred ${result?.transferred || 0} units`
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error transferring item:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // DISPATCH ITEM - ORIGINAL LOGIC PRESERVED
  // ============================================
  async function dispatchItem(dispatchData: {
    item_id: string
    from_warehouse_id: string
    destination: string
    destination_id: string
    quantity: number
    user_id?: string
    notes?: string
    tenant_id?: string
    cartons_count?: number
    single_bottles_count?: number
  }): Promise<{ success: boolean; message?: string; transactionId?: string; newQuantity?: number }> {
    if (!authStore.canEdit) {
      error.value = 'You do not have permission to dispatch items'
      return { success: false, message: 'You do not have permission to dispatch items' }
    }
    if (!canModifyWarehouse(dispatchData.from_warehouse_id)) {
      error.value = 'You do not have access to this warehouse'
      return { success: false, message: 'You do not have access to this warehouse' }
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('🚀 Starting dispatch:', dispatchData)

      const { data: result, error: dispatchError } = await supabase.rpc('dispatch_item', {
        p_item_id: dispatchData.item_id,
        p_from_warehouse: dispatchData.from_warehouse_id,
        p_destination: dispatchData.destination,
        p_destination_id: dispatchData.destination_id,
        p_quantity: dispatchData.quantity,
        p_user_id: dispatchData.user_id || authStore.user?.id,
        p_notes: dispatchData.notes || '',
        p_tenant_id: dispatchData.tenant_id || authStore.currentTenantId,
        p_cartons: dispatchData.cartons_count || 0,
        p_singles: dispatchData.single_bottles_count || 0,
      })

      if (dispatchError) throw dispatchError

      await fetchItems() // Keep for consistency; can be optimized later
      invalidateWarehouseCache(dispatchData.from_warehouse_id)

      return { 
        success: true, 
        transactionId: result?.transaction_id,
        newQuantity: result?.new_remaining,
        message: `Successfully dispatched ${dispatchData.quantity} units`
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error dispatching item:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // SEARCH - server-side (original was client-side)
  // ============================================
  async function searchInventorySpark(params: {
    searchQuery: string
    warehouseId?: string | null
    limit?: number
    strategy?: string
  }): Promise<InventoryItem[]> {
    const { searchQuery, warehouseId, limit = 50 } = params

    if (!searchQuery || searchQuery.trim().length < 2) {
      return []
    }

    // Cancel previous request
    if (searchAbortController) {
      searchAbortController.abort()
    }
    searchAbortController = new AbortController()

    try {
      let query = supabase
        .from('items')
        .select(
          `
          *,
          warehouses(name),
          created_by_user:created_by(name),
          updated_by_user:updated_by(name)
        `
        )
        .eq('tenant_id', authStore.currentTenantId)
        .or(
          `name.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%,color.ilike.%${searchQuery}%,size.ilike.%${searchQuery}%,supplier.ilike.%${searchQuery}%,item_location.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`
        )
        .limit(limit)

      if (warehouseId && warehouseId !== 'all') {
        if (!canModifyWarehouse(warehouseId)) {
          console.warn('Unauthorized access to warehouse in search:', warehouseId)
          return []
        }
        query = query.eq('warehouse_id', warehouseId)
      } else if (authStore.isWarehouseManager) {
        const allowedWarehouses = authStore.user?.allowedWarehouses || []
        if (allowedWarehouses.length > 0 && !allowedWarehouses.includes('all')) {
          query = query.in('warehouse_id', allowedWarehouses)
        }
      }

      const { data, error: fetchError } = await query.abortSignal(searchAbortController.signal)
      if (fetchError) throw fetchError

      return (data || []).map(mapDbItemToInventoryItem)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return []
      }
      console.error('Search error:', err)
      return []
    }
  }

  // ---------- Realtime subscription (sync other users' changes) ----------
  function setupRealtimeSubscription() {
    if (itemsSubscription) return

    itemsSubscription = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `tenant_id=eq.${authStore.currentTenantId}`,
        },
        async (payload) => {
          const { eventType, new: newRecord, old } = payload
          if (eventType === 'INSERT' && newRecord) {
            const newItem = mapDbItemToInventoryItem(newRecord)
            if (!items.value.find(i => i.id === newItem.id)) {
              items.value.push(newItem)
            }
          } else if (eventType === 'UPDATE' && newRecord) {
            const updated = mapDbItemToInventoryItem(newRecord)
            updateLocalItem(updated)
          } else if (eventType === 'DELETE' && old) {
            removeLocalItem(old.id)
          }
          const warehouseId = (newRecord as any)?.warehouse_id || (old as any)?.warehouse_id
          if (warehouseId) invalidateWarehouseCache(warehouseId)
        }
      )
      .subscribe()
  }

  // Auto‑setup realtime when store is used
  if (authStore.currentTenantId) {
    setupRealtimeSubscription()
  }

  // Cleanup on scope dispose
  onScopeDispose(() => {
    if (itemsSubscription) {
      supabase.removeChannel(itemsSubscription)
    }
    if (searchAbortController) {
      searchAbortController.abort()
    }
  })

  // ---------- Expose public API (unchanged) ----------
  return {
    items,
    transactions,
    isLoading,
    error,
    totalItems,
    totalQuantity,
    lowStockItems,
    outOfStockItems,
    fetchItems,
    fetchTransactions,
    getItemsByWarehouse,
    addItem,
    updateItem,
    transferItem,
    dispatchItem,
    deleteItem,
    searchInventorySpark,
    fetchItemsPage,
    canModifyWarehouse,
    canDeleteItem,
  }
})
