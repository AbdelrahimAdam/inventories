// stores/inventory.ts
import { defineStore } from 'pinia'
import { ref, computed, onScopeDispose, watch } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import type { InventoryItem, Transaction } from '@/types'

// ---------- Helpers ----------
function normalizeString(text: string | undefined | null): string {
  if (!text) return ''
  return text.toLowerCase().trim().replace(/\s+/g, ' ')
}

function buildUniqueKey(item: {
  name?: string | null
  code?: string | null
  color?: string | null
  size?: string | null
  warehouseId: string
}): string {
  const name = normalizeString(item.name)
  const code = normalizeString(item.code)
  const color = normalizeString(item.color)
  const size = normalizeString(item.size)
  return `${name}|${code}|${color}|${size}|${item.warehouseId}`
}

function mapDbItemToInventoryItem(item: any): InventoryItem {
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    color: item.color,
    size: item.size || '',
    warehouseId: item.warehouse_id,
    warehouseName: item.warehouse_name || item.warehouses?.name,
    cartonsCount: item.cartons_count,
    perCartonCount: item.per_carton_count,
    singleBottlesCount: item.single_bottles_count,
    remainingQuantity: item.remaining_quantity,
    totalAdded: item.total_added,
    supplier: item.supplier,
    location: item.item_location || item.location,
    notes: item.notes,
    photoUrl: item.photo_url,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    createdBy: item.created_by,
    updatedBy: item.updated_by,
    tenantId: item.tenant_id,
    created_by_name: item.created_by_user?.name || null,
    updated_by_name: item.updated_by_user?.name || null,
  }
}

export const useInventoryStore = defineStore('inventory', () => {
  const authStore = useAuthStore()

  // Use Map for O(1) lookups instead of array
  const itemsMap = ref<Map<string, InventoryItem>>(new Map())
  const itemsList = computed(() => Array.from(itemsMap.value.values()))
  
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const pageSize = ref(50)
  const totalCount = ref(0)

  let searchAbortController: AbortController | null = null
  let itemsSubscription: any = null

  let lastItemsFetchTime = 0
  let lastItemsFiltersHash = ''

  // Aggregated stats (single object from RPC)
  const summaryStats = ref({
    totalItems: 0,
    totalQuantity: 0,
    lowStock: 0,
    criticalStock: 0,
    outOfStock: 0,
  })

  const currentFilters = ref({
    search: '',
    warehouseId: '',
    status: '',
    color: '',
    size: '',
  })

  const transactionFilters = ref({
    type: '',
    dateRange: { start: null as Date | null, end: null as Date | null },
  })

  const viewMode = ref<'paginated' | 'view-all'>('paginated')
  const tableScrollPositions = ref<Record<string, number>>({})

  // Computed from Map – O(1) access by id
  const totalItems = computed(() => itemsMap.value.size)
  const totalQuantity = computed(() => {
    let sum = 0
    for (const item of itemsMap.value.values()) sum += item.remainingQuantity || 0
    return sum
  })
  const lowStockItems = computed(() => 
    itemsList.value.filter(i => i.remainingQuantity < 10 && i.remainingQuantity > 0)
  )
  const outOfStockItems = computed(() => 
    itemsList.value.filter(i => i.remainingQuantity === 0)
  )

  // Persistence helpers (unchanged)
  const STORAGE_KEYS = {
    PAGE_SIZE: 'inventory_pageSize',
    FILTERS: 'inventory_filters',
    TX_FILTERS: 'inventory_txFilters',
    VIEW_MODE: 'inventory_viewMode',
    SCROLL_POSITIONS: 'inventory_scrollPositions',
  }

  function loadPersistedSettings() {
    try {
      const savedPageSize = localStorage.getItem(STORAGE_KEYS.PAGE_SIZE)
      if (savedPageSize) pageSize.value = parseInt(savedPageSize, 10)
      const savedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS)
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters)
        currentFilters.value = { ...currentFilters.value, ...parsed }
      }
      const savedTxFilters = localStorage.getItem(STORAGE_KEYS.TX_FILTERS)
      if (savedTxFilters) transactionFilters.value = JSON.parse(savedTxFilters)
      const savedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE)
      if (savedViewMode === 'view-all' || savedViewMode === 'paginated') viewMode.value = savedViewMode
      const savedScroll = localStorage.getItem(STORAGE_KEYS.SCROLL_POSITIONS)
      if (savedScroll) tableScrollPositions.value = JSON.parse(savedScroll)
    } catch (e) { console.warn(e) }
  }

  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEYS.PAGE_SIZE, pageSize.value.toString())
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(currentFilters.value))
    localStorage.setItem(STORAGE_KEYS.TX_FILTERS, JSON.stringify(transactionFilters.value))
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode.value)
    localStorage.setItem(STORAGE_KEYS.SCROLL_POSITIONS, JSON.stringify(tableScrollPositions.value))
  }

  watch([pageSize, currentFilters, transactionFilters, viewMode, tableScrollPositions], () => saveToLocalStorage(), { deep: true })

  function saveScrollPosition(tableName: string, scrollTop: number) {
    tableScrollPositions.value[tableName] = scrollTop
  }
  function getScrollPosition(tableName: string): number {
    return tableScrollPositions.value[tableName] || 0
  }

  // Permission helpers
  const canModifyWarehouse = (warehouseId: string): boolean => {
    if (authStore.isSuperAdmin || authStore.isCompanyManager) return true
    if (authStore.isWarehouseManager) return authStore.canAccessWarehouse(warehouseId)
    return false
  }
  const canDeleteItem = (): boolean => authStore.isSuperAdmin || authStore.isCompanyManager

  // Map helpers
  function updateLocalItem(updatedItem: InventoryItem) {
    itemsMap.value.set(updatedItem.id, { ...updatedItem })
  }
  function removeLocalItem(itemId: string) {
    itemsMap.value.delete(itemId)
  }

  function reset() {
    itemsMap.value.clear()
    transactions.value = []
    totalCount.value = 0
    currentPage.value = 1
    isLoading.value = false
    error.value = null
    summaryStats.value = { totalItems: 0, totalQuantity: 0, lowStock: 0, criticalStock: 0, outOfStock: 0 }
    if (searchAbortController) {
      searchAbortController.abort()
      searchAbortController = null
    }
  }

  // ---------- Stats using RPC (single aggregate query) ----------
  async function fetchSummaryStats(params?: { search?: string; warehouseId?: string; color?: string; size?: string }) {
    const { search, warehouseId, color, size } = params || {}
    try {
      const { data, error: rpcError } = await supabase.rpc('get_inventory_stats', {
        p_tenant_id: authStore.currentTenantId,
        p_search: search || null,
        p_warehouse_id: warehouseId || null,
        p_color: color || null,
        p_size: size || null,
      })
      if (rpcError) throw rpcError
      if (data && data.length) {
        const row = data[0]
        summaryStats.value = {
          totalItems: totalCount.value,
          totalQuantity: row.total_stock,
          lowStock: row.low_stock,
          criticalStock: row.critical_stock,
          outOfStock: row.out_of_stock,
        }
      }
    } catch (err) {
      console.error('Error fetching summary stats:', err)
    }
  }

  // ---------- Lightweight list query (only necessary columns) ----------
  async function fetchItemsPage(params: {
    page: number
    pageSize?: number
    search?: string
    warehouseId?: string
    status?: string
    color?: string
    size?: string
    force?: boolean
  }): Promise<void> {
    const { page, pageSize: pgSize = pageSize.value, search, warehouseId, status, color, size: itemSize, force = false } = params
    const from = (page - 1) * pgSize
    const currentHash = JSON.stringify({ page, pgSize, search, warehouseId, status, color, size: itemSize })
    const now = Date.now()
    const cacheValid = !force && lastItemsFetchTime > 0 && (now - lastItemsFetchTime) < 300000 && lastItemsFiltersHash === currentHash && itemsMap.value.size > 0

    if (cacheValid) {
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const { data, count, error: fetchError } = await supabase
        .rpc('get_items_page', {
          p_tenant_id: authStore.currentTenantId,
          p_limit: pgSize,
          p_offset: from,
          p_search: search || null,
          p_warehouse_id: warehouseId || null,
          p_status: status || null,
          p_color: color || null,
          p_size: itemSize || null,
        })
        .then(result => ({ data: result.data, count: result.count, error: result.error }))

      if (fetchError) throw fetchError

      const newMap = new Map<string, InventoryItem>()
      for (const item of data || []) {
        const mapped = mapDbItemToInventoryItem(item)
        newMap.set(mapped.id, mapped)
      }
      itemsMap.value = newMap
      totalCount.value = count || 0
      currentPage.value = page
      currentFilters.value = { search: search || '', warehouseId: warehouseId || '', status: status || '', color: color || '', size: itemSize || '' }

      lastItemsFetchTime = Date.now()
      lastItemsFiltersHash = currentHash

      await fetchSummaryStats({ search, warehouseId, color, size: itemSize })
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching items page:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Fallback full fetch (kept for compatibility, but discouraged)
  async function fetchItems(): Promise<void> {
    await fetchItemsPage({ page: 1, pageSize: 10000, force: true })
  }

  // Export with chunking (server-side CSV would be better, but here we chunk)
  async function fetchAllItemsForExport(params: { search?: string; warehouseId?: string; status?: string; color?: string; size?: string }): Promise<InventoryItem[]> {
    const { search, warehouseId, status, color, size: itemSize } = params
    const allItems: InventoryItem[] = []
    let offset = 0
    const limit = 500
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .rpc('get_items_page', {
          p_tenant_id: authStore.currentTenantId,
          p_limit: limit,
          p_offset: offset,
          p_search: search || null,
          p_warehouse_id: warehouseId || null,
          p_status: status || null,
          p_color: color || null,
          p_size: itemSize || null,
        })
      if (error) throw error
      if (!data || data.length === 0) break
      allItems.push(...data.map(mapDbItemToInventoryItem))
      offset += limit
      hasMore = data.length === limit
    }
    return allItems
  }

  // Single item fetch (detailed view)
  async function fetchItemById(itemId: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`)
        .eq('id', itemId)
        .single()
      if (error) throw error
      return data ? mapDbItemToInventoryItem(data) : null
    } catch (err) {
      console.error('Error fetching item:', err)
      return null
    }
  }

  // Transactions (unchanged but can be optimized later)
  async function fetchTransactions(page: number = 1, pageSizeArg: number = 50, append: boolean = false): Promise<{ data: Transaction[]; total: number }> {
    const from = (page - 1) * pageSizeArg
    const to = from + pageSizeArg - 1
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('tenant_id', authStore.currentTenantId)
        .order('created_at', { ascending: false })
        .range(from, to)
      if (authStore.isWarehouseManager) {
        const allowed = authStore.user?.allowedWarehouses || []
        if (allowed.length && !allowed.includes('all')) {
          query = query.or(`from_warehouse.in.(${allowed.join(',')}),to_warehouse.in.(${allowed.join(',')})`)
        }
      }
      const { data, count, error: fetchError } = await query
      if (fetchError) throw fetchError
      const mapped = (data || []).map((tx: any) => ({
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
      if (append) transactions.value = [...transactions.value, ...mapped]
      else transactions.value = mapped
      return { data: mapped, total: count || 0 }
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
      return { data: [], total: 0 }
    }
  }

  async function searchTransactions(searchTerm: string, limit: number = 200): Promise<Transaction[]> {
    if (!searchTerm || searchTerm.trim().length < 2) return []
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('tenant_id', authStore.currentTenantId)
        .or(`item_name.ilike.%${searchTerm}%,item_code.ilike.%${searchTerm}%,created_by.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (authStore.isWarehouseManager) {
        const allowed = authStore.user?.allowedWarehouses || []
        if (allowed.length && !allowed.includes('all')) {
          query = query.or(`from_warehouse.in.(${allowed.join(',')}),to_warehouse.in.(${allowed.join(',')})`)
        }
      }
      const { data, error } = await query
      if (error) throw error
      return (data || []).map((tx: any) => ({ ...tx, createdAt: new Date(tx.created_at) }))
    } catch (err) {
      console.error('Error searching transactions:', err)
      return []
    }
  }

  // getItemsByWarehouse (deprecated but kept for compatibility)
  async function getItemsByWarehouse(warehouseId: string): Promise<InventoryItem[]> {
    if (!canModifyWarehouse(warehouseId)) return []
    const { data, error } = await supabase
      .from('items')
      .select(`*, warehouses(name)`)
      .eq('tenant_id', authStore.currentTenantId)
      .eq('warehouse_id', warehouseId)
      .gt('remaining_quantity', 0)
      .order('name')
    if (error) {
      console.error(error)
      return []
    }
    return (data || []).map(mapDbItemToInventoryItem)
  }

  // ---------- Add / Update / Delete (using Map and unique_key) ----------
  async function addItem(itemData: Partial<InventoryItem> & { isAddingCartons?: boolean; size?: string }): Promise<{
    success: boolean; type?: string; id?: string; message?: string; item?: InventoryItem; quantityAdded?: number
  }> {
    const tenantId = authStore.currentTenantId
    if (!tenantId) throw new Error('No tenant')
    if (!authStore.user) throw new Error('Unauthorized')
    if (!authStore.canEdit) {
      error.value = 'ليس لديك صلاحية لإضافة الأصناف'
      return { success: false, message: 'ليس لديك صلاحية لإضافة الأصناف' }
    }
    if (itemData.warehouseId && !canModifyWarehouse(itemData.warehouseId)) {
      error.value = 'ليس لديك صلاحية للوصول إلى هذا المخزن'
      return { success: false, message: 'ليس لديك صلاحية للوصول إلى هذا المخزن' }
    }
    isLoading.value = true
    error.value = null
    const tempId = `temp_${Date.now()}_${Math.random()}`
    try {
      const newCartons = Number(itemData.cartonsCount) || 0
      const newPerCarton = Number(itemData.perCartonCount) || 12
      const newSingles = Number(itemData.singleBottlesCount) || 0
      let finalCartons = newCartons, finalSingles = newSingles, convertedCartons = 0
      if (finalSingles >= newPerCarton) {
        convertedCartons = Math.floor(finalSingles / newPerCarton)
        finalSingles %= newPerCarton
        finalCartons += convertedCartons
      }
      const totalQty = finalCartons * newPerCarton + finalSingles
      if (totalQty <= 0) throw new Error('Invalid quantity')

      const uniqueKey = buildUniqueKey({
        name: itemData.name,
        code: itemData.code,
        color: itemData.color,
        size: itemData.size,
        warehouseId: itemData.warehouseId!,
      })

      // Check local map
      let existingItem: InventoryItem | undefined
      for (const item of itemsMap.value.values()) {
        const existingKey = buildUniqueKey({
          name: item.name,
          code: item.code,
          color: item.color,
          size: item.size,
          warehouseId: item.warehouseId,
        })
        if (existingKey === uniqueKey) {
          existingItem = item
          break
        }
      }

      if (existingItem) {
        // Update existing – only override fields that are provided in itemData
        const currentCartons = existingItem.cartonsCount
        const currentSingles = existingItem.singleBottlesCount
        let newCartonsTotal = currentCartons, newSinglesTotal = currentSingles
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
          newSinglesTotal %= newPerCarton
          newCartonsTotal += extraCartons
        }
        const newTotal = newCartonsTotal * newPerCarton + newSinglesTotal
        const quantityAdded = newTotal - (existingItem.remainingQuantity || 0)

        // Build update object – only include fields that are present
        const updatePayload: any = {
          cartons_count: newCartonsTotal,
          per_carton_count: newPerCarton,
          single_bottles_count: newSinglesTotal,
          remaining_quantity: newTotal,
          total_added: (existingItem.totalAdded || 0) + (quantityAdded > 0 ? quantityAdded : 0),
          updated_at: new Date().toISOString(),
          updated_by: authStore.user?.id,
          unique_key: uniqueKey,
        }
        if (itemData.supplier !== undefined) updatePayload.supplier = itemData.supplier?.trim()
        if (itemData.location !== undefined) updatePayload.item_location = itemData.location?.trim()
        if (itemData.notes !== undefined) updatePayload.notes = itemData.notes?.trim()
        if (itemData.photoUrl !== undefined) updatePayload.photo_url = itemData.photoUrl
        // Name, code, color, size should NOT be updated when adding quantity – they remain from existing item

        // Optimistic update: create a new InventoryItem with merged values
        const optimisticUpdated: InventoryItem = {
          ...existingItem,
          cartonsCount: newCartonsTotal,
          perCartonCount: newPerCarton,
          singleBottlesCount: newSinglesTotal,
          remainingQuantity: newTotal,
          totalAdded: updatePayload.total_added,
          updatedAt: new Date(),
          updatedBy: authStore.user?.id,
          supplier: itemData.supplier?.trim() ?? existingItem.supplier,
          location: itemData.location?.trim() ?? existingItem.location,
          notes: itemData.notes?.trim() ?? existingItem.notes,
          photoUrl: itemData.photoUrl ?? existingItem.photoUrl,
        }
        updateLocalItem(optimisticUpdated)

        const { error: updateError } = await supabase.from('items').update(updatePayload).eq('id', existingItem.id)
        if (updateError) throw updateError

        if (quantityAdded !== 0) {
          await supabase.from('transactions').insert({
            type: 'ADD',
            item_id: existingItem.id,
            item_name: existingItem.name,
            item_code: existingItem.code,
            to_warehouse: itemData.warehouseId,
            cartons_delta: finalCartons,
            per_carton_updated: newPerCarton,
            single_delta: finalSingles,
            total_delta: quantityAdded,
            new_remaining: newTotal,
            user_id: authStore.user?.id,
            notes: itemData.notes || `تمت إضافة ${finalCartons} كرتونة و ${finalSingles} فردي`,
            created_by: authStore.user?.name || authStore.user?.email,
            tenant_id: tenantId,
          })
        }

        const { data: refreshed } = await supabase
          .from('items')
          .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`)
          .eq('id', existingItem.id)
          .single()
        if (refreshed) updateLocalItem(mapDbItemToInventoryItem(refreshed))

        return { success: true, type: 'updated', id: existingItem.id, item: itemsMap.value.get(existingItem.id), quantityAdded, message: `تم تحديث ${existingItem.name}: أضيف ${quantityAdded} وحدة` }
      }

      // Check database via unique_key
      const { data: existingDbItem, error: findError } = await supabase
        .from('items')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('unique_key', uniqueKey)
        .maybeSingle()
      if (findError) throw findError

      if (existingDbItem) {
        // Recursively call addItem to trigger the update path with the existing item
        return await addItem({ ...itemData, isAddingCartons: true })
      }

      // Create new item
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
        tenant_id: tenantId,
        unique_key: uniqueKey,
      }

      const optimisticItem = mapDbItemToInventoryItem({ ...newItem, id: tempId })
      itemsMap.value.set(tempId, optimisticItem)

      const { data: inserted, error: insertError } = await supabase.from('items').insert(newItem).select().single()
      if (insertError) {
        itemsMap.value.delete(tempId)
        if (insertError.code === '23505') {
          return { success: false, message: 'هذا الصنف موجود بالفعل في نفس المخزن' }
        }
        throw insertError
      }

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
        notes: convertedCartons > 0 ? `صنف جديد (تم تحويل ${convertedCartons} كرتونة من الفردي)` : 'صنف جديد',
        created_by: authStore.user?.name || authStore.user?.email,
        tenant_id: tenantId,
      })

      const realItem = mapDbItemToInventoryItem(inserted)
      itemsMap.value.delete(tempId)
      itemsMap.value.set(realItem.id, realItem)
      return { success: true, type: 'created', id: realItem.id, item: realItem, quantityAdded: totalQty, message: `تم إنشاء صنف جديد: ${itemData.name}` }
    } catch (err: any) {
      itemsMap.value.delete(tempId)
      error.value = err.message
      console.error(err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updateItem(itemId: string, itemData: Partial<InventoryItem>): Promise<boolean> {
    if (!authStore.canEdit) {
      error.value = 'ليس لديك صلاحية لتعديل الأصناف'
      return false
    }
    const existingItem = itemsMap.value.get(itemId)
    if (existingItem && !canModifyWarehouse(existingItem.warehouseId)) {
      error.value = 'ليس لديك صلاحية للوصول إلى هذا المخزن'
      return false
    }
    if (itemData.warehouseId && !canModifyWarehouse(itemData.warehouseId)) {
      error.value = 'ليس لديك صلاحية للوصول إلى المخزن الهدف'
      return false
    }
    isLoading.value = true
    error.value = null
    const originalItem = existingItem ? { ...existingItem } : null
    if (existingItem) {
      const updated = { ...existingItem, ...itemData, updatedAt: new Date() }
      updateLocalItem(updated)
    }
    try {
      const newUniqueKey = buildUniqueKey({
        name: itemData.name ?? existingItem?.name,
        code: itemData.code ?? existingItem?.code,
        color: itemData.color ?? existingItem?.color,
        size: itemData.size ?? existingItem?.size,
        warehouseId: itemData.warehouseId ?? existingItem?.warehouseId!,
      })
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
          unique_key: newUniqueKey,
        })
        .eq('id', itemId)
      if (updateError) throw updateError
      return true
    } catch (err: any) {
      if (originalItem) updateLocalItem(originalItem)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deleteItem(itemId: string): Promise<boolean> {
    if (!canDeleteItem()) {
      error.value = 'فقط المدير العام ومدير الشركة يمكنهم حذف الأصناف'
      return false
    }
    const existingItem = itemsMap.value.get(itemId)
    if (existingItem && !canModifyWarehouse(existingItem.warehouseId)) {
      error.value = 'ليس لديك صلاحية للوصول إلى هذا المخزن'
      return false
    }
    isLoading.value = true
    error.value = null
    removeLocalItem(itemId)
    try {
      const { error: deleteError } = await supabase.from('items').delete().eq('id', itemId)
      if (deleteError) throw deleteError
      return true
    } catch (err: any) {
      if (existingItem) itemsMap.value.set(existingItem.id, existingItem)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function transferItem(transferData: {
    item_id: string
    from_warehouse_id: string
    to_warehouse_id: string
    cartons_count: number
    single_bottles_count: number
    notes?: string
  }): Promise<{ success: boolean; message?: string; transferTotalQuantity?: number; transactionId?: string }> {
    if (!authStore.canEdit) {
      error.value = 'ليس لديك صلاحية لنقل الأصناف'
      return { success: false, message: 'ليس لديك صلاحية لنقل الأصناف' }
    }
    if (!canModifyWarehouse(transferData.from_warehouse_id)) {
      error.value = 'ليس لديك صلاحية للوصول إلى المخزن المصدر'
      return { success: false, message: 'ليس لديك صلاحية للوصول إلى المخزن المصدر' }
    }
    if (authStore.isWarehouseManager && !canModifyWarehouse(transferData.to_warehouse_id)) {
      error.value = 'ليس لديك صلاحية للوصول إلى المخزن الوجهة'
      return { success: false, message: 'ليس لديك صلاحية للوصول إلى المخزن الوجهة' }
    }
    isLoading.value = true
    error.value = null
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

      const updatedSource = await fetchItemById(transferData.item_id)
      if (updatedSource) updateLocalItem(updatedSource)

      // Update destination cache via unique_key lookup
      if (updatedSource) {
        const destUniqueKey = buildUniqueKey({
          name: updatedSource.name,
          code: updatedSource.code,
          color: updatedSource.color,
          size: updatedSource.size,
          warehouseId: transferData.to_warehouse_id,
        })
        const { data: destItem } = await supabase
          .from('items')
          .select('*')
          .eq('tenant_id', authStore.currentTenantId)
          .eq('unique_key', destUniqueKey)
          .maybeSingle()
        if (destItem) {
          const mapped = mapDbItemToInventoryItem(destItem)
          itemsMap.value.set(mapped.id, mapped)
        }
      }

      return { success: true, transferTotalQuantity: result?.transferred || 0, transactionId: result?.transaction_id, message: `تم نقل ${result?.transferred || 0} وحدة بنجاح` }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

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
      error.value = 'ليس لديك صلاحية لصرف الأصناف'
      return { success: false, message: 'ليس لديك صلاحية لصرف الأصناف' }
    }
    if (!canModifyWarehouse(dispatchData.from_warehouse_id)) {
      error.value = 'ليس لديك صلاحية للوصول إلى هذا المخزن'
      return { success: false, message: 'ليس لديك صلاحية للوصول إلى هذا المخزن' }
    }
    isLoading.value = true
    error.value = null
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

      const updatedSource = await fetchItemById(dispatchData.item_id)
      if (updatedSource) updateLocalItem(updatedSource)

      return { success: true, transactionId: result?.transaction_id, newQuantity: result?.new_remaining, message: `تم صرف ${dispatchData.quantity} وحدة بنجاح` }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Search using RPC for better performance
  async function searchInventorySpark(params: { searchQuery: string; warehouseId?: string | null; limit?: number; strategy?: string }): Promise<InventoryItem[]> {
    const { searchQuery, warehouseId, limit = 50 } = params
    if (!searchQuery || searchQuery.trim().length < 2) return []
    if (searchAbortController) searchAbortController.abort()
    searchAbortController = new AbortController()
    try {
      const { data, error } = await supabase.rpc('search_items', {
        p_tenant_id: authStore.currentTenantId,
        p_query: searchQuery,
        p_warehouse_id: warehouseId || null,
        p_limit: limit,
        p_offset: 0,
      })
      if (error) throw error
      return (data || []).map(mapDbItemToInventoryItem)
    } catch (err: any) {
      if (err.name === 'AbortError') return []
      console.error('Search error:', err)
      return []
    }
  }

  // Realtime subscription (optimized with Map)
  function setupRealtimeSubscription() {
    if (itemsSubscription) return
    itemsSubscription = supabase
      .channel('items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `tenant_id=eq.${authStore.currentTenantId}` }, async (payload) => {
        const { eventType, new: newRecord } = payload
        if (eventType === 'INSERT' && newRecord) {
          const newItem = mapDbItemToInventoryItem(newRecord)
          if (!itemsMap.value.has(newItem.id)) {
            itemsMap.value.set(newItem.id, newItem)
            totalCount.value++
          }
        } else if (eventType === 'UPDATE' && newRecord) {
          const updatedItem = mapDbItemToInventoryItem(newRecord)
          itemsMap.value.set(updatedItem.id, updatedItem)
        } else if (eventType === 'DELETE' && payload.old) {
          itemsMap.value.delete(payload.old.id)
          totalCount.value--
        }
      })
      .subscribe()
  }
  if (authStore.currentTenantId) setupRealtimeSubscription()
  onScopeDispose(() => {
    if (itemsSubscription) supabase.removeChannel(itemsSubscription)
    if (searchAbortController) searchAbortController.abort()
  })

  loadPersistedSettings()

  return {
    items: itemsList,         // for compatibility (array)
    itemsMap,                 // optional for direct use
    transactions,
    isLoading,
    error,
    totalCount,
    totalItems,
    totalQuantity,
    lowStockItems,
    outOfStockItems,
    summaryStats: computed(() => summaryStats.value),
    currentFilters,
    transactionFilters,
    viewMode,
    fetchItems,
    fetchItemsPage,
    fetchSummaryStats,
    fetchAllItemsForExport,
    fetchItemById,
    fetchTransactions,
    searchTransactions,
    getItemsByWarehouse,
    addItem,
    updateItem,
    transferItem,
    dispatchItem,
    deleteItem,
    searchInventorySpark,
    refreshSummaryStats: fetchSummaryStats,
    canModifyWarehouse,
    canDeleteItem,
    reset,
    saveScrollPosition,
    getScrollPosition,
    pageSize,
  }
})
