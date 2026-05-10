// stores/inventory.ts
import { defineStore } from 'pinia'
import { ref, computed, onScopeDispose, watch } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import type { InventoryItem, Transaction } from '@/types'

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
  const createdByName = item.created_by_user_name ?? item.created_by_user?.name ?? ''
  const updatedByName = item.updated_by_user_name ?? item.updated_by_user?.name ?? ''

  return {
    id: item.id,
    name: item.name,
    code: item.code,
    color: item.color ?? '',
    size: item.size ?? '',
    warehouseId: item.warehouse_id,
    warehouseName: item.warehouse_name ?? item.warehouses?.name ?? '',
    cartonsCount: item.cartons_count,
    perCartonCount: item.per_carton_count,
    singleBottlesCount: item.single_bottles_count,
    remainingQuantity: item.remaining_quantity,
    totalAdded: item.total_added,
    supplier: item.supplier ?? '',
    location: item.item_location ?? '',
    notes: item.notes ?? '',
    photoUrl: item.photo_url ?? '',
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    createdBy: item.created_by ?? '',
    updatedBy: item.updated_by ?? '',
    tenantId: item.tenant_id,
    created_by_name: createdByName,
    updated_by_name: updatedByName,
  }
}

function mapDbTransactionToTransaction(tx: any): Transaction {
  return {
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
  }
}

export const useInventoryStore = defineStore('inventory', () => {
  const authStore = useAuthStore()

  const itemsMap = ref<Map<string, InventoryItem>>(new Map())
  const itemsByUniqueKey = ref<Map<string, string>>(new Map())
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

  const totalItems = computed(() => itemsMap.value.size)
  const totalQuantity = computed(() => {
    let sum = 0
    for (const item of itemsMap.value.values()) sum += item.remainingQuantity || 0
    return sum
  })
  const lowStockItems = computed(() => itemsList.value.filter(i => i.remainingQuantity < 10 && i.remainingQuantity > 0))
  const outOfStockItems = computed(() => itemsList.value.filter(i => i.remainingQuantity === 0))

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

  watch(pageSize, saveToLocalStorage)
  watch(viewMode, saveToLocalStorage)
  watch(currentFilters, saveToLocalStorage, { deep: true })
  watch(transactionFilters, saveToLocalStorage, { deep: true })
  watch(tableScrollPositions, saveToLocalStorage, { deep: true })

  function saveScrollPosition(tableName: string, scrollTop: number) {
    tableScrollPositions.value[tableName] = scrollTop
  }
  function getScrollPosition(tableName: string): number {
    return tableScrollPositions.value[tableName] || 0
  }

  const canModifyWarehouse = (warehouseId: string): boolean => {
    if (authStore.isSuperAdmin || authStore.isCompanyManager) return true
    if (authStore.isWarehouseManager) return authStore.canAccessWarehouse(warehouseId)
    return false
  }
  const canDeleteItem = (): boolean => authStore.isSuperAdmin || authStore.isCompanyManager

  function getAllowedWarehouses(): string[] {
    if (authStore.isSuperAdmin || authStore.isCompanyManager) return ['all']
    const allowed = authStore.user?.allowedWarehouses || []
    if (allowed.length === 0) return []
    return allowed
  }

  function updateLocalItem(updatedItem: InventoryItem) {
    const oldItem = itemsMap.value.get(updatedItem.id)
    if (oldItem) {
      const oldKey = buildUniqueKey({
        name: oldItem.name,
        code: oldItem.code,
        color: oldItem.color,
        size: oldItem.size,
        warehouseId: oldItem.warehouseId,
      })
      itemsByUniqueKey.value.delete(oldKey)
    }
    itemsMap.value.set(updatedItem.id, { ...updatedItem })
    const newKey = buildUniqueKey({
      name: updatedItem.name,
      code: updatedItem.code,
      color: updatedItem.color,
      size: updatedItem.size,
      warehouseId: updatedItem.warehouseId,
    })
    itemsByUniqueKey.value.set(newKey, updatedItem.id)
  }

  function removeLocalItem(itemId: string) {
    const item = itemsMap.value.get(itemId)
    if (item) {
      const key = buildUniqueKey({
        name: item.name,
        code: item.code,
        color: item.color,
        size: item.size,
        warehouseId: item.warehouseId,
      })
      itemsByUniqueKey.value.delete(key)
    }
    itemsMap.value.delete(itemId)
  }

  function reset() {
    itemsMap.value.clear()
    itemsByUniqueKey.value.clear()
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

  async function fetchTotalCount(params: {
    search?: string
    warehouseId?: string
    status?: string
    color?: string
    size?: string
  }): Promise<number> {
    const { search, warehouseId, status, color, size } = params
    let query = supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', authStore.currentTenantId)

    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,size.ilike.%${search}%`)
    }
    if (warehouseId) query = query.eq('warehouse_id', warehouseId)
    if (status === 'in_stock') query = query.gt('remaining_quantity', 500)
    else if (status === 'low_stock') query = query.lte('remaining_quantity', 500).gt('remaining_quantity', 0)
    else if (status === 'critical_stock') query = query.lte('remaining_quantity', 250).gt('remaining_quantity', 0)
    else if (status === 'out_of_stock') query = query.eq('remaining_quantity', 0)
    if (color && color.trim()) query = query.ilike('color', `%${color}%`)
    if (size && size.trim()) query = query.ilike('size', `%${size}%`)

    const allowed = getAllowedWarehouses()
    if (!allowed.includes('all') && allowed.length > 0) {
      query = query.in('warehouse_id', allowed)
    } else if (allowed.length === 0) {
      return 0
    }

    const { count, error } = await query
    if (error) throw error
    return count || 0
  }

  async function fetchSummaryStats(params?: { search?: string; warehouseId?: string; color?: string; size?: string }) {
    const { search, warehouseId, color, size } = params || {}
    try {
      const { data, error: rpcError } = await supabase.rpc('get_inventory_stats', {
        p_tenant_id: authStore.currentTenantId,
        p_search: search || null,
        p_warehouse_id: warehouseId || null,
        p_color: color || null,
        p_size: size || null,
        p_allowed_warehouses: getAllowedWarehouses(),
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
    const currentHash = JSON.stringify({ page, pgSize, search, warehouseId, status, color, size: itemSize })
    const now = Date.now()
    const cacheValid = !force && lastItemsFetchTime > 0 && (now - lastItemsFetchTime) < 300000 &&
                       lastItemsFiltersHash === currentHash && itemsMap.value.size > 0

    if (cacheValid) {
      isLoading.value = false
      return
    }

    if (searchAbortController) {
      searchAbortController.abort()
    }
    searchAbortController = new AbortController()

    isLoading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase.rpc('get_items_page', {
        p_tenant_id: authStore.currentTenantId,
        p_limit: pgSize,
        p_offset: (page - 1) * pgSize,
        p_search: search || null,
        p_warehouse_id: warehouseId || null,
        p_status: status || null,
        p_color: color || null,
        p_size: itemSize || null,
        p_allowed_warehouses: getAllowedWarehouses(),
      })
      if (rpcError) throw rpcError

      const total = await fetchTotalCount({ search, warehouseId, status, color, size: itemSize })
      totalCount.value = total

      const newMap = new Map<string, InventoryItem>()
      const newUniqueMap = new Map<string, string>()
      for (const item of data || []) {
        const mapped = mapDbItemToInventoryItem(item)
        newMap.set(mapped.id, mapped)
        const key = buildUniqueKey({
          name: mapped.name,
          code: mapped.code,
          color: mapped.color,
          size: mapped.size,
          warehouseId: mapped.warehouseId,
        })
        newUniqueMap.set(key, mapped.id)
      }
      itemsMap.value = newMap
      itemsByUniqueKey.value = newUniqueMap
      currentPage.value = page
      currentFilters.value = { search: search || '', warehouseId: warehouseId || '', status: status || '', color: color || '', size: itemSize || '' }

      lastItemsFetchTime = Date.now()
      lastItemsFiltersHash = currentHash

      await fetchSummaryStats({ search, warehouseId, color, size: itemSize })
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        error.value = err.message
        console.error('Error fetching items page:', err)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchItems(): Promise<void> {
    await fetchItemsPage({ page: 1, pageSize: 10000, force: true })
  }

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
          p_allowed_warehouses: getAllowedWarehouses(),
        })
      if (error) throw error
      if (!data || data.length === 0) break
      allItems.push(...data.map(mapDbItemToInventoryItem))
      offset += limit
      hasMore = data.length === limit
    }
    return allItems
  }

  async function fetchItemById(itemId: string): Promise<InventoryItem | null> {
    try {
      let query = supabase
        .from('items')
        .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`)
        .eq('id', itemId)
        .eq('tenant_id', authStore.currentTenantId)

      const allowed = getAllowedWarehouses()
      if (!allowed.includes('all') && allowed.length > 0) {
        query = query.in('warehouse_id', allowed)
      } else if (allowed.length === 0) {
        return null
      }

      const { data, error } = await query.single()
      if (error) throw error
      return data ? mapDbItemToInventoryItem(data) : null
    } catch (err) {
      console.error('Error fetching item:', err)
      return null
    }
  }

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
      const mapped = (data || []).map(mapDbTransactionToTransaction)
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
      return (data || []).map(mapDbTransactionToTransaction)
    } catch (err) {
      console.error('Error searching transactions:', err)
      return []
    }
  }

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

  async function fetchAlertItems(warehouseId?: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase.rpc('get_alert_items', {
        p_tenant_id: authStore.currentTenantId,
        p_warehouse_id: warehouseId || null,
        p_allowed_warehouses: getAllowedWarehouses(),
      })
      if (error) throw error
      return (data || []).map(mapDbItemToInventoryItem)
    } catch (err) {
      console.error('Error fetching alert items:', err)
      return []
    }
  }

  // ✅ FIXED: performUpdate now correctly adds quantity without changing perCartonCount
  async function performUpdate(
    existingItem: InventoryItem,
    itemData: Partial<InventoryItem> & { isAddingCartons?: boolean; size?: string },
    finalCartons: number,
    finalSingles: number,
    newPerCarton: number,
    tenantId: string,
    warehouseId: string
  ): Promise<{
    success: boolean; type?: string; id?: string; message?: string; item?: InventoryItem; quantityAdded?: number
  }> {
    const isAdding = itemData.isAddingCartons !== false
    let newCartonsTotal: number
    let newSinglesTotal: number
    let newTotal: number
    let quantityAdded: number

    if (isAdding) {
      const existingTotal = (existingItem.cartonsCount * existingItem.perCartonCount) + existingItem.singleBottlesCount
      const newTotalUnits = (finalCartons * newPerCarton) + finalSingles
      const combinedTotal = existingTotal + newTotalUnits
      quantityAdded = newTotalUnits
      const perCarton = existingItem.perCartonCount
      newCartonsTotal = Math.floor(combinedTotal / perCarton)
      newSinglesTotal = combinedTotal % perCarton
      newTotal = combinedTotal
    } else {
      newCartonsTotal = finalCartons
      newSinglesTotal = finalSingles
      const newTotalUnits = (finalCartons * newPerCarton) + finalSingles
      const existingTotal = (existingItem.cartonsCount * existingItem.perCartonCount) + existingItem.singleBottlesCount
      quantityAdded = newTotalUnits - existingTotal
      newTotal = newTotalUnits
    }

    const updatePayload: any = {
      cartons_count: newCartonsTotal,
      per_carton_count: isAdding ? existingItem.perCartonCount : newPerCarton,
      single_bottles_count: newSinglesTotal,
      remaining_quantity: newTotal,
      total_added: (existingItem.totalAdded || 0) + (quantityAdded > 0 ? quantityAdded : 0),
      updated_at: new Date().toISOString(),
      updated_by: authStore.user?.id ?? '',
      unique_key: buildUniqueKey({
        name: existingItem.name,
        code: existingItem.code,
        color: existingItem.color,
        size: existingItem.size,
        warehouseId: existingItem.warehouseId,
      }),
    }
    if (itemData.supplier !== undefined) updatePayload.supplier = itemData.supplier?.trim()
    if (itemData.location !== undefined) updatePayload.item_location = itemData.location?.trim()
    if (itemData.notes !== undefined) updatePayload.notes = itemData.notes?.trim()
    if (itemData.photoUrl !== undefined) updatePayload.photo_url = itemData.photoUrl

    const optimisticUpdated: InventoryItem = {
      ...existingItem,
      cartonsCount: newCartonsTotal,
      perCartonCount: isAdding ? existingItem.perCartonCount : newPerCarton,
      singleBottlesCount: newSinglesTotal,
      remainingQuantity: newTotal,
      totalAdded: updatePayload.total_added,
      updatedAt: new Date(),
      updatedBy: authStore.user?.id ?? '',
      supplier: itemData.supplier?.trim() ?? existingItem.supplier,
      location: itemData.location?.trim() ?? existingItem.location,
      notes: itemData.notes?.trim() ?? existingItem.notes,
      photoUrl: itemData.photoUrl ?? existingItem.photoUrl,
    }
    itemsMap.value.set(existingItem.id, optimisticUpdated)
    itemsByUniqueKey.value.set(updatePayload.unique_key, existingItem.id)

    const { error: updateError } = await supabase.from('items').update(updatePayload).eq('id', existingItem.id)
    if (updateError) throw updateError

    if (quantityAdded !== 0) {
      await supabase.from('transactions').insert({
        type: 'ADD',
        item_id: existingItem.id,
        item_name: existingItem.name,
        item_code: existingItem.code,
        to_warehouse: warehouseId,
        cartons_delta: finalCartons,
        per_carton_updated: newPerCarton,
        single_delta: finalSingles,
        total_delta: quantityAdded,
        new_remaining: newTotal,
        user_id: authStore.user?.id ?? '',
        notes: itemData.notes || `تمت إضافة ${finalCartons} كرتونة و ${finalSingles} فردي`,
        created_by: authStore.user?.name || authStore.user?.email || '',
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
    const warehouseId = itemData.warehouseId
    if (!warehouseId) {
      error.value = 'المخزن مطلوب'
      return { success: false, message: 'المخزن مطلوب' }
    }
    if (!canModifyWarehouse(warehouseId)) {
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
        warehouseId,
      })

      const existingId = itemsByUniqueKey.value.get(uniqueKey)
      if (existingId) {
        const existingItem = itemsMap.value.get(existingId)!
        return await performUpdate(
          existingItem, itemData, finalCartons, finalSingles, newPerCarton, tenantId, warehouseId
        )
      }

      const { data: existingDbItem, error: findError } = await supabase
        .from('items')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('unique_key', uniqueKey)
        .maybeSingle()
      if (findError) throw findError

      if (existingDbItem) {
        const fetched = mapDbItemToInventoryItem(existingDbItem)
        updateLocalItem(fetched)
        return await addItem({ ...itemData, isAddingCartons: true })
      }

      const newItem = {
        name: itemData.name?.trim() ?? '',
        code: itemData.code?.trim() ?? '',
        color: itemData.color?.trim() ?? '',
        size: itemData.size?.trim() ?? '',
        warehouse_id: warehouseId,
        cartons_count: finalCartons,
        per_carton_count: newPerCarton,
        single_bottles_count: finalSingles,
        remaining_quantity: totalQty,
        total_added: totalQty,
        supplier: itemData.supplier?.trim() ?? null,
        item_location: itemData.location?.trim() ?? null,
        notes: itemData.notes?.trim() ?? null,
        photo_url: itemData.photoUrl ?? null,
        created_by: authStore.user?.id ?? '',
        updated_by: authStore.user?.id ?? '',
        tenant_id: tenantId,
        unique_key: uniqueKey,
      }

      const optimisticItem: InventoryItem = {
        id: tempId,
        name: newItem.name,
        code: newItem.code,
        color: newItem.color,
        size: newItem.size,
        warehouseId: newItem.warehouse_id,
        warehouseName: '',
        cartonsCount: newItem.cartons_count,
        perCartonCount: newItem.per_carton_count,
        singleBottlesCount: newItem.single_bottles_count,
        remainingQuantity: newItem.remaining_quantity,
        totalAdded: newItem.total_added,
        supplier: newItem.supplier ?? '',
        location: newItem.item_location ?? '',
        notes: newItem.notes ?? '',
        photoUrl: newItem.photo_url ?? '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: newItem.created_by,
        updatedBy: newItem.updated_by,
        tenantId: newItem.tenant_id,
        created_by_name: authStore.user?.name ?? '',
        updated_by_name: authStore.user?.name ?? '',
      }
      itemsMap.value.set(tempId, optimisticItem)
      itemsByUniqueKey.value.set(uniqueKey, tempId)

      const { data: inserted, error: insertError } = await supabase.from('items').insert(newItem).select().single()
      if (insertError) {
        itemsMap.value.delete(tempId)
        itemsByUniqueKey.value.delete(uniqueKey)
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
        to_warehouse: warehouseId,
        cartons_delta: finalCartons,
        per_carton_updated: newPerCarton,
        single_delta: finalSingles,
        total_delta: totalQty,
        new_remaining: totalQty,
        user_id: authStore.user?.id ?? '',
        notes: convertedCartons > 0 ? `صنف جديد (تم تحويل ${convertedCartons} كرتونة من الفردي)` : 'صنف جديد',
        created_by: authStore.user?.name || authStore.user?.email || '',
        tenant_id: tenantId,
      })

      const realItem = mapDbItemToInventoryItem(inserted)
      itemsMap.value.delete(tempId)
      itemsByUniqueKey.value.delete(uniqueKey)
      itemsMap.value.set(realItem.id, realItem)
      itemsByUniqueKey.value.set(uniqueKey, realItem.id)

      return { success: true, type: 'created', id: realItem.id, item: realItem, quantityAdded: totalQty, message: `تم إنشاء صنف جديد: ${itemData.name}` }
    } catch (err: any) {
      itemsMap.value.delete(tempId)
      const tempKey = buildUniqueKey({
        name: itemData.name,
        code: itemData.code,
        color: itemData.color,
        size: itemData.size,
        warehouseId,
      })
      itemsByUniqueKey.value.delete(tempKey)
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
      const newWarehouseId = itemData.warehouseId ?? existingItem?.warehouseId
      if (!newWarehouseId) throw new Error('Warehouse ID required')
      const newUniqueKey = buildUniqueKey({
        name: itemData.name ?? existingItem?.name,
        code: itemData.code ?? existingItem?.code,
        color: itemData.color ?? existingItem?.color,
        size: itemData.size ?? existingItem?.size,
        warehouseId: newWarehouseId,
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
          updated_by: authStore.user?.id ?? '',
          unique_key: newUniqueKey,
        })
        .eq('id', itemId)
      if (updateError) {
        if (updateError.code === '23505') {
          error.value = 'لا يمكن التحديث لأن هذه القيم تؤدي إلى تكرار صنف موجود في نفس المخزن'
          return false
        }
        throw updateError
      }

      // Insert UPDATE transaction
      const oldQty = originalItem?.remainingQuantity ?? 0
      const newQty = itemData.remainingQuantity ?? oldQty
      const delta = newQty - oldQty
      await supabase.from('transactions').insert({
        type: 'UPDATE',
        item_id: itemId,
        item_name: itemData.name ?? existingItem?.name,
        item_code: itemData.code ?? existingItem?.code,
        to_warehouse: newWarehouseId,
        total_delta: delta,
        new_remaining: newQty,
        user_id: authStore.user?.id ?? '',
        notes: 'تحديث بيانات الصنف',
        created_by: authStore.user?.name || authStore.user?.email || '',
        tenant_id: authStore.currentTenantId,
      })

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

      // Insert DELETE transaction
      if (existingItem) {
        await supabase.from('transactions').insert({
          type: 'DELETE',
          item_id: itemId,
          item_name: existingItem.name,
          item_code: existingItem.code,
          from_warehouse: existingItem.warehouseId,
          total_delta: -existingItem.remainingQuantity,
          new_remaining: 0,
          user_id: authStore.user?.id ?? '',
          notes: 'حذف الصنف',
          created_by: authStore.user?.name || authStore.user?.email || '',
          tenant_id: authStore.currentTenantId,
        })
      }

      return true
    } catch (err: any) {
      if (existingItem) updateLocalItem(existingItem)
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
        p_user_id: authStore.user?.id ?? '',
        p_notes: transferData.notes || '',
        p_tenant_id: authStore.currentTenantId,
      })
      if (transferError) throw transferError

      const updatedSource = await fetchItemById(transferData.item_id)
      if (updatedSource) updateLocalItem(updatedSource)

      if (updatedSource) {
        const destUniqueKey = buildUniqueKey({
          name: updatedSource.name,
          code: updatedSource.code,
          color: updatedSource.color,
          size: updatedSource.size,
          warehouseId: transferData.to_warehouse_id,
        })
        const destId = itemsByUniqueKey.value.get(destUniqueKey)
        if (!destId) {
          const { data: destItem } = await supabase
            .from('items')
            .select('*')
            .eq('tenant_id', authStore.currentTenantId)
            .eq('unique_key', destUniqueKey)
            .maybeSingle()
          if (destItem) {
            const mapped = mapDbItemToInventoryItem(destItem)
            itemsMap.value.set(mapped.id, mapped)
            itemsByUniqueKey.value.set(destUniqueKey, mapped.id)
          }
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
        p_user_id: dispatchData.user_id || authStore.user?.id || '',
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

  async function searchInventorySpark(params: { searchQuery: string; warehouseId?: string | null; limit?: number; strategy?: string }): Promise<InventoryItem[]> {
    const { searchQuery, warehouseId, limit = 50 } = params
    if (!searchQuery || searchQuery.trim().length < 2) return []
    if (searchAbortController) {
      searchAbortController.abort()
    }
    searchAbortController = new AbortController()
    try {
      const { data, error } = await supabase.rpc('search_items', {
        p_tenant_id: authStore.currentTenantId,
        p_query: searchQuery,
        p_warehouse_id: warehouseId || null,
        p_limit: limit,
        p_offset: 0,
        p_allowed_warehouses: getAllowedWarehouses(),
      })
      if (error) throw error
      return (data || []).map(mapDbItemToInventoryItem)
    } catch (err: any) {
      if (err.name === 'AbortError') return []
      console.error('Search error:', err)
      return []
    }
  }

  // Added: fetch accurate transaction totals (no pagination)
  async function fetchTransactionStats(): Promise<{
    total: number;
    add: number;
    update: number;
    delete: number;
    transfer: number;
    dispatch: number;
    totalAddedSum: number;
    totalDispatchedSum: number;
  }> {
    try {
      let query = supabase
        .from('transactions')
        .select('type, total_delta', { count: 'exact' })
        .eq('tenant_id', authStore.currentTenantId)

      if (authStore.isWarehouseManager) {
        const allowed = authStore.user?.allowedWarehouses || []
        if (allowed.length && !allowed.includes('all')) {
          query = query.or(`from_warehouse.in.(${allowed.join(',')}),to_warehouse.in.(${allowed.join(',')})`)
        }
      }
      const { data, error, count } = await query
      if (error) throw error

      const stats = {
        total: count || 0,
        add: 0,
        update: 0,
        delete: 0,
        transfer: 0,
        dispatch: 0,
        totalAddedSum: 0,
        totalDispatchedSum: 0,
      }

      for (const tx of data || []) {
        switch (tx.type) {
          case 'ADD':
            stats.add++
            stats.totalAddedSum += tx.total_delta > 0 ? tx.total_delta : 0
            break
          case 'UPDATE':
            stats.update++
            break
          case 'DELETE':
            stats.delete++
            break
          case 'TRANSFER':
            stats.transfer++
            break
          case 'DISPATCH':
            stats.dispatch++
            stats.totalDispatchedSum += Math.abs(tx.total_delta)
            break
        }
      }
      return stats
    } catch (err) {
      console.error('Error fetching transaction stats:', err)
      return {
        total: 0,
        add: 0,
        update: 0,
        delete: 0,
        transfer: 0,
        dispatch: 0,
        totalAddedSum: 0,
        totalDispatchedSum: 0,
      }
    }
  }

  function setupRealtimeSubscription() {
    if (itemsSubscription) return
    itemsSubscription = supabase
      .channel('items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `tenant_id=eq.${authStore.currentTenantId}` }, async (payload) => {
        const { eventType, new: newRecord, old } = payload
        if (eventType === 'INSERT' && newRecord) {
          const newItem = mapDbItemToInventoryItem(newRecord)
          if (!itemsMap.value.has(newItem.id)) {
            itemsMap.value.set(newItem.id, newItem)
            const key = buildUniqueKey({
              name: newItem.name,
              code: newItem.code,
              color: newItem.color,
              size: newItem.size,
              warehouseId: newItem.warehouseId,
            })
            itemsByUniqueKey.value.set(key, newItem.id)
            totalCount.value++
          }
        } else if (eventType === 'UPDATE' && newRecord) {
          const updatedItem = mapDbItemToInventoryItem(newRecord)
          const oldItem = itemsMap.value.get(updatedItem.id)
          if (oldItem) {
            const oldKey = buildUniqueKey({
              name: oldItem.name,
              code: oldItem.code,
              color: oldItem.color,
              size: oldItem.size,
              warehouseId: oldItem.warehouseId,
            })
            itemsByUniqueKey.value.delete(oldKey)
          }
          itemsMap.value.set(updatedItem.id, updatedItem)
          const newKey = buildUniqueKey({
            name: updatedItem.name,
            code: updatedItem.code,
            color: updatedItem.color,
            size: updatedItem.size,
            warehouseId: updatedItem.warehouseId,
          })
          itemsByUniqueKey.value.set(newKey, updatedItem.id)
        } else if (eventType === 'DELETE' && old) {
          const oldItem = mapDbItemToInventoryItem(old)
          const key = buildUniqueKey({
            name: oldItem.name,
            code: oldItem.code,
            color: oldItem.color,
            size: oldItem.size,
            warehouseId: oldItem.warehouseId,
          })
          itemsByUniqueKey.value.delete(key)
          itemsMap.value.delete(old.id)
          totalCount.value--
        }
      })
      .subscribe()
  }

  watch(
    () => authStore.currentTenantId,
    (tenantId) => {
      if (itemsSubscription) {
        supabase.removeChannel(itemsSubscription)
        itemsSubscription = null
      }
      if (tenantId) {
        setupRealtimeSubscription()
      }
    },
    { immediate: true }
  )

  onScopeDispose(() => {
    if (itemsSubscription) supabase.removeChannel(itemsSubscription)
    if (searchAbortController) searchAbortController.abort()
  })

  loadPersistedSettings()

  return {
    items: itemsList,
    itemsMap,
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
    fetchAlertItems,
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
    fetchTransactionStats,
  }
})
