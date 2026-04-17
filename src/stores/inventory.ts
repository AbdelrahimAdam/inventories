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

  // Pagination state
  const currentPage = ref(1)
  const itemsPerPage = ref(50)
  const totalItemsCount = ref(0)
  const hasMoreItems = ref(true)
  const searchTerm = ref('')
  const isSearching = ref(false)

  // Cache for warehouse items (5 minutes TTL)
  const warehouseCache = new Map<string, { items: InventoryItem[], timestamp: number }>()
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  
  // Debounce timer for search
  let searchDebounceTimer: NodeJS.Timeout | null = null

  const totalItems = computed(() => totalItemsCount.value)
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

  // Clear warehouse cache
  const clearWarehouseCache = () => {
    warehouseCache.clear()
  }

  // Invalidate all caches
  const invalidateCaches = () => {
    clearWarehouseCache()
  }

  // Fetch items with pagination
  async function fetchItems(page?: number, reset: boolean = true): Promise<void> {
    const targetPage = page !== undefined ? page : (reset ? 1 : currentPage.value)
    
    if (reset) {
      isLoading.value = true
      items.value = []
      currentPage.value = 1
      hasMoreItems.value = true
    } else if (isLoading.value || !hasMoreItems.value) {
      return
    } else {
      isLoading.value = true
    }
    
    error.value = null

    try {
      let query = supabase
        .from('items')
        .select(`
          *,
          warehouses(name),
          created_by_user:created_by(name),
          updated_by_user:updated_by(name)
        `, { count: 'exact' })
        .eq('tenant_id', authStore.currentTenantId)
        .order('name')
        .range((targetPage - 1) * itemsPerPage, targetPage * itemsPerPage - 1)

      // Apply search filter if searching
      if (isSearching.value && searchTerm.value) {
        query = query.or(`name.ilike.%${searchTerm.value}%,code.ilike.%${searchTerm.value}%`)
      }

      // For warehouse managers, filter by allowed warehouses
      if (authStore.isWarehouseManager) {
        const allowedWarehouses = authStore.user?.allowedWarehouses || []
        if (allowedWarehouses.length > 0 && !allowedWarehouses.includes('all')) {
          query = query.in('warehouse_id', allowedWarehouses)
        }
      }

      const { data, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      const mappedItems: InventoryItem[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        color: item.color,
        size: item.size || '',
        warehouseId: item.warehouse_id,
        warehouseName: item.warehouses?.name,
        cartonsCount: item.cartons_count || 0,
        perCartonCount: item.per_carton_count || 12,
        singleBottlesCount: item.single_bottles_count || 0,
        remainingQuantity: item.remaining_quantity || 0,
        totalAdded: item.total_added || 0,
        supplier: item.supplier,
        location: item.item_location,
        notes: item.notes,
        photoUrl: item.photo_url,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        createdBy: item.created_by,
        updatedBy: item.updated_by,
        tenantId: item.tenant_id,
        created_by: item.created_by,
        updated_by: item.updated_by,
        created_by_name: item.created_by_user?.name,
        updated_by_name: item.updated_by_user?.name,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }))

      if (reset) {
        items.value = mappedItems
      } else {
        items.value = [...items.value, ...mappedItems]
      }

      totalItemsCount.value = count || 0
      hasMoreItems.value = items.value.length < totalItemsCount.value
      currentPage.value = targetPage
      
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching items:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Load more items (infinite scroll)
  async function loadMoreItems(): Promise<void> {
    if (!hasMoreItems.value || isLoading.value || isSearching.value) return
    await fetchItems(currentPage.value + 1, false)
  }

  // Search items with debounce
  async function searchItems(searchQuery: string): Promise<void> {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    searchDebounceTimer = setTimeout(async () => {
      searchTerm.value = searchQuery
      isSearching.value = !!(searchQuery && searchQuery.length >= 2)
      await fetchItems(1, true)
    }, 500)
  }

  // Reset search
  async function resetSearch(): Promise<void> {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }
    searchTerm.value = ''
    isSearching.value = false
    await fetchItems(1, true)
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
        cartonsDelta: tx.cartons_delta || 0,
        perCartonUpdated: tx.per_carton_updated || 12,
        singleDelta: tx.single_delta || 0,
        totalDelta: tx.total_delta || 0,
        newRemaining: tx.new_remaining || 0,
        previousQuantity: tx.previous_quantity || 0,
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
  // GET ITEMS BY WAREHOUSE (with caching)
  // ============================================
  async function getItemsByWarehouse(warehouseId: string, forceRefresh = false): Promise<InventoryItem[]> {
    // Check if user can access this warehouse
    if (!canModifyWarehouse(warehouseId)) {
      console.warn('Unauthorized access to warehouse:', warehouseId)
      return []
    }
    
    // Check cache
    if (!forceRefresh) {
      const cached = warehouseCache.get(warehouseId)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.items
      }
    }
    
    // Filter from current items (already in memory)
    const result = items.value.filter(item => item.warehouseId === warehouseId && item.remainingQuantity > 0)
    
    // Update cache
    warehouseCache.set(warehouseId, {
      items: result,
      timestamp: Date.now()
    })
    
    return result
  }

  // ============================================
  // ADD INVENTORY ITEM (with optimistic update)
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

    try {
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
        finalCartons = finalCartons + convertedCartons
      }

      const totalQty = (finalCartons * newPerCarton) + finalSingles

      if (totalQty <= 0) {
        throw new Error('Invalid quantity')
      }

      if (existingItem) {
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
          newCartonsTotal = newCartonsTotal + extraCartons
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

        // Update local state instead of full refresh
        const itemIndex = items.value.findIndex(i => i.id === existingItem.id)
        if (itemIndex !== -1) {
          const updatedItemObj = { ...items.value[itemIndex] }
          updatedItemObj.name = updateData.name || updatedItemObj.name
          updatedItemObj.code = updateData.code || updatedItemObj.code
          updatedItemObj.color = updateData.color || updatedItemObj.color
          updatedItemObj.size = updateData.size || updatedItemObj.size
          updatedItemObj.remainingQuantity = newTotal
          updatedItemObj.cartonsCount = newCartonsTotal
          updatedItemObj.singleBottlesCount = newSinglesTotal
          updatedItemObj.updatedAt = new Date()
          items.value[itemIndex] = updatedItemObj
        }

        invalidateCaches()

        const updatedItemResult = items.value.find(i => i.id === existingItem.id)

        return { 
          success: true, 
          type: 'updated', 
          id: existingItem.id,
          item: updatedItemResult,
          quantityAdded,
          message: `Updated ${itemData.name}: Added ${quantityAdded} units`
        }
      } else {
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

        // Get warehouse name
        let warehouseName: string | undefined
        if (itemData.warehouseId) {
          const { data: warehouseData } = await supabase
            .from('warehouses')
            .select('name')
            .eq('id', itemData.warehouseId)
            .single()
          warehouseName = warehouseData?.name
        }

        // Add to local state
        const newItemObj: InventoryItem = {
          id: inserted.id,
          name: inserted.name,
          code: inserted.code,
          color: inserted.color,
          size: inserted.size || '',
          warehouseId: inserted.warehouse_id,
          warehouseName: warehouseName,
          cartonsCount: inserted.cartons_count,
          perCartonCount: inserted.per_carton_count,
          singleBottlesCount: inserted.single_bottles_count,
          remainingQuantity: inserted.remaining_quantity,
          totalAdded: inserted.total_added,
          supplier: inserted.supplier,
          location: inserted.item_location,
          notes: inserted.notes,
          photoUrl: inserted.photo_url,
          createdAt: new Date(inserted.created_at),
          updatedAt: new Date(inserted.updated_at),
          createdBy: inserted.created_by,
          updatedBy: inserted.updated_by,
          tenantId: inserted.tenant_id,
          created_by: inserted.created_by,
          updated_by: inserted.updated_by,
          created_by_name: authStore.user?.name,
          updated_by_name: undefined,
          created_at: inserted.created_at,
          updated_at: inserted.updated_at,
        }

        items.value.unshift(newItemObj)
        totalItemsCount.value++
        invalidateCaches()

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
  // UPDATE ITEM (with optimistic update)
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
    const itemIndex = items.value.findIndex(i => i.id === itemId)
    const originalItem = itemIndex !== -1 ? { ...items.value[itemIndex] } : null
    
    if (itemIndex !== -1 && originalItem) {
      items.value[itemIndex] = { ...items.value[itemIndex], ...itemData }
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

      invalidateCaches()
      return true
    } catch (err: any) {
      // Rollback on error
      if (itemIndex !== -1 && originalItem) {
        items.value[itemIndex] = originalItem
      }
      error.value = err.message
      console.error('Error updating item:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // DELETE ITEM (with optimistic update)
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
    const itemIndex = items.value.findIndex(i => i.id === itemId)
    const deletedItem = itemIndex !== -1 ? items.value[itemIndex] : null
    if (itemIndex !== -1) {
      items.value.splice(itemIndex, 1)
      totalItemsCount.value--
    }

    try {
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)

      if (deleteError) throw deleteError

      invalidateCaches()
      return true
    } catch (err: any) {
      // Rollback on error
      if (deletedItem && itemIndex !== -1) {
        items.value.splice(itemIndex, 0, deletedItem)
        totalItemsCount.value++
      }
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // TRANSFER ITEM (with optimistic update)
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

    // Find the item and update optimistically
    const itemIndex = items.value.findIndex(i => i.id === transferData.item_id)
    const originalItem = itemIndex !== -1 ? { ...items.value[itemIndex] } : null

    if (itemIndex !== -1 && originalItem) {
      const perCarton = originalItem.perCartonCount
      const totalTransferred = (transferData.cartons_count * perCarton) + transferData.single_bottles_count
      const newQuantity = originalItem.remainingQuantity - totalTransferred
      
      items.value[itemIndex] = {
        ...originalItem,
        remainingQuantity: newQuantity,
        cartonsCount: Math.floor(newQuantity / perCarton),
        singleBottlesCount: newQuantity % perCarton
      }
    }

    try {
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

      invalidateCaches()
      
      // Don't refresh full list, just update cache
      await fetchTransactions(50)

      return { 
        success: true, 
        transferTotalQuantity: result?.transferred || 0,
        transactionId: result?.transaction_id,
        message: `Successfully transferred ${result?.transferred || 0} units`
      }
    } catch (err: any) {
      // Rollback on error
      if (itemIndex !== -1 && originalItem) {
        items.value[itemIndex] = originalItem
      }
      error.value = err.message
      console.error('Error transferring item:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // DISPATCH ITEM (with optimistic update)
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

    // Optimistic update
    const itemIndex = items.value.findIndex(i => i.id === dispatchData.item_id)
    const originalItem = itemIndex !== -1 ? { ...items.value[itemIndex] } : null

    if (itemIndex !== -1 && originalItem) {
      const newQuantity = originalItem.remainingQuantity - dispatchData.quantity
      items.value[itemIndex] = {
        ...originalItem,
        remainingQuantity: newQuantity,
        cartonsCount: Math.floor(newQuantity / originalItem.perCartonCount),
        singleBottlesCount: newQuantity % originalItem.perCartonCount
      }
    }

    try {
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

      invalidateCaches()
      await fetchTransactions(50)

      return { 
        success: true, 
        transactionId: result?.transaction_id,
        newQuantity: result?.new_remaining,
        message: `Successfully dispatched ${dispatchData.quantity} units`
      }
    } catch (err: any) {
      // Rollback on error
      if (itemIndex !== -1 && originalItem) {
        items.value[itemIndex] = originalItem
      }
      error.value = err.message
      console.error('Error dispatching item:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // SPARK SEARCH - Server-side search
  // ============================================
  async function searchInventorySpark(params: {
    searchQuery: string
    warehouseId?: string | null
    limit?: number
    strategy?: string
  }): Promise<InventoryItem[]> {
    const { searchQuery: query, warehouseId, limit = 50 } = params

    if (!query || query.trim().length < 2) {
      return []
    }

    // Use server-side search for better performance
    try {
      let supabaseQuery = supabase
        .from('items')
        .select('*')
        .eq('tenant_id', authStore.currentTenantId)
        .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
        .limit(limit)

      if (warehouseId && warehouseId !== 'all') {
        if (!canModifyWarehouse(warehouseId)) {
          return []
        }
        supabaseQuery = supabaseQuery.eq('warehouse_id', warehouseId)
      }

      const { data, error: searchError } = await supabaseQuery

      if (searchError) throw searchError

      const mappedResults: InventoryItem[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        color: item.color,
        size: item.size || '',
        warehouseId: item.warehouse_id,
        warehouseName: undefined,
        cartonsCount: item.cartons_count || 0,
        perCartonCount: item.per_carton_count || 12,
        singleBottlesCount: item.single_bottles_count || 0,
        remainingQuantity: item.remaining_quantity || 0,
        totalAdded: item.total_added || 0,
        supplier: item.supplier,
        location: item.item_location,
        notes: item.notes,
        photoUrl: item.photo_url,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        createdBy: item.created_by,
        updatedBy: item.updated_by,
        tenantId: item.tenant_id,
        created_by: item.created_by,
        updated_by: item.updated_by,
        created_by_name: undefined,
        updated_by_name: undefined,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }))

      return mappedResults
    } catch (err) {
      console.error('Search error:', err)
      return []
    }
  }

  // Force refresh all data
  async function refreshAll(): Promise<void> {
    invalidateCaches()
    await fetchItems(1, true)
    await fetchTransactions(50)
  }

  return {
    // State
    items,
    transactions,
    isLoading,
    error,
    hasMoreItems,
    isSearching,
    searchTerm,

    // Getters
    totalItems,
    totalQuantity,
    lowStockItems,
    outOfStockItems,

    // Actions
    fetchItems,
    loadMoreItems,
    searchItems,
    resetSearch,
    fetchTransactions,
    getItemsByWarehouse,
    addItem,
    updateItem,
    transferItem,
    dispatchItem,
    deleteItem,
    searchInventorySpark,
    refreshAll,
    invalidateCaches,

    // Permission helpers
    canModifyWarehouse,
    canDeleteItem,
  }
})