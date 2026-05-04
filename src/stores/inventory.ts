// stores/inventory.ts
import { defineStore } from 'pinia'
import { ref, computed, onScopeDispose, reactive } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import type { InventoryItem, Transaction } from '@/types'

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
    created_by_name: item.created_by_user?.name || null,
    updated_by_name: item.updated_by_user?.name || null,
  }
}

export const useInventoryStore = defineStore('inventory', () => {
  const authStore = useAuthStore()

  const items = ref<InventoryItem[]>([])
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const pageSize = ref(50)
  const totalCount = ref(0)

  const warehouseCache = new Map<string, { data: InventoryItem[]; timestamp: number }>()
  const CACHE_TTL = 300_000
  let searchAbortController: AbortController | null = null
  let itemsSubscription: any = null

  let lastItemsFetchTime = 0
  let lastItemsFiltersHash = ''

  let lastStatsFetchTime = 0
  let lastStatsFiltersHash = ''
  let cachedStats: {
    totalStock: number
    lowStock: number
    criticalStock: number
    outOfStock: number
  } | null = null

  const summaryStats = reactive({
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

  const totalItems = computed(() => items.value.length)
  const totalQuantity = computed(() => items.value.reduce((sum, i) => sum + (i.remainingQuantity || 0), 0))
  const lowStockItems = computed(() => items.value.filter(i => i.remainingQuantity < 10 && i.remainingQuantity > 0))
  const outOfStockItems = computed(() => items.value.filter(i => i.remainingQuantity === 0))

  const canModifyWarehouse = (warehouseId: string): boolean => {
    if (authStore.isSuperAdmin || authStore.isCompanyManager) return true
    if (authStore.isWarehouseManager) return authStore.canAccessWarehouse(warehouseId)
    return false
  }

  const canDeleteItem = (): boolean => authStore.isSuperAdmin || authStore.isCompanyManager

  function applyWarehouseRestriction<T>(query: T): T {
    if (authStore.isSuperAdmin || authStore.isCompanyManager) return query
    const allowed = authStore.user?.allowedWarehouses || []
    if (allowed.length === 0) return (query as any).in('warehouse_id', ['00000000-0000-0000-0000-000000000000'])
    if (allowed.includes('all')) return query
    return (query as any).in('warehouse_id', allowed)
  }

  function invalidateWarehouseCache(warehouseId?: string) {
    if (warehouseId) warehouseCache.delete(warehouseId)
    else warehouseCache.clear()
  }

  function updateLocalItem(updatedItem: InventoryItem) {
    const idx = items.value.findIndex(i => i.id === updatedItem.id)
    if (idx !== -1) items.value[idx] = { ...updatedItem }
    else items.value.push({ ...updatedItem })
    for (const cacheEntry of warehouseCache.values()) {
      const i = cacheEntry.data.findIndex(i => i.id === updatedItem.id)
      if (i !== -1) cacheEntry.data[i] = { ...updatedItem }
    }
  }

  function removeLocalItem(itemId: string) {
    items.value = items.value.filter(i => i.id !== itemId)
    for (const cacheEntry of warehouseCache.values()) {
      cacheEntry.data = cacheEntry.data.filter(i => i.id !== itemId)
    }
  }

  function reset() {
    items.value = []
    transactions.value = []
    totalCount.value = 0
    currentPage.value = 1
    isLoading.value = false
    error.value = null
    warehouseCache.clear()
    cachedStats = null
    lastItemsFetchTime = 0
    lastItemsFiltersHash = ''
    lastStatsFetchTime = 0
    lastStatsFiltersHash = ''
    summaryStats.totalItems = 0
    summaryStats.totalQuantity = 0
    summaryStats.lowStock = 0
    summaryStats.criticalStock = 0
    summaryStats.outOfStock = 0
    currentFilters.value = { search: '', warehouseId: '', status: '', color: '', size: '' }
    if (searchAbortController) {
      searchAbortController.abort()
      searchAbortController = null
    }
  }

  function getItemsFiltersHash(page: number, pgSize: number, search?: string, warehouseId?: string, status?: string, color?: string, itemSize?: string): string {
    return JSON.stringify({ page, size: pgSize, search: search || '', warehouseId: warehouseId || '', status: status || '', color: color || '', itemSize: itemSize || '' })
  }

  function getStatsFiltersHash(search?: string, warehouseId?: string, color?: string, itemSize?: string): string {
    return JSON.stringify({ search: search || '', warehouseId: warehouseId || '', color: color || '', itemSize: itemSize || '' })
  }

  async function refreshSummaryStats(params?: { search?: string; warehouseId?: string; color?: string; size?: string; force?: boolean }) {
    const stats = await fetchSummaryCounts({
      search: params?.search,
      warehouseId: params?.warehouseId,
      color: params?.color,
      size: params?.size,
      force: params?.force || false
    })
    summaryStats.totalItems = totalCount.value
    summaryStats.totalQuantity = stats.totalStock
    summaryStats.lowStock = stats.lowStock
    summaryStats.criticalStock = stats.criticalStock
    summaryStats.outOfStock = stats.outOfStock
  }

  async function fetchItems(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      let query = supabase
        .from('items')
        .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`)
        .eq('tenant_id', authStore.currentTenantId)
        .order('name')
      query = applyWarehouseRestriction(query)
      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      items.value = (data || []).map(mapDbItemToInventoryItem)
      totalCount.value = items.value.length
      summaryStats.totalItems = totalCount.value
    } catch (err: any) {
      error.value = err.message
      console.error('خطأ في جلب الأصناف:', err)
    } finally {
      isLoading.value = false
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
    append?: boolean
    force?: boolean
  }): Promise<void> {
    const { page, pageSize: pgSize = pageSize.value, search, warehouseId, status, color, size: itemSize, append = false, force = false } = params
    const from = (page - 1) * pgSize
    const to = from + pgSize - 1

    currentFilters.value = { search: search || '', warehouseId: warehouseId || '', status: status || '', color: color || '', size: itemSize || '' }

    const currentHash = getItemsFiltersHash(page, pgSize, search, warehouseId, status, color, itemSize)
    const now = Date.now()
    const cacheValid = !force && lastItemsFetchTime > 0 && (now - lastItemsFetchTime) < 300000 &&
                       lastItemsFiltersHash === currentHash && items.value.length > 0

    if (cacheValid) {
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null
    try {
      let query = supabase
        .from('items')
        .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`, { count: 'exact' })
        .eq('tenant_id', authStore.currentTenantId)
        .order('name')
        .range(from, to)

      if (search && search.trim()) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,size.ilike.%${search}%`)
      if (warehouseId) query = query.eq('warehouse_id', warehouseId)
      if (status === 'in_stock') query = query.gt('remaining_quantity', 500)
      else if (status === 'low_stock') query = query.lte('remaining_quantity', 500).gt('remaining_quantity', 0)
      else if (status === 'critical_stock') query = query.lte('remaining_quantity', 250).gt('remaining_quantity', 0)
      else if (status === 'out_of_stock') query = query.eq('remaining_quantity', 0)
      if (color && color.trim()) query = query.ilike('color', `%${color}%`)
      if (itemSize && itemSize.trim()) query = query.ilike('size', `%${itemSize}%`)

      query = applyWarehouseRestriction(query)

      const { data, count, error: fetchError } = await query
      if (fetchError) throw fetchError
      const mapped = (data || []).map(mapDbItemToInventoryItem)
      if (append) items.value = [...items.value, ...mapped]
      else items.value = mapped
      totalCount.value = count || 0
      currentPage.value = page
      summaryStats.totalItems = totalCount.value

      lastItemsFetchTime = Date.now()
      lastItemsFiltersHash = currentHash

      await refreshSummaryStats({ search, warehouseId, color, size: itemSize })
    } catch (err: any) {
      error.value = err.message
      console.error('خطأ في جلب الأصناف:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSummaryCounts(params: { search?: string; warehouseId?: string; color?: string; size?: string; force?: boolean }): Promise<{
    totalStock: number
    lowStock: number
    criticalStock: number
    outOfStock: number
  }> {
    const { search, warehouseId, color, size: itemSize, force = false } = params

    const currentHash = getStatsFiltersHash(search, warehouseId, color, itemSize)
    const now = Date.now()
    const cacheValid = !force && cachedStats && lastStatsFetchTime > 0 &&
                       (now - lastStatsFetchTime) < 300000 &&
                       lastStatsFiltersHash === currentHash

    if (cacheValid && cachedStats) {
      return cachedStats
    }

    const applyCommonFilters = (query: any) => {
      let q = query.eq('tenant_id', authStore.currentTenantId)
      if (search && search.trim()) q = q.or(`name.ilike.%${search}%,code.ilike.%${search}%,size.ilike.%${search}%`)
      if (warehouseId) q = q.eq('warehouse_id', warehouseId)
      if (color && color.trim()) q = q.ilike('color', `%${color}%`)
      if (itemSize && itemSize.trim()) q = q.ilike('size', `%${itemSize}%`)
      q = applyWarehouseRestriction(q)
      return q
    }

    let totalStockQuery = supabase.from('items').select('remaining_quantity')
    totalStockQuery = applyCommonFilters(totalStockQuery)
    const { data: stockData, error: sumError } = await totalStockQuery
    let totalStock = 0
    if (!sumError && stockData) totalStock = stockData.reduce((acc, row) => acc + (row.remaining_quantity || 0), 0)

    let lowStockQuery = supabase.from('items').select('*', { count: 'exact', head: true })
    lowStockQuery = applyCommonFilters(lowStockQuery).lte('remaining_quantity', 500).gt('remaining_quantity', 0)
    const { count: lowStockCount } = await lowStockQuery

    let criticalStockQuery = supabase.from('items').select('*', { count: 'exact', head: true })
    criticalStockQuery = applyCommonFilters(criticalStockQuery).lte('remaining_quantity', 250).gt('remaining_quantity', 0)
    const { count: criticalStockCount } = await criticalStockQuery

    let outOfStockQuery = supabase.from('items').select('*', { count: 'exact', head: true })
    outOfStockQuery = applyCommonFilters(outOfStockQuery).eq('remaining_quantity', 0)
    const { count: outOfStockCount } = await outOfStockQuery

    const result = {
      totalStock,
      lowStock: lowStockCount || 0,
      criticalStock: criticalStockCount || 0,
      outOfStock: outOfStockCount || 0
    }

    cachedStats = result
    lastStatsFetchTime = Date.now()
    lastStatsFiltersHash = currentHash

    return result
  }

  async function fetchAllItemsForExport(params: { search?: string; warehouseId?: string; status?: string; color?: string; size?: string }): Promise<InventoryItem[]> {
    const { search, warehouseId, status, color, size: itemSize } = params
    try {
      let query = supabase
        .from('items')
        .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`)
        .eq('tenant_id', authStore.currentTenantId)
        .order('name')
      if (search && search.trim()) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,size.ilike.%${search}%`)
      if (warehouseId) query = query.eq('warehouse_id', warehouseId)
      if (status === 'in_stock') query = query.gt('remaining_quantity', 500)
      else if (status === 'low_stock') query = query.lte('remaining_quantity', 500).gt('remaining_quantity', 0)
      else if (status === 'critical_stock') query = query.lte('remaining_quantity', 250).gt('remaining_quantity', 0)
      else if (status === 'out_of_stock') query = query.eq('remaining_quantity', 0)
      if (color && color.trim()) query = query.ilike('color', `%${color}%`)
      if (itemSize && itemSize.trim()) query = query.ilike('size', `%${itemSize}%`)
      query = applyWarehouseRestriction(query)
      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      return (data || []).map(mapDbItemToInventoryItem)
    } catch (err) {
      console.error('خطأ في جلب جميع الأصناف:', err)
      return []
    }
  }

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
      console.error('خطأ في جلب الصنف:', err)
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
      console.error('خطأ في جلب الحركات:', err)
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
      return (data || []).map((tx: any) => ({
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
    } catch (err) {
      console.error('خطأ في البحث عن الحركات:', err)
      return []
    }
  }

  async function getItemsByWarehouse(warehouseId: string): Promise<InventoryItem[]> {
    if (!canModifyWarehouse(warehouseId)) {
      console.warn('محاولة وصول غير مصرح للمخزن:', warehouseId)
      return []
    }
    const cached = warehouseCache.get(warehouseId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data
    let query = supabase
      .from('items')
      .select(`*, warehouses(name)`)
      .eq('tenant_id', authStore.currentTenantId)
      .eq('warehouse_id', warehouseId)
      .gt('remaining_quantity', 0)
      .order('name')
    query = applyWarehouseRestriction(query)
    const { data, error: fetchError } = await query
    if (fetchError) {
      console.error('خطأ في جلب أصناف المخزن:', fetchError)
      return []
    }
    const mapped = (data || []).map(mapDbItemToInventoryItem)
    warehouseCache.set(warehouseId, { data: mapped, timestamp: Date.now() })
    return mapped
  }

  async function addItem(itemData: Partial<InventoryItem> & { isAddingCartons?: boolean; size?: string }): Promise<{
    success: boolean; type?: string; id?: string; message?: string; item?: InventoryItem; quantityAdded?: number
  }> {
    const tenantId = authStore.currentTenantId
    if (!tenantId) throw new Error('لا يوجد مستأجر')
    if (!authStore.user) throw new Error('غير مصرح')
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
      if (totalQty <= 0) throw new Error('الكمية غير صالحة')
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
        const optimisticUpdated = mapDbItemToInventoryItem({
          ...existingItem,
          ...updateData,
          warehouses: { name: existingItem.warehouses?.name },
          created_by_user: { name: existingItem.created_by_user?.name },
          updated_by_user: { name: authStore.user?.name || authStore.user?.email }
        })
        updateLocalItem(optimisticUpdated)
        const { error: updateError } = await supabase.from('items').update(updateData).eq('id', existingItem.id)
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
            notes: itemData.notes || `تمت إضافة ${finalCartons} كرتونة و ${finalSingles} فردي`,
            created_by: authStore.user?.name || authStore.user?.email,
            tenant_id: tenantId
          })
        }
        invalidateWarehouseCache(itemData.warehouseId)
        const { data: refreshed } = await supabase
          .from('items')
          .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`)
          .eq('id', existingItem.id)
          .single()
        if (refreshed) updateLocalItem(mapDbItemToInventoryItem(refreshed))
        return { success: true, type: 'updated', id: existingItem.id, item: items.value.find(i => i.id === existingItem.id), quantityAdded, message: `تم تحديث ${itemData.name}: أضيف ${quantityAdded} وحدة` }
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
        const optimisticItem = mapDbItemToInventoryItem({
          ...newItem,
          id: tempId,
          warehouses: { name: undefined },
          created_by_user: { name: authStore.user?.name || authStore.user?.email },
          updated_by_user: { name: authStore.user?.name || authStore.user?.email }
        })
        items.value.unshift(optimisticItem)
        const { data: inserted, error: insertError } = await supabase.from('items').insert(newItem).select().single()
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
          notes: convertedCartons > 0 ? `صنف جديد (تم تحويل ${convertedCartons} كرتونة من الفردي)` : 'صنف جديد',
          created_by: authStore.user?.name || authStore.user?.email,
          tenant_id: tenantId
        })
        const realItem = mapDbItemToInventoryItem(inserted)
        const index = items.value.findIndex(i => i.id === tempId)
        if (index !== -1) items.value.splice(index, 1, realItem)
        invalidateWarehouseCache(itemData.warehouseId)
        return { success: true, type: 'created', id: inserted.id, item: realItem, quantityAdded: totalQty, message: `تم إنشاء صنف جديد: ${itemData.name}` }
      }
    } catch (err: any) {
      const tempIndex = items.value.findIndex(i => i.id === tempId)
      if (tempIndex !== -1) items.value.splice(tempIndex, 1)
      error.value = err.message
      console.error('خطأ في إضافة الصنف:', err)
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
    const existingItem = items.value.find(i => i.id === itemId)
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
      if (originalItem) updateLocalItem(originalItem)
      error.value = err.message
      console.error('خطأ في تحديث الصنف:', err)
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
    const existingItem = items.value.find(i => i.id === itemId)
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
      invalidateWarehouseCache(existingItem?.warehouseId)
      return true
    } catch (err: any) {
      if (existingItem) items.value.push(existingItem)
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

      // Update source item locally
      const updatedSource = await fetchItemById(transferData.item_id)
      if (updatedSource) {
        updateLocalItem(updatedSource)
      }

      // Update destination – fetch items for destination warehouse and find the matching record
      invalidateWarehouseCache(transferData.to_warehouse_id)
      const destItems = await getItemsByWarehouse(transferData.to_warehouse_id)
      // We don't know which item exactly; the list may contain multiple items with same product.
      // We can try to find an item that matches the source name/code/color/size (since the RPC probably creates/updates an item with those attributes)
      const sourceItem = items.value.find(i => i.id === transferData.item_id)
      if (sourceItem) {
        const matchingDest = destItems.find(
          i => i.name === sourceItem.name && i.code === sourceItem.code && i.color === sourceItem.color && i.size === sourceItem.size
        )
        if (matchingDest) {
          // If already in our items list (maybe not if filtered), update it
          const existingIdx = items.value.findIndex(i => i.id === matchingDest.id)
          if (existingIdx !== -1) {
            items.value[existingIdx] = { ...matchingDest }
          } else {
            // add it only if the current filter allows it (optional)
            // but we don't know; we can add it regardless to keep consistency; pagination may break
            // safer: skip adding if not in list
          }
        }
      }

      return { success: true, transferTotalQuantity: result?.transferred || 0, transactionId: result?.transaction_id, message: `تم نقل ${result?.transferred || 0} وحدة بنجاح` }
    } catch (err: any) {
      error.value = err.message
      console.error('خطأ في نقل الصنف:', err)
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

      // Update source item locally
      const updatedSource = await fetchItemById(dispatchData.item_id)
      if (updatedSource) {
        updateLocalItem(updatedSource)
      }

      invalidateWarehouseCache(dispatchData.from_warehouse_id)

      return { success: true, transactionId: result?.transaction_id, newQuantity: result?.new_remaining, message: `تم صرف ${dispatchData.quantity} وحدة بنجاح` }
    } catch (err: any) {
      error.value = err.message
      console.error('خطأ في صرف الصنف:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function searchInventorySpark(params: { searchQuery: string; warehouseId?: string | null; limit?: number; strategy?: string }): Promise<InventoryItem[]> {
    const { searchQuery, warehouseId, limit = 50 } = params
    if (!searchQuery || searchQuery.trim().length < 2) return []
    if (searchAbortController) searchAbortController.abort()
    searchAbortController = new AbortController()
    try {
      let query = supabase
        .from('items')
        .select(`*, warehouses(name), created_by_user:created_by(name), updated_by_user:updated_by(name)`)
        .eq('tenant_id', authStore.currentTenantId)
        .or(`name.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%,color.ilike.%${searchQuery}%,size.ilike.%${searchQuery}%,supplier.ilike.%${searchQuery}%,item_location.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`)
        .limit(limit)
      if (warehouseId && warehouseId !== 'all') {
        if (!canModifyWarehouse(warehouseId)) return []
        query = query.eq('warehouse_id', warehouseId)
      }
      query = applyWarehouseRestriction(query)
      const { data, error: fetchError } = await query.abortSignal(searchAbortController.signal)
      if (fetchError) throw fetchError
      return (data || []).map(mapDbItemToInventoryItem)
    } catch (err: any) {
      if (err.name === 'AbortError') return []
      console.error('خطأ في البحث:', err)
      return []
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
          if (!items.value.find(i => i.id === newItem.id)) items.value.push(newItem)
        } else if (eventType === 'UPDATE' && newRecord) {
          updateLocalItem(mapDbItemToInventoryItem(newRecord))
        } else if (eventType === 'DELETE' && old) {
          removeLocalItem(old.id)
        }
        const warehouseId = (newRecord as any)?.warehouse_id || (old as any)?.warehouse_id
        if (warehouseId) invalidateWarehouseCache(warehouseId)
      })
      .subscribe()
  }
  if (authStore.currentTenantId) setupRealtimeSubscription()
  onScopeDispose(() => {
    if (itemsSubscription) supabase.removeChannel(itemsSubscription)
    if (searchAbortController) searchAbortController.abort()
  })

  return {
    items,
    transactions,
    isLoading,
    error,
    totalCount,
    totalItems,
    totalQuantity,
    lowStockItems,
    outOfStockItems,
    summaryStats,
    currentFilters,
    fetchItems,
    fetchItemsPage,
    fetchSummaryCounts,
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
    refreshSummaryStats,
    canModifyWarehouse,
    canDeleteItem,
    reset,
  }
})
