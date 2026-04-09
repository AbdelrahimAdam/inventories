import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import type { InventoryItem, Transaction } from '@/types'

export const useInventoryStore = defineStore('inventory', () => {
  const authStore = useAuthStore()
  
  const items = ref<InventoryItem[]>([])
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

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

  // Helper function to check if user can modify a specific warehouse
  const canModifyWarehouse = (warehouseId: string): boolean => {
    if (authStore.isSuperAdmin || authStore.isCompanyManager) return true
    if (authStore.isWarehouseManager) {
      return authStore.canAccessWarehouse(warehouseId)
    }
    return false
  }

  // Helper function to check if user can delete items
  const canDeleteItem = (): boolean => {
    return authStore.isSuperAdmin || authStore.isCompanyManager
  }

  async function fetchItems(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      let query = supabase
        .from('items')
        .select('*, warehouses(name)')
        .eq('tenant_id', authStore.currentTenantId)
        .order('name')

      // For warehouse managers, filter by allowed warehouses
      if (authStore.isWarehouseManager) {
        const allowedWarehouses = authStore.user?.allowedWarehouses || []
        if (allowedWarehouses.length > 0 && !allowedWarehouses.includes('all')) {
          query = query.in('warehouse_id', allowedWarehouses)
        }
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      items.value = (data || []).map((item: any) => ({
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
      }))
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching items:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTransactions(limit: number = 50): Promise<void> {
    try {
      let query = supabase
        .from('transactions')
        .select('*, items(name, code)')
        .eq('tenant_id', authStore.currentTenantId)
        .order('created_at', { ascending: false })
        .limit(limit)

      // For warehouse managers, filter transactions related to their warehouses
      if (authStore.isWarehouseManager) {
        const allowedWarehouses = authStore.user?.allowedWarehouses || []
        if (allowedWarehouses.length > 0 && !allowedWarehouses.includes('all')) {
          query = query.or(`from_warehouse.in.(${allowedWarehouses.join(',')}),to_warehouse.in.(${allowedWarehouses.join(',')})`)
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

  // ============================================
  // GET ITEMS BY WAREHOUSE
  // ============================================
  async function getItemsByWarehouse(warehouseId: string): Promise<InventoryItem[]> {
    // Check if user can access this warehouse
    if (!canModifyWarehouse(warehouseId)) {
      console.warn('Unauthorized access to warehouse:', warehouseId)
      return []
    }
    return items.value.filter(item => item.warehouseId === warehouseId && item.remainingQuantity > 0)
  }

  // ============================================
  // ADD INVENTORY ITEM WITH NAME+CODE+COLOR+SIZE+WAREHOUSE MATCHING
  // ============================================
  async function addItem(itemData: Partial<InventoryItem> & { 
    isAddingCartons?: boolean;
    size?: string;
  }): Promise<{ success: boolean; type?: string; id?: string; message?: string; item?: InventoryItem; quantityAdded?: number }> {
    const tenantId = authStore.currentTenantId
    if (!tenantId) throw new Error('No tenant')
    if (!authStore.user) throw new Error('Not authenticated')

    // Check permission to add items
    if (!authStore.canEdit) {
      error.value = 'You do not have permission to add items'
      return { success: false, message: 'You do not have permission to add items' }
    }

    // Check warehouse access
    if (itemData.warehouseId && !canModifyWarehouse(itemData.warehouseId)) {
      error.value = 'You do not have access to this warehouse'
      return { success: false, message: 'You do not have access to this warehouse' }
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('🔍 Checking for existing item...')
      
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

      if (totalQty <= 0) {
        throw new Error('Invalid quantity')
      }

      if (existingItem) {
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
        
        await fetchItems()
        
        const updatedItem = items.value.find(i => i.id === existingItem.id)
        
        return { 
          success: true, 
          type: 'updated', 
          id: existingItem.id,
          item: updatedItem,
          quantityAdded,
          message: `Updated ${itemData.name}: Added ${quantityAdded} units`
        }
      } else {
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
        
        await fetchItems()
        
        const newItemObj = items.value.find(i => i.id === inserted.id)
        
        return { 
          success: true, 
          type: 'created', 
          id: inserted.id,
          item: newItemObj,
          quantityAdded: totalQty,
          message: `Created new item: ${itemData.name}`
        }
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error adding item:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // UPDATE ITEM
  // ============================================
  async function updateItem(itemId: string, itemData: Partial<InventoryItem>): Promise<boolean> {
    // Check permission to update items
    if (!authStore.canEdit) {
      error.value = 'You do not have permission to update items'
      return false
    }

    // Find the item to check warehouse access
    const existingItem = items.value.find(i => i.id === itemId)
    if (existingItem && !canModifyWarehouse(existingItem.warehouseId)) {
      error.value = 'You do not have access to this warehouse'
      return false
    }

    // Check new warehouse access if changing warehouse
    if (itemData.warehouseId && !canModifyWarehouse(itemData.warehouseId)) {
      error.value = 'You do not have access to the target warehouse'
      return false
    }

    isLoading.value = true
    error.value = null

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

      await fetchItems()
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating item:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // DELETE ITEM
  // ============================================
  async function deleteItem(itemId: string): Promise<boolean> {
    // Only superadmin and company manager can delete items
    if (!canDeleteItem()) {
      error.value = 'Only super admin and company managers can delete items'
      return false
    }

    // Find the item to check warehouse access
    const existingItem = items.value.find(i => i.id === itemId)
    if (existingItem && !canModifyWarehouse(existingItem.warehouseId)) {
      error.value = 'You do not have access to this warehouse'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)

      if (deleteError) throw deleteError

      await fetchItems()
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // TRANSFER ITEM BETWEEN WAREHOUSES
  // ============================================
  async function transferItem(transferData: {
    item_id: string
    from_warehouse_id: string
    to_warehouse_id: string
    cartons_count: number
    single_bottles_count: number
    notes?: string
  }): Promise<{ success: boolean; message?: string; transferTotalQuantity?: number; transactionId?: string }> {
    // Check permission to transfer
    if (!authStore.canEdit) {
      error.value = 'You do not have permission to transfer items'
      return { success: false, message: 'You do not have permission to transfer items' }
    }

    // Check source warehouse access
    if (!canModifyWarehouse(transferData.from_warehouse_id)) {
      error.value = 'You do not have access to the source warehouse'
      return { success: false, message: 'You do not have access to the source warehouse' }
    }

    // Check destination warehouse access (warehouse managers need access to both)
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

      await fetchItems()
      await fetchTransactions()

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
  // DISPATCH ITEM (FOR ORDERS/BRANCHES)
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
    // Check permission to dispatch
    if (!authStore.canEdit) {
      error.value = 'You do not have permission to dispatch items'
      return { success: false, message: 'You do not have permission to dispatch items' }
    }

    // Check source warehouse access
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

      await fetchItems()
      await fetchTransactions()

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
  // SPARK SEARCH - Comprehensive search across all fields
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

    const term = searchQuery.toLowerCase().trim()
    let results = [...items.value]

    // Filter by warehouse if specified
    if (warehouseId && warehouseId !== 'all') {
      // Check if user can access this warehouse
      if (!canModifyWarehouse(warehouseId)) {
        console.warn('Unauthorized access to warehouse in search:', warehouseId)
        return []
      }
      results = results.filter(item => item.warehouseId === warehouseId)
    } else if (authStore.isWarehouseManager) {
      // For warehouse managers, only search their allowed warehouses
      const allowedWarehouses = authStore.user?.allowedWarehouses || []
      if (allowedWarehouses.length > 0 && !allowedWarehouses.includes('all')) {
        results = results.filter(item => allowedWarehouses.includes(item.warehouseId))
      }
    }

    // Comprehensive search across all fields
    results = results.filter(item => {
      const name = (item.name || '').toLowerCase()
      const code = (item.code || '').toLowerCase()
      const color = (item.color || '').toLowerCase()
      const size = (item.size || '').toLowerCase()
      const supplier = (item.supplier || '').toLowerCase()
      const location = (item.location || '').toLowerCase()
      const notes = (item.notes || '').toLowerCase()

      return name.includes(term) || 
             code.includes(term) || 
             color.includes(term) ||
             size.includes(term) ||
             supplier.includes(term) ||
             location.includes(term) ||
             notes.includes(term)
    })

    // Filter out zero quantity items
    results = results.filter(item => item.remainingQuantity > 0)

    return results.slice(0, limit)
  }

  return {
    // State
    items,
    transactions,
    isLoading,
    error,
    
    // Getters
    totalItems,
    totalQuantity,
    lowStockItems,
    outOfStockItems,
    
    // Actions
    fetchItems,
    fetchTransactions,
    getItemsByWarehouse,
    addItem,
    updateItem,
    transferItem,
    dispatchItem,
    deleteItem,
    searchInventorySpark,
    
    // Permission helpers
    canModifyWarehouse,
    canDeleteItem,
  }
})